import { useCallback, useEffect, useLayoutEffect, useRef, useState, type RefObject } from "react";
import { createPortal } from "react-dom";
import { POKE_EVENT, type HoverKind } from "./characterMotion";

/**
 * Main character as plain MP4 clips with the studio background baked in
 * (edges feathered in CSS). Same interaction map as characterMotion.ts, but
 * the clock is the video element itself.
 *
 * States: entrance -> idle (breathe, rest, breathe) <-> reactions on hover,
 * scroll invitation on idle time, gravity on a poke. The third poke is one
 * too many: he leaves for the current page view. A refresh always starts
 * with Davit in the chair again.
 */

export type VideoClip = "entrance" | "idle" | "considering" | "approval" | "scroll" | "gravity" | "leave";
type VideoState = VideoClip | "gone";

const ORDER: VideoClip[] = ["entrance", "idle", "considering", "approval", "scroll", "gravity", "leave"];
const BACKGROUND_WARMUP_ORDER: VideoClip[] = ["considering", "approval", "scroll", "gravity", "leave"];

/**
 * 4K HEVC masters for dense screens that can decode them (Safari, and
 * Chrome / Edge / Firefox with a hardware decoder), 1080p H.264 otherwise.
 * Picked once per load.
 */
function pickQuality(): "4k" | "1080" {
  if (typeof window === "undefined" || typeof document === "undefined") return "1080";
  const dpr = window.devicePixelRatio || 1;
  const tallest = Math.max(window.innerHeight, window.innerWidth) * dpr;
  const saveData = (navigator as Navigator & { connection?: { saveData?: boolean } }).connection?.saveData;
  const hevc = document.createElement("video").canPlayType('video/mp4; codecs="hvc1.1.6.L153.B0"');
  const phone = Math.min(window.innerWidth, window.innerHeight) < 700; // the card is small there; 1080p is plenty
  return dpr >= 1.5 && tallest >= 1800 && !phone && !saveData && hevc !== "" ? "4k" : "1080";
}
const QUALITY = pickQuality();
const srcFor = (clip: VideoClip) => (QUALITY === "4k" ? `/hero-video/4k/${clip}.mp4` : `/hero-video/${clip}.mp4`);

/** What he says, in a comic bubble by his face. `yell` gets the jagged tail. */
type BubbleKind = "say" | "yell" | "think";
type Line = { text: string; kind?: BubbleKind };
const LINES: { poke: Line[]; invite: Line } = {
  poke: [
    { text: "Hey. Don't do that." },
    { text: "Seriously, stop." },
    { text: "That's it. I'm out!", kind: "yell" }
  ],
  invite: { text: "There's more below. Scroll." }
};
const BUBBLE_MS = 2600;
/**
 * The tail is the CodePen one: a single ::before box with a rounded corner
 * and three inset shadows, hanging off the bubble's bottom-left, tip at its
 * own bottom-left corner. The box starts TAIL_REACH left of the bubble so
 * the tip lands on the mouth while the body stays beside the head.
 * Phones get a shorter drop so the bubble clears the headline.
 */
const TAIL = {
  /** How far left of the bubble the tip lands (past the cheek). */
  reach: 44,
  reachCompact: 34,
  /** How far below the bubble the tip lands. */
  drop: 36,
  dropCompact: 22,
  /** Width of the tail's root, under the bubble. Halved from the CodePen - a slimmer wedge. */
  root: 12
};
/** Where the mouth is in the 9:16 clip, measured from the approved still. */
const MOUTH = { x: 0.505, y: 0.206 };

/**
 * Where the bubble sits relative to the mouth. The tail always ends on the
 * mouth; the body is up or down, left or right of it. Consecutive lines
 * come from different sides. Phones only use the right-hand ones - the
 * figure bleeds off the left edge there.
 */
type Placement = "up-right" | "down-left" | "up-left" | "down-right";
const PLACEMENTS: Placement[] = ["up-right", "down-left", "up-left", "down-right"];
const PLACEMENTS_COMPACT: Placement[] = ["up-right", "down-right"];
/** Keep the body out of the fixed header and off the screen edges. */
const HEADER_CLEARANCE = 72;
const EDGE_CLEARANCE = 10;
/** The line lands this long after the clip ends - once he has settled. */
const SAY_AFTER_S = 0.12;

