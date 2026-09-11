import { useCallback, useEffect, useRef, useState } from "react";
import { POKE_EVENT, type ClipName, type HoverKind } from "./characterMotion";

/**
 * Test variant of the main character: the six source clips as plain MP4s
 * with the studio background baked in, instead of keyed frame sequences.
 * Same interaction map as characterMotion.ts, but the clock is the video
 * element itself. Enabled with `?hero=video` on the home URL.
 */

const VIDEO_SRC: Record<ClipName, string> = {
  entrance: "/hero-video/entrance.mp4",
  idle: "/hero-video/idle.mp4",
  considering: "/hero-video/considering.mp4",
  approval: "/hero-video/approval.mp4",
  scroll: "/hero-video/scroll.mp4",
  gravity: "/hero-video/gravity.mp4"
};
const ORDER: ClipName[] = ["entrance", "idle", "considering", "approval", "scroll", "gravity"];

const IDLE_REST_MS = 4200;
const HOVER_DEBOUNCE_MS = 450;
const IDLE_INVITE_AFTER_MS = 13_500;
const GRAVITY_RATE = 1.7;

export function HeroCharacterVideo({
  start,
  focus
}: {
  /** The entrance waits for this (the intro handing over the page). */
  start: boolean;
  /** Hovered hero word, mapped to a reaction like the frame driver does. */
  focus: "products" | "designers" | "culture" | null;
}) {
  const videos = useRef<Partial<Record<ClipName, HTMLVideoElement | null>>>({});
  const [state, setState] = useState<ClipName>("entrance");
  const stateRef = useRef<ClipName>("entrance");
  const entered = useRef(false);
  const restTimer = useRef(0);
  const hoverTimer = useRef(0);
  const idleTimer = useRef(0);
  const lastHover = useRef<HoverKind | null>(null);
  const pendingHover = useRef<HoverKind | null>(null);

  const el = (name: ClipName) => videos.current[name] ?? null;
  // Our own pause() calls are expected; a pause we did not ask for (tab
  // hidden, power saving) would otherwise strand a clip mid-way.
  const ownPause = useRef(0);
  const pause = (video: HTMLVideoElement | null | undefined) => {
    if (!video || video.paused) return;
    ownPause.current += 1;
    video.pause();
  };

  const show = useCallback((name: ClipName) => {
    stateRef.current = name;
    setState(name);
  }, []);

  /** Every clip starts on the seated still, so cutting between elements at t=0 is seamless. */
  const goIdle = useCallback(() => {
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
    (name: ClipName) => {
      const video = el(name);
      if (!video) return;
      window.clearTimeout(restTimer.current);
      pause(el(stateRef.current));
      video.currentTime = 0;
      show(name);
      void video.play().catch(() => undefined);
    },
    [show]
  );

  /** Ended handlers: idle rests then breathes again; everything else falls home. */
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
        if (name === "entrance") entered.current = true;
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
      const active = el(stateRef.current);
      if (active && active.paused && !active.ended) goIdle();
    };
    document.addEventListener("visibilitychange", onVisible);
    offs.push(() => document.removeEventListener("visibilitychange", onVisible));
    return () => offs.forEach((off) => off());
  }, [goIdle]);

  /** Entrance on first view. */
  useEffect(() => {
    if (!start || entered.current) return;
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
    if (!entered.current) return;
    idleTimer.current = window.setTimeout(() => {
      if (stateRef.current === "idle") playOnce("scroll");
    }, IDLE_INVITE_AFTER_MS);
  }, [playOnce]);
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
      if (lastHover.current === kind) return;
      const fire = () => {
        lastHover.current = kind;
        if (stateRef.current === "idle") playOnce(kind);
        else if (stateRef.current !== "entrance") pendingHover.current = kind;
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

  /** Gravity: a poke on the character plays it once, fast, then home. */
  useEffect(() => {
    const onPoke = () => {
      if (!entered.current) return;
      if (stateRef.current === "gravity" || stateRef.current === "entrance") return;
      const video = el("gravity");
      if (!video) return;
      window.clearTimeout(restTimer.current);
      window.clearTimeout(hoverTimer.current);
      pendingHover.current = null;
      pause(el(stateRef.current));
      video.currentTime = 0;
      video.playbackRate = GRAVITY_RATE;
      show("gravity");
      void video.play().catch(() => undefined);
    };
    window.addEventListener(POKE_EVENT, onPoke);
    return () => window.removeEventListener(POKE_EVENT, onPoke);
  }, [show]);

  useEffect(
    () => () => {
      window.clearTimeout(restTimer.current);
      window.clearTimeout(hoverTimer.current);
      window.clearTimeout(idleTimer.current);
    },
    []
  );

  return (
    <>
      {ORDER.map((name) => (
        <video
          className={`dw-hero-video${state === name ? " is-active" : ""}`}
          src={VIDEO_SRC[name]}
          muted
          playsInline
          preload="auto"
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
