import { useCallback, useEffect, useMemo, useRef, useState, type RefObject } from "react";

/**
 * Main-character motion driver.
 *
 * Implements the interaction map in context/main-character-motion-handoff.md.
 * The character is never autoplayed: every state is owned by a user event —
 * first view, pointer, hover, idle time, or scroll.
 *
 * Two kinds of clip, because scroll and pointer are two different clocks:
 *
 *   TIMELINE clips  (entrance, gravity)  - have an order. The entrance runs
 *                   once on first view; gravity answers a poke (click) on
 *                   the character.
 *   TRIGGER clips   (considering, approval, scroll invitation) - fired by an
 *                   event, played once at their own pace, then home to idle.
 *
 * Pointer-follow is deliberately NOT a generated clip. It is a few pixels of
 * CSS parallax on the existing frame, per the handoff.
 *
 * Every clip begins and ends on the neutral seated pose (the approved still
 * was pinned as start and end image of every generation), so any state can
 * hard-cut back to idle without a visible jump.
 *
 * Frames are produced by context/character/_pipeline.py: RGB from the
 * Seedance source, alpha from Higgsfield's background remover, one shared
 * crop and grade, 12fps, hold frames collapsed on the reaction clips.
 */

export type ClipName =
  | "entrance"
  | "idle"
  | "considering"
  | "approval"
  | "scroll"
  | "gravity";

type ClipSpec = {
  /** Folder under /hero-frames/ */
  dir: string;
  frames: number;
  /** Milliseconds per frame. The pipeline samples at 12fps = 83ms. */
  frameMs: number;
  /** Owned by a poke, never by a hover. */
  scrubbed?: boolean;
  /** Idle: rest on the calm frame this long between breaths. */
  restMs?: number;
};

export const CLIPS: Record<ClipName, ClipSpec> = {
  entrance: { dir: "entrance", frames: 73, frameMs: 83 },
  idle: { dir: "idle", frames: 49, frameMs: 83, restMs: 4200 },
  considering: { dir: "considering", frames: 28, frameMs: 83 },
  approval: { dir: "approval", frames: 39, frameMs: 83 },
  scroll: { dir: "scroll", frames: 39, frameMs: 83 },
  gravity: { dir: "gravity", frames: 49, frameMs: 50, scrubbed: true }
};

/** Fired on the window when the character is clicked or poked with the keyboard. */
export const POKE_EVENT = "dw-hero-poke";

const framePath = (dir: string, index: number) =>
  `/hero-frames/${dir}/f${String(index + 1).padStart(2, "0")}.webp`;

export function clipFrames(name: ClipName) {
  const spec = CLIPS[name];
  return Array.from({ length: spec.frames }, (_, i) => framePath(spec.dir, i));
}

/** Does this sequence actually exist on disk? */
function probeClip(name: ClipName) {
  return new Promise<boolean>((resolve) => {
    const probe = new Image();
    probe.onload = () => resolve(true);
    probe.onerror = () => resolve(false);
    probe.src = framePath(CLIPS[name].dir, 0);
  });
}

/** Hover debounce, and reaction timings, from the handoff. */
const HOVER_DEBOUNCE_MS = 450;
const IDLE_INVITE_AFTER_MS = 13_500; // "12 to 15 seconds"
const PARALLAX_MAX_PX = 4; // "maximum 4 px head and torso parallax"
const PARALLAX_EASE_MS = 250;

export type CharacterState = ClipName;
export type HoverKind = "considering" | "approval" | "scroll";

// Decoded frames are kept referenced here so the browser cannot evict them
// between states; a swap to an evicted frame would flash blank.
const frameCache = new Map<string, HTMLImageElement>();
function warm(paths: string[]) {
  paths.forEach((path) => {
    if (frameCache.has(path)) return;
    const img = new Image();
    img.decoding = "async";
    img.src = path;
    frameCache.set(path, img);
  });
}