const IDLE_REST_MS = 4200;
const HOVER_DEBOUNCE_MS = 450;
const IDLE_INVITE_AFTER_MS = 13_500;
const GRAVITY_RATE = 1.7;
const POKES_BEFORE_LEAVING = 3;
/** Fired on the window when he has left; the hero can drop its poke cursor. */
export const GONE_EVENT = "dw-hero-gone";

/** A page refresh deliberately resets the character to the opening scene. */
export function isHeroGone() {
  return false;
}

export function HeroCharacterVideo({
  start,
  focus,
  bubbleLayer
}: {
  /** The entrance waits for this (the intro handing over the page). */
  start: boolean;
  /** Hovered hero word, mapped to a reaction like the frame driver does. */
  focus: "products" | "designers" | "culture" | null;
  /**
   * Where the bubble renders: a layer above the headline (the figure sits
   * under the headline on phones, so a bubble inside it would be covered).
   */
  bubbleLayer?: RefObject<HTMLElement | null>;
}) {
  const videos = useRef<Partial<Record<VideoClip, HTMLVideoElement | null>>>({});
  const [gone, setGone] = useState(false);
  const [state, setState] = useState<VideoState>("entrance");
  const [warmedClips, setWarmedClips] = useState<Partial<Record<VideoClip, true>>>({
    entrance: true,
    idle: true
  });
  const stateRef = useRef<VideoState>(state);
  const entered = useRef(gone);
  const pokes = useRef(0);
  const restTimer = useRef(0);
  const hoverTimer = useRef(0);
  const idleTimer = useRef(0);
  const lastHover = useRef<HoverKind | null>(null);
  const pendingHover = useRef<HoverKind | null>(null);

  const [bubble, setBubble] = useState<{ line: Line; key: number; at: Placement } | null>(null);
  const bubbleTimer = useRef(0);
  const sayTimer = useRef(0);
  const placementIndex = useRef(0);
  const say = useCallback((line: Line, holdMs = BUBBLE_MS) => {
    window.clearTimeout(bubbleTimer.current);
    const options = window.innerWidth < 900 ? PLACEMENTS_COMPACT : PLACEMENTS;
    const at = options[placementIndex.current % options.length];
    placementIndex.current += 1;
    setBubble({ line, key: Date.now(), at });
    bubbleTimer.current = window.setTimeout(() => setBubble(null), holdMs);
  }, []);
  /** Say it once the clip reaches SAY_AT of its (rate-adjusted) length. */
  const sayLater = useCallback(
    (line: Line, video: HTMLVideoElement | null, rate = 1, holdMs = BUBBLE_MS) => {
      window.clearTimeout(sayTimer.current);
      const seconds = ((video && video.duration) || 4) / rate;
      sayTimer.current = window.setTimeout(() => say(line, holdMs), (seconds + SAY_AFTER_S) * 1000);
    },
    [say]
  );
  useEffect(() => {
    // Dev only: let the console (or a test) put a line up for a while.
    if (!/^(localhost|127\.0\.0\.1)$/.test(window.location.hostname)) return;
    (window as unknown as { __heroSay?: (text: string, kind?: BubbleKind, ms?: number, at?: number) => void }).__heroSay = (
      text,
      kind,
      ms = 60_000,
      at
    ) => {
      if (at !== undefined) placementIndex.current = at;
      say({ text, kind }, ms);
    };
  }, [say]);

  const hush = useCallback(() => {
    window.clearTimeout(sayTimer.current);
    window.clearTimeout(bubbleTimer.current);
    setBubble(null);
  }, []);

  const el = (name: VideoClip) => videos.current[name] ?? null;
  const active = () => (stateRef.current === "gone" ? null : el(stateRef.current));

  // Our own pause() calls are expected; a pause we did not ask for (tab
  // hidden, power saving) would otherwise strand a clip mid-way.
  const ownPause = useRef(0);
  const pause = (video: HTMLVideoElement | null | undefined) => {
    if (!video || video.paused) return;
    ownPause.current += 1;
    video.pause();
  };

  const show = useCallback((name: VideoState) => {
    stateRef.current = name;
    setState(name);
  }, []);

  /** Every clip starts on the seated still, so cutting between elements at t=0 is seamless. */
  const goIdle = useCallback(() => {
    if (stateRef.current === "gone") return;
    window.clearTimeout(restTimer.current);
    const idle = el("idle");
    if (idle) {
      pause(idle);
      idle.currentTime = 0;
    }
    show("idle");
    restTimer.current = window.setTimeout(() => {
      if (stateRef.current === "idle") void el("idle")?.play().catch(() => undefined);
    }, IDLE_REST_MS);
  }, [show]);

  const playOnce = useCallback(
    (name: VideoClip, rate = 1) => {
      const video = el(name);
      if (!video || stateRef.current === "gone") return;
      window.clearTimeout(restTimer.current);
      pause(active());
      video.currentTime = 0;
      video.playbackRate = rate;
      show(name);
      void video.play().catch(() => undefined);
    },
    [show]
  );

  /** He has left: the last frame of the leave clip (the empty stool) stays for the session. */
  const parkOnEmptyStool = useCallback(() => {
    const leave = el("leave");
    if (!leave) return;
    const park = () => {
      leave.currentTime = Math.max(0, (leave.duration || 6) - 0.04);
    };
    if (leave.readyState >= 1) park();
    else leave.addEventListener("loadedmetadata", park, { once: true });
  }, []);

  const settleGone = useCallback(() => {
    window.clearTimeout(restTimer.current);
    window.clearTimeout(hoverTimer.current);
    window.clearTimeout(idleTimer.current);
    pendingHover.current = null;
    ORDER.forEach((name) => pause(el(name)));
    parkOnEmptyStool();
    setGone(true);
    show("gone");
    window.dispatchEvent(new CustomEvent(GONE_EVENT));
  }, [show, parkOnEmptyStool]);

  useEffect(() => {
    if (!gone) return;
    parkOnEmptyStool();
    window.dispatchEvent(new CustomEvent(GONE_EVENT));
  }, [gone, parkOnEmptyStool]);

  useEffect(() => {
    const connection = (navigator as Navigator & { connection?: { saveData?: boolean } }).connection;
    if (connection?.saveData) return;

    const timers: number[] = [];
    const warmBackgroundClips = () => {
      BACKGROUND_WARMUP_ORDER.forEach((name, index) => {
        timers.push(
          window.setTimeout(() => {
            setWarmedClips((current) => (current[name] ? current : { ...current, [name]: true }));
          }, 240 + index * 1100)
        );
      });
    };

    window.addEventListener("dw-home-intro-complete", warmBackgroundClips, { once: true });
    return () => {
      window.removeEventListener("dw-home-intro-complete", warmBackgroundClips);
      timers.forEach((timer) => window.clearTimeout(timer));
    };
  }, []);

  /** Ended / pause handlers: idle rests then breathes again; everything else falls home. */
  useEffect(() => {
    const offs: Array<() => void> = [];
    ORDER.forEach((name) => {
      const video = el(name);
      if (!video) return;
      const onEnded = () => {
        if (stateRef.current !== name) return;
        if (name === "idle") {
          video.currentTime = 0;
          restTimer.current = window.setTimeout(() => {
            if (stateRef.current === "idle") void video.play().catch(() => undefined);
          }, IDLE_REST_MS);
          return;
        }
        if (name === "leave") {
          settleGone();
          return;
        }
        if (name === "entrance") entered.current = true;
        if (name === "gravity" && pokes.current >= POKES_BEFORE_LEAVING) {
          playOnce("leave");
          return;
        }
        goIdle();
      };
      const onPause = () => {
        if (ownPause.current > 0) {
          ownPause.current -= 1;
          return;
        }
        if (stateRef.current !== name || video.ended) return;
        // Paused from outside mid-clip: fall home rather than freeze.
        if (name === "entrance") entered.current = true;
        if (name === "leave") {
          settleGone();
          return;
        }
        if (name === "gravity" && pokes.current >= POKES_BEFORE_LEAVING) {
          playOnce("leave");
          return;
        }
        goIdle();
      };
      video.addEventListener("ended", onEnded);
      video.addEventListener("pause", onPause);
      offs.push(() => {
        video.removeEventListener("ended", onEnded);
        video.removeEventListener("pause", onPause);
      });
    });
    const onVisible = () => {
      if (document.visibilityState !== "visible" || !entered.current) return;
      const video = active();
      if (video && video.paused && !video.ended) goIdle();
    };
    document.addEventListener("visibilitychange", onVisible);
    offs.push(() => document.removeEventListener("visibilitychange", onVisible));
    return () => offs.forEach((off) => off());
  }, [goIdle, playOnce, settleGone]);

  /** Entrance on first view. */
  useEffect(() => {
    if (!start || entered.current || stateRef.current === "gone") return;
    const video = el("entrance");
    if (!video) return;
    show("entrance");
    video.currentTime = 0;
    void video.play().catch(() => {
      entered.current = true;
      goIdle();
    });
  }, [start, show, goIdle]);

  /** A hover that landed mid-clip plays once the character is home again. */
  useEffect(() => {
    if (state !== "idle" || !pendingHover.current) return;
    const kind = pendingHover.current;
    pendingHover.current = null;
    playOnce(kind);
  }, [state, playOnce]);

  const bumpIdleTimer = useCallback(() => {
    window.clearTimeout(idleTimer.current);
    if (!entered.current || stateRef.current === "gone") return;
    idleTimer.current = window.setTimeout(() => {
      if (stateRef.current !== "idle") return;
      playOnce("scroll");
      sayLater(LINES.invite, el("scroll"));
    }, IDLE_INVITE_AFTER_MS);
  }, [playOnce, sayLater]);
  useEffect(() => {
    bumpIdleTimer();
    return () => window.clearTimeout(idleTimer.current);
  }, [bumpIdleTimer, state]);

  const onHoverIntent = useCallback(
    (kind: HoverKind | null) => {
      window.clearTimeout(hoverTimer.current);
      bumpIdleTimer();
      if (!kind) {
        lastHover.current = null;
        pendingHover.current = null;
        return;
      }
      if (lastHover.current === kind || stateRef.current === "gone") return;
      const fire = () => {
        lastHover.current = kind;
        if (stateRef.current === "idle") playOnce(kind);
        else if (stateRef.current !== "entrance" && stateRef.current !== "leave" && stateRef.current !== "gone") pendingHover.current = kind;
      };
      if (kind === "scroll") fire();
      else hoverTimer.current = window.setTimeout(fire, HOVER_DEBOUNCE_MS);
    },
    [bumpIdleTimer, playOnce]
  );

  useEffect(() => {
    const onPose = (event: Event) => {
      const pose = (event as CustomEvent<"idk" | "good" | "scroll" | null>).detail ?? null;
      onHoverIntent(pose === "idk" ? "considering" : pose === "good" ? "approval" : pose === "scroll" ? "scroll" : null);
    };
    window.addEventListener("dw-hero-pose", onPose);
    return () => window.removeEventListener("dw-hero-pose", onPose);
  }, [onHoverIntent]);

  useEffect(() => {
    onHoverIntent(focus === "designers" ? "considering" : focus === "culture" ? "approval" : null);
  }, [focus, onHoverIntent]);

  /** Gravity: a poke plays it once, fast, then home. The third poke sends him off. */
  useEffect(() => {
    const onPoke = () => {
      if (!entered.current) return;
      const current = stateRef.current;
      if (current === "gravity" || current === "entrance" || current === "leave" || current === "gone") return;
      pokes.current += 1;
      window.clearTimeout(hoverTimer.current);
      pendingHover.current = null;
      playOnce("gravity", GRAVITY_RATE);
      const last = pokes.current >= POKES_BEFORE_LEAVING;
      sayLater(LINES.poke[Math.min(pokes.current, LINES.poke.length) - 1], el("gravity"), GRAVITY_RATE, last ? 4200 : BUBBLE_MS);
    };
    window.addEventListener(POKE_EVENT, onPoke);
    return () => window.removeEventListener(POKE_EVENT, onPoke);
  }, [playOnce, sayLater]);

  useEffect(
    () => () => {
      window.clearTimeout(restTimer.current);
      window.clearTimeout(hoverTimer.current);
      window.clearTimeout(idleTimer.current);
    },
    []
  );

  useEffect(() => {
    if (state === "gone" || state === "considering" || state === "approval") hush();
  }, [state, hush]);

  /**
   * Pin the tail tip to the mouth. The bubble lives in a layer over the hero
   * screen, so its position is measured from the visible clip's box: mouth =
   * (49.2%, 20.6%) of it; the bubble sits TAIL.reach to the right and
   * TAIL.drop above that, and the tail bridges the gap.
   */
  const bubbleRef = useRef<HTMLSpanElement | null>(null);
  const placeBubble = useCallback(() => {
    const el = bubbleRef.current;
    const layer = bubbleLayer?.current;
    const video = active() ?? videos.current.idle;
    if (!el || !layer || !video) return;
    const box = video.getBoundingClientRect();
    const host = layer.getBoundingClientRect();
    const mouthX = box.left - host.left + box.width * MOUTH.x;
    const mouthY = box.top - host.top + box.height * MOUTH.y;
    const compact = window.innerWidth < 900;
    const reach = compact ? TAIL.reachCompact : TAIL.reach;
    const drop = compact ? TAIL.dropCompact : TAIL.drop;
    el.style.setProperty("--tail-reach", `${reach}px`);
    el.style.setProperty("--tail-drop", `${drop}px`);
    el.style.setProperty("--tail-w", `${reach + TAIL.root}px`);
    // The tail tip is the box corner nearest the mouth; put that corner on the mouth.
    const position = (at: Placement) => {
      const right = at.endsWith("right");
      const up = at.startsWith("up");
      return {
        left: right ? mouthX + reach : mouthX - reach - el.offsetWidth,
        top: up ? mouthY - drop - el.offsetHeight : mouthY + drop
      };
    };
    // A side that would run into the header or off the screen hands over
    // to the next one; up-right is the last resort.
    // ...and never over the headline.
    const headline = layer.parentElement?.querySelector<HTMLElement>(".dw-home-hero-statement")?.getBoundingClientRect();
    const clearOfHeadline = ({ left, top }: { left: number; top: number }) => {
      if (!headline) return true;
      const l = left + host.left, t = top + host.top, r = l + el.offsetWidth, b = t + el.offsetHeight;
      return r < headline.left || l > headline.right || b < headline.top || t > headline.bottom;
    };
    const fits = (p: { left: number; top: number }) =>
      p.top >= HEADER_CLEARANCE &&
      p.left >= EDGE_CLEARANCE &&
      p.left + el.offsetWidth <= host.width - EDGE_CLEARANCE &&
      p.top + el.offsetHeight <= host.height - EDGE_CLEARANCE &&
      clearOfHeadline(p);
    const wanted = el.dataset.at as Placement;
    const order = [wanted, ...PLACEMENTS.filter((p) => p !== wanted)];
    const at = order.find((p) => fits(position(p))) ?? "up-right";
    if (at !== wanted) {
      setBubble((current) => (current && current.at !== at ? { ...current, at } : current));
      return;
    }
    const { left, top } = position(at);
    el.style.left = `${Math.round(left)}px`;
    el.style.top = `${Math.round(top)}px`;
  }, [bubbleLayer]);

  useLayoutEffect(() => {
    if (!bubble) return;
    // The figure drifts under the pointer (parallax) and with the home
    // timeline, so follow it frame by frame while the bubble is up.
    let raf = 0;
    const follow = () => {
      placeBubble();
      raf = window.requestAnimationFrame(follow);
    };
    follow();
    return () => window.cancelAnimationFrame(raf);
  }, [bubble, placeBubble]);

  useEffect(
    () => () => {
      window.clearTimeout(bubbleTimer.current);
      window.clearTimeout(sayTimer.current);
    },
    []
  );

  // Gone: the leave element, parked on its last frame, is the empty stool.
  const visible: VideoClip | null = state === "gone" ? "leave" : state;

  const kind: BubbleKind = bubble?.line.kind ?? "say";
  const bubbleNode =
    bubble && state !== "gone" ? (
      <span className={`dw-hero-bubble is-${kind} at-${bubble.at}`} data-at={bubble.at} role="status" key={bubble.key} ref={bubbleRef}>
        {bubble.line.text}
      </span>
    ) : null;

  return (
    <>
      {bubbleNode && (bubbleLayer?.current ? createPortal(bubbleNode, bubbleLayer.current) : bubbleNode)}
      {ORDER.map((name) => (
        <video
          className={`dw-hero-video${visible === name ? " is-active" : ""}`}
          src={srcFor(name)}
          muted
          playsInline
          preload={warmedClips[name] ? "auto" : "none"}
          disablePictureInPicture
          aria-hidden={name !== "idle"}
          aria-label={name === "idle" ? "Davit Pedanyan seated on a studio stool" : undefined}
          ref={(element) => {
            videos.current[name] = element;
          }}
          key={name}
        />
      ))}
    </>
  );
}
