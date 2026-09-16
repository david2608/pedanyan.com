import { useEffect, useRef, useState } from "react";
import { LigaPhone } from "./ligaScreens";
import "./ligaCase.css";

/**
 * LIGA: the problem, staged.
 *
 * The old journey - a phone call from the side of the road - sits in front and
 * then recedes, while the first step of the roadside report rises over it.
 *
 * The report is the real screen: the coded step-1 phone, built from the design
 * file's own values and assets. Only the hotline card is drawn by hand, because
 * the thing it depicts - a queue on a phone line - was never a screen.
 */
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

  // 1 the call card lands, 2 it recedes and the report rises and starts playing
  useEffect(() => {
    if (!active) {
      setStep(0);
      return;
    }
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setStep(2);
      return;
    }
    const timers: number[] = [];
    timers.push(window.setTimeout(() => setStep(1), 420));
    timers.push(window.setTimeout(() => setStep(2), 1340));
    return () => timers.forEach((t) => window.clearTimeout(t));
  }, [active]);

  return (
    <div className={`lg-story${active ? " is-active" : ""}`} ref={ref} aria-hidden="true">
      <div className={`lg-ui lg-call${step >= 1 ? " is-in" : ""}${step >= 2 ? " is-back" : ""}`}>
        <span className="lg-call-head">
          <span className="lg-call-dial"><i /><i /><i /></span>
          <span>
            <strong>Liga hotline</strong>
            <small>Calling&hellip;</small>
          </span>
        </span>
        <p className="lg-call-queue">You are <b>7th</b> in the queue</p>
        <span className="lg-call-bar"><i /></span>
        <p className="lg-call-note">Please have your policy number ready</p>
      </div>

      <div className={`lg-report${step >= 2 ? " is-in" : ""}`}>
        <LigaPhone screen="photos" active={step >= 2} />
      </div>
    </div>
  );
}