export function useCharacterMotion({
  sectionRef,
  enabled = true,
  start = true
}: {
  sectionRef: RefObject<HTMLElement | null>;
  enabled?: boolean;
  /** The entrance waits for this (the intro handing over the page). */
  start?: boolean;
}) {
  const [reducedMotion, setReducedMotion] = useState(false);
  const [available, setAvailable] = useState<Partial<Record<ClipName, boolean>>>({});
  // Before the entrance runs the character is not in the room: frame 0 of
  // the entrance is the empty stool.
  const [state, setState] = useState<CharacterState>("entrance");
  const [frameIndex, setFrameIndex] = useState(0);
  const [entered, setEntered] = useState(false);

  const stateRef = useRef<CharacterState>("entrance");
  const timers = useRef<number[]>([]);
  const hoverTimer = useRef(0);
  const idleTimer = useRef(0);
  const lastHover = useRef<HoverKind | null>(null);
  const pendingHover = useRef<HoverKind | null>(null);
  const enteredRef = useRef(false);

  useEffect(() => {
    enteredRef.current = entered;
  }, [entered]);

  const setStateSafe = useCallback((next: CharacterState) => {
    stateRef.current = next;
    setState(next);
  }, []);

  const clearTimers = useCallback(() => {
    timers.current.forEach((t) => window.clearTimeout(t));
    timers.current = [];
  }, []);

  useEffect(() => {
    const query = window.matchMedia("(prefers-reduced-motion: reduce)");
    const sync = () => setReducedMotion(query.matches);
    sync();
    query.addEventListener("change", sync);
    return () => query.removeEventListener("change", sync);
  }, []);

  useEffect(() => {
    if (!enabled) return;
    let cancelled = false;
    Promise.all(
      (Object.keys(CLIPS) as ClipName[]).map((name) =>
        probeClip(name).then((ok) => [name, ok] as const)
      )
    ).then((entries) => {
      if (!cancelled) setAvailable(Object.fromEntries(entries));
    });
    return () => {
      cancelled = true;
    };
  }, [enabled]);

  /** Play a trigger clip once, then fall home to idle. */
  const playOnce = useCallback(
    (name: ClipName) => {
      const spec = CLIPS[name];
      if (!available[name] || spec.scrubbed) return;
      clearTimers();
      setStateSafe(name);
      let step = 0;
      setFrameIndex(0);
      const tick = () => {
        step += 1;
        if (step >= spec.frames) {
          setStateSafe("idle");
          setFrameIndex(0);
          return;
        }
        setFrameIndex(step);
        timers.current.push(window.setTimeout(tick, spec.frameMs));
      };
      timers.current.push(window.setTimeout(tick, spec.frameMs));
    },
    [available, clearTimers, setStateSafe]
  );

  /**
   * The breathing loop: one pass, then a still wait on the calm frame, then
   * another pass. The clip lands a hair off its first frame; that cut sits
   * inside the rest, where it reads as a settle rather than a jump.
   */
  useEffect(() => {
    if (!enabled || reducedMotion || state !== "idle") return;
    const spec = CLIPS.idle;
    let step = 0;
    const local: number[] = [];
    const tick = () => {
      step = (step + 1) % spec.frames;
      setFrameIndex(step);
      local.push(window.setTimeout(tick, step === 0 ? spec.restMs ?? spec.frameMs : spec.frameMs));
    };
    local.push(window.setTimeout(tick, spec.restMs ?? spec.frameMs));
    return () => local.forEach((t) => window.clearTimeout(t));
  }, [enabled, reducedMotion, state]);

  /** After a stretch of no interaction, invite the scroll. Once. */
  const bumpIdleTimer = useCallback(() => {
    window.clearTimeout(idleTimer.current);
    if (!enabled || reducedMotion || !enteredRef.current) return;
    idleTimer.current = window.setTimeout(() => {
      if (stateRef.current === "idle") playOnce("scroll");
    }, IDLE_INVITE_AFTER_MS);
  }, [enabled, reducedMotion, playOnce]);

  useEffect(() => {
    bumpIdleTimer();
    return () => window.clearTimeout(idleTimer.current);
  }, [bumpIdleTimer, state, entered]);

  /** A hover that landed mid-clip plays once the character is home again. */
  useEffect(() => {
    if (state !== "idle" || !pendingHover.current) return;
    const kind = pendingHover.current;
    pendingHover.current = null;
    playOnce(kind);
  }, [state, playOnce]);

  /**
   * Hover reactions. Debounced, and only once per hover — so sweeping the
   * pointer across the nav does not machine-gun the character.
   */
  const onHoverIntent = useCallback(
    (kind: HoverKind | null) => {
      window.clearTimeout(hoverTimer.current);
      bumpIdleTimer();
      if (!kind) {
        lastHover.current = null;
        pendingHover.current = null;
        return;
      }
      if (lastHover.current === kind) return;
      const fire = () => {
        lastHover.current = kind;
        if (stateRef.current === "idle") playOnce(kind);
        else if (stateRef.current !== "entrance") pendingHover.current = kind;
      };
      // The scroll invitation answers a scroll, so it is immediate; the
      // hover reactions wait out the debounce.
      if (kind === "scroll") fire();
      else hoverTimer.current = window.setTimeout(fire, HOVER_DEBOUNCE_MS);
    },
    [bumpIdleTimer, playOnce]
  );

  /**
   * Pointer parallax: a few pixels, eased, nothing more. Returned as CSS
   * custom properties so the transform stays on the compositor.
   */
  const [parallax, setParallax] = useState({ x: 0, y: 0 });
  const onPointerMove = useCallback(
    (event: { clientX: number; clientY: number }) => {
      const host = sectionRef.current;
      if (!host || reducedMotion) return;
      const rect = host.getBoundingClientRect();
      const nx = (event.clientX - rect.left) / rect.width - 0.5;
      const ny = (event.clientY - rect.top) / rect.height - 0.5;
      setParallax({
        x: Math.max(-1, Math.min(1, nx * 2)) * PARALLAX_MAX_PX,
        y: Math.max(-1, Math.min(1, ny * 2)) * PARALLAX_MAX_PX
      });
      bumpIdleTimer();
    },
    [sectionRef, reducedMotion, bumpIdleTimer]
  );
  const onPointerLeave = useCallback(() => setParallax({ x: 0, y: 0 }), []);

  /**
   * Gravity: a poke (click / Enter / Space on the character) makes him lose
   * gravity for a beat. Plays once, a touch faster than shot, then home.
   * Interrupts a hover reaction; ignored during the entrance or while it is
   * already playing.
   */
  useEffect(() => {
    if (!enabled || reducedMotion || !available.gravity || !entered) return;
    const onPoke = () => {
      if (stateRef.current === "gravity" || stateRef.current === "entrance") return;
      const spec = CLIPS.gravity;
      clearTimers();
      window.clearTimeout(hoverTimer.current);
      pendingHover.current = null;
      setStateSafe("gravity");
      let step = 0;
      setFrameIndex(0);
      const tick = () => {
        step += 1;
        if (step >= spec.frames) {
          setStateSafe("idle");
          setFrameIndex(0);
          return;
        }
        setFrameIndex(step);
        timers.current.push(window.setTimeout(tick, spec.frameMs));
      };
      timers.current.push(window.setTimeout(tick, spec.frameMs));
    };
    window.addEventListener(POKE_EVENT, onPoke);
    return () => window.removeEventListener(POKE_EVENT, onPoke);
  }, [enabled, reducedMotion, available.gravity, entered, clearTimers, setStateSafe]);

  /** First view: the entrance runs once, then hands over to idle. */
  useEffect(() => {
    if (!enabled || !start || entered) return;
    if (available.entrance === undefined) return; // still probing
    if (reducedMotion || !available.entrance) {
      setEntered(true);
      setStateSafe("idle");
      setFrameIndex(0);
      return;
    }
    const spec = CLIPS.entrance;
    setStateSafe("entrance");
    let step = 0;
    const local: number[] = [];
    const tick = () => {
      step += 1;
      if (step >= spec.frames) {
        setEntered(true);
        setStateSafe("idle");
        setFrameIndex(0);
        return;
      }
      setFrameIndex(step);
      local.push(window.setTimeout(tick, spec.frameMs));
    };
    local.push(window.setTimeout(tick, spec.frameMs));
    return () => local.forEach((t) => window.clearTimeout(t));
  }, [enabled, start, entered, reducedMotion, available.entrance, setStateSafe]);

  useEffect(() => () => clearTimers(), [clearTimers]);

  const src = useMemo(() => {
    const spec = CLIPS[state] ?? CLIPS.idle;
    const index = reducedMotion ? 0 : Math.max(0, Math.min(spec.frames - 1, frameIndex));
    return framePath(spec.dir, index);
  }, [state, frameIndex, reducedMotion]);

  /**
   * Preload in the order the states are needed: the entrance and the idle
   * loop at once, the reactions and gravity a beat after the entrance so
   * they do not compete with it for bandwidth.
   */
  useEffect(() => {
    if (available.entrance) warm(clipFrames("entrance"));
    if (available.idle) warm(clipFrames("idle"));
  }, [available.entrance, available.idle]);
  useEffect(() => {
    if (!entered) return;
    const later = window.setTimeout(() => {
      (["scroll", "considering", "approval", "gravity"] as ClipName[]).forEach((name) => {
        if (available[name]) warm(clipFrames(name));
      });
    }, 800);
    return () => window.clearTimeout(later);
  }, [entered, available]);

  return {
    src,
    state,
    entered,
    reducedMotion,
    available,
    parallax,
    parallaxStyle: {
      "--character-px": `${parallax.x}px`,
      "--character-py": `${parallax.y}px`,
      "--character-ease": `${PARALLAX_EASE_MS}ms`
    } as React.CSSProperties,
    onHoverIntent,
    onPointerMove,
    onPointerLeave
  };
}
