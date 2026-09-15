import { useEffect, useRef, useState } from "react";
import "./ligaCase.css";

/**
 * LIGA: the problem, staged.
 *
 * The old journey - a phone call from the side of the road - sits in front and
 * then recedes, while the first step of the roadside report rises over it and
 * starts filling itself in. Code, not an image, so it plays on arrival and
 * stays sharp; the palette is the product's own (canvas #f6f7fa, red #da2c43).
 */

function Steps({ active }: { active: number }) {
  return (
    <span className="lg-steps" aria-hidden="true">
      {[0, 1, 2, 3].map((i) => <i key={i} className={i < active ? "is-on" : ""} />)}
    </span>
  );
}

/** Two cars, stopped where they stopped - the photo the assessor actually needs. */
function CarGuide() {
  return (
    <svg className="lg-guide-art" viewBox="0 0 220 96" aria-hidden="true">
      <g className="lg-car lg-car-a">
        <path d="M18 62c0-4 3-7 6-9l8-16c2-4 6-6 10-6h30c5 0 9 2 12 6l10 16c4 2 6 5 6 9v10a4 4 0 0 1-4 4H22a4 4 0 0 1-4-4z" />
        <path className="lg-glass" d="M40 41l6-11c1-2 3-3 5-3h26c2 0 4 1 5 3l7 11z" />
        <circle className="lg-wheel" cx="36" cy="76" r="7" />
        <circle className="lg-wheel" cx="84" cy="76" r="7" />
      </g>
      <g className="lg-car lg-car-b">
        <path d="M118 62c0-4 3-7 6-9l8-16c2-4 6-6 10-6h30c5 0 9 2 12 6l10 16c4 2 6 5 6 9v10a4 4 0 0 1-4 4h-74a4 4 0 0 1-4-4z" />
        <path className="lg-glass" d="M140 41l6-11c1-2 3-3 5-3h26c2 0 4 1 5 3l7 11z" />
        <circle className="lg-wheel" cx="136" cy="76" r="7" />
        <circle className="lg-wheel" cx="184" cy="76" r="7" />
      </g>
    </svg>
  );
}

export function LigaStoryPlate() {
  const ref = useRef<HTMLDivElement | null>(null);
  const [active, setActive] = useState(false);
  const [step, setStep] = useState(0);

  useEffect(() => {
    const host = ref.current;
    if (!host || typeof IntersectionObserver === "undefined") {
      setActive(true);
      return;
    }
    const io = new IntersectionObserver(([entry]) => setActive(entry.isIntersecting), { threshold: 0.4 });
    io.observe(host);
    return () => io.disconnect();
  }, []);

  // 1 call card, 2 report rises, 3 guide, 4 photos land, 5 saved, 6 continue
  useEffect(() => {
    if (!active) {
      setStep(0);
      return;
    }
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setStep(6);
      return;
    }
    const timers: number[] = [];
    let n = 0;
    const tick = () => {
      n += 1;
      setStep(n);
      if (n < 6) timers.push(window.setTimeout(tick, n === 1 ? 900 : 620));
    };
    timers.push(window.setTimeout(tick, 420));
    return () => timers.forEach((t) => window.clearTimeout(t));
  }, [active]);

  return (
    <div className={`lg-story${active ? " is-active" : ""}`} ref={ref} aria-hidden="true">
      <div className={`lg-ui lg-call${step >= 1 ? " is-in" : ""}${step >= 2 ? " is-back" : ""}`}>
        <span className="lg-call-head">
          <span className="lg-call-dial"><i /><i /><i /></span>
          <span>
            <strong>Liga hotline</strong>
            <small>Calling…</small>
          </span>
        </span>
        <p className="lg-call-queue">You are <b>7th</b> in the queue</p>
        <span className="lg-call-bar"><i /></span>
        <p className="lg-call-note">Please have your policy number ready</p>
      </div>

      <div className={`lg-ui lg-report${step >= 2 ? " is-in" : ""}`}>
        <span className="lg-report-head">
          <span>
            <strong>Register accident</strong>
            <small>Step 1/4 · Accident photos</small>
          </span>
          <Steps active={1} />
        </span>
        <p className="lg-report-rule">Photos showing the mutual positions of the two vehicles involved</p>
        <div className={`lg-guide${step >= 3 ? " is-in" : ""}`}>
          <span className="lg-guide-label">Image guide</span>
          <CarGuide />
        </div>
        <div className={`lg-shots${step >= 4 ? " is-in" : ""}`}>
          <span className="lg-shot is-one" />
          <span className="lg-shot is-two" />
          <span className="lg-shot is-add">+</span>
        </div>
        <span className={`lg-saved${step >= 5 ? " is-in" : ""}`}>
          <svg viewBox="0 0 12 10"><path d="M1.5 5.2 4.4 8l6-6.4" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" /></svg>
          Saved
        </span>
        <span className={`lg-cta${step >= 6 ? " is-in" : ""}`}>Continue</span>
      </div>
    </div>
  );
}
