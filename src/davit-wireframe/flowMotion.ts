import gsap from "gsap";

/* How an exploded-assembly timeline is driven.

   `loop`   — the Work-grid thumbnails. Plays at normal speed while the card is
              in view, pauses when it leaves, repeats forever, and takes itself
              apart between passes so the loop does not cut.

   `scroll` — the case-study heroes. Davit asked for "play slow, but accelerate
              speed with user scroll". The naive reading of that is to map
              timeline POSITION to scroll position, and it is a trap: a reader
              who scrolls fast past the hero gets a smear and never sees the
              settled frame, which is the only frame that sells the case; a
              reader who does not scroll at all sits in front of something that
              looks stuck; trackpad momentum spikes make the stagger jitter; and
              a bounce plays the assembly backwards into debris.

              So scroll drives SPEED, never position. Time only ever moves
              forward: the timeline runs at a slow base rate on its own and
              scrolling adds a boost that decays back to base. Whatever the
              reader does, the timeline arrives at the settled mockup and stays
              there, which keeps the rule that the resting frame is always the
              finished thing. */
export type FlowMotionMode = "loop" | "scroll";

const BASE_RATE = 0.42;   /* unhurried enough to read as ambient, not as a spinner */
const MAX_BOOST = 5.2;    /* a hard ceiling, so a flung trackpad cannot smear it */
const PER_PIXEL = 0.055;  /* scroll distance → boost */
const DECAY = 0.9;        /* per frame, ~0.2s back to base once scrolling stops */

/**
 * Attaches a driver to a built timeline. Returns a disposer.
 */
export function driveFlowTimeline(
  tl: gsap.core.Timeline,
  root: Element,
  mode: FlowMotionMode
): () => void {
  let done = false;

  const io = new IntersectionObserver(
    ([entry]) => {
      /* threshold 0 + rootMargin, never a fractional threshold: an element
         taller than the viewport, or clipped by its edge, never reaches 0.35
         and the callback simply never fires. */
      if (done) return;
      if (entry.isIntersecting) tl.play();
      else tl.pause();
    },
    { threshold: 0, rootMargin: "140px" }
  );
  io.observe(root);

  if (mode === "loop") {
    return () => io.disconnect();
  }

  tl.timeScale(BASE_RATE);

  let boost = 0;
  let lastY = window.scrollY;
  let running = true;

  const onScroll = () => {
    const y = window.scrollY;
    boost = Math.min(boost + Math.abs(y - lastY) * PER_PIXEL, MAX_BOOST);
    lastY = y;
  };

  const tick = () => {
    if (!running) return;
    if (boost > 0.001) {
      boost *= DECAY;
      tl.timeScale(BASE_RATE + boost);
    } else if (boost !== 0) {
      boost = 0;
      tl.timeScale(BASE_RATE);
    }
    /* Once it has settled there is nothing left to accelerate, so stop
       listening rather than run a ticker for the rest of the session — AND
       stop observing. `play()` on a finished, non-repeating timeline rewinds
       it, so leaving the observer attached made the hero re-assemble itself
       every time the reader scrolled back up to it. The resting frame is the
       finished mockup, and it stays that way. */
    if (tl.progress() === 1) stop();
  };

  const stop = () => {
    if (!running) return;
    running = false;
    done = true;
    window.removeEventListener("scroll", onScroll);
    gsap.ticker.remove(tick);
    io.disconnect();
  };

  window.addEventListener("scroll", onScroll, { passive: true });
  gsap.ticker.add(tick);

  return () => {
    stop();
    io.disconnect();
  };
}
