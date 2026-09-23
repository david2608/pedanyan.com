import { useCallback, useEffect, useRef, useState } from "react";
import type { ReactNode } from "react";
import "./pullToContinue.css";

// How much overscroll past the very bottom counts as a full pull.
const PULL_DISTANCE = 620;
// Idle time before an unfinished pull relaxes back to zero.
const DECAY_AFTER_MS = 420;
// Trailing trackpad momentum from the page we just left keeps firing wheel
// events for a moment after the new page mounts. Ignore that window.
const ARM_DELAY_MS = 700;

/**
 * End-of-page continuation. Reading to the bottom and continuing to scroll
 * fills the indicator; only a completed pull navigates, so it can never fire
 * by accident. It is also an ordinary link — click, tab and Enter all work,
 * and with reduced motion the pull mechanic is skipped entirely.
 */
export function PullToContinue({
  href,
  kicker,
  title,
  media,
  cursorLabel,
  onNavigate
}: {
  href: string;
  kicker: string;
  title: string;
  media?: ReactNode;
  cursorLabel?: string;
  onNavigate?: () => void;
}) {
  const [progress, setProgress] = useState(0);
  const accRef = useRef(0);
  const firedRef = useRef(false);
  const decayRef = useRef<number | null>(null);
  const rafRef = useRef<number | null>(null);
  const armedRef = useRef(false);

  const go = useCallback(() => {
    if (firedRef.current) return;
    firedRef.current = true;
    setProgress(1);
    document.documentElement.classList.add("dw-page-leaving");
    onNavigate?.();
    window.setTimeout(() => { window.location.href = href; }, 420);
  }, [href, onNavigate]);

  /* `go()` is a real navigation, so the browser would otherwise restore the
     previous scroll offset - which was the very bottom - and the pull would be
     primed again the instant the next page mounted. That chained one case study
     into the next for as long as the wheel kept turning. */
  useEffect(() => {
    if ("scrollRestoration" in window.history) window.history.scrollRestoration = "manual";
  }, []);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const mountedAt = performance.now();

    const atBottom = () =>
      window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 4;

    /* The pull only arms once the page has been somewhere other than the very
       bottom, so arriving at the bottom is always something the reader did. */
    const arm = () => {
      if (!atBottom()) armedRef.current = true;
    };
    arm();

    const relax = () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      const step = () => {
        accRef.current = Math.max(0, accRef.current - PULL_DISTANCE * 0.05);
        setProgress(accRef.current / PULL_DISTANCE);
        if (accRef.current > 0) rafRef.current = requestAnimationFrame(step);
      };
      rafRef.current = requestAnimationFrame(step);
    };

    const scheduleDecay = () => {
      if (decayRef.current) window.clearTimeout(decayRef.current);
      decayRef.current = window.setTimeout(relax, DECAY_AFTER_MS);
    };

    const push = (delta: number) => {
      if (firedRef.current) return;
      if (!armedRef.current || performance.now() - mountedAt < ARM_DELAY_MS) return;
      if (delta <= 0 || !atBottom()) {
        if (delta < 0) {
          accRef.current = Math.max(0, accRef.current + delta * 2);
          setProgress(accRef.current / PULL_DISTANCE);
        }
        return;
      }
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      accRef.current = Math.min(PULL_DISTANCE, accRef.current + delta);
      setProgress(accRef.current / PULL_DISTANCE);
      if (accRef.current >= PULL_DISTANCE) go();
      else scheduleDecay();
    };

    const onWheel = (event: WheelEvent) => push(event.deltaY);

    let touchY: number | null = null;
    const onTouchStart = (event: TouchEvent) => { touchY = event.touches[0]?.clientY ?? null; };
    const onTouchMove = (event: TouchEvent) => {
      const y = event.touches[0]?.clientY;
      if (y == null || touchY == null) return;
      push(touchY - y);
      touchY = y;
    };
    const onTouchEnd = () => { touchY = null; scheduleDecay(); };

    window.addEventListener("scroll", arm, { passive: true });
    window.addEventListener("wheel", onWheel, { passive: true });
    window.addEventListener("touchstart", onTouchStart, { passive: true });
    window.addEventListener("touchmove", onTouchMove, { passive: true });
    window.addEventListener("touchend", onTouchEnd, { passive: true });
    return () => {
      window.removeEventListener("scroll", arm);
      window.removeEventListener("wheel", onWheel);
      window.removeEventListener("touchstart", onTouchStart);
      window.removeEventListener("touchmove", onTouchMove);
      window.removeEventListener("touchend", onTouchEnd);
      if (decayRef.current) window.clearTimeout(decayRef.current);
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      document.documentElement.classList.remove("dw-page-leaving");
    };
  }, [go]);

  const pct = Math.round(progress * 100);

  return (
    <a
      className={`dw-pull-next${progress > 0.02 ? " is-pulling" : ""}${progress >= 1 ? " is-complete" : ""}`}
      href={href}
      style={{ "--pull": progress } as React.CSSProperties}
      data-cursor-label={cursorLabel ?? `go to ${title.toLowerCase()}`}
      aria-label={`${kicker}: ${title}`}
    >
      {media ? <span className="dw-pull-next-media" aria-hidden="true">{media}</span> : null}
      <span className="dw-pull-next-copy">
        <small>{kicker}</small>
        <strong>{title}</strong>
      </span>
      <span className="dw-pull-next-meter" aria-hidden="true">
        <svg viewBox="0 0 44 44">
          <circle className="dw-pull-track" cx="22" cy="22" r="19" />
          <circle className="dw-pull-fill" cx="22" cy="22" r="19" />
        </svg>
        <span className="dw-pull-arrow">&darr;</span>
      </span>
      <span className="dw-pull-next-hint" aria-live="polite">
        {progress >= 1 ? "Opening…" : progress > 0.02 ? `Keep scrolling — ${pct}%` : "Keep scrolling to continue"}
      </span>
    </a>
  );
}
