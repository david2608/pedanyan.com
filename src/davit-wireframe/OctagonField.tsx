import { useEffect, useRef } from "react";
import "./octagonField.css";

// One octagon at a time. Each starts far away, grows past the viewport and
// passes the viewer, with the next already closing in behind it — the sensation
// of travelling towards an object and through it, not of confetti drifting by.
// Three, not a field: one is passing the viewer at any moment, one is closing
// in, and one is a faint hint far off. Any more and it stops being an object
// you travel through and becomes scenery drifting by.
const SHARDS = 3;
const CYCLE = 6.6; // seconds for one octagon to travel from far to past the viewer

export function OctagonField() {
  const fieldRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const field = fieldRef.current;
    if (!field) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    let lastY = window.scrollY;
    let boost = 1;
    let frame = 0;

    // Scroll velocity drives the approach speed: the harder you scroll, the
    // faster you fly through them.
    const loop = () => {
      const y = window.scrollY;
      const velocity = Math.min(120, Math.abs(y - lastY));
      lastY = y;
      const target = 1 + (velocity / 120) * 2.2;
      boost += (target - boost) * (target > boost ? 0.22 : 0.03);
      field.style.setProperty("--warp", boost.toFixed(3));
      frame = requestAnimationFrame(loop);
    };

    frame = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(frame);
  }, []);

  return (
    <div className="dw-octagon-field" ref={fieldRef} aria-hidden="true">
      {Array.from({ length: SHARDS }, (_, index) => (
        <span
          className="dw-octagon"
          key={index}
          style={{ animationDelay: `${-(index * CYCLE) / SHARDS}s` }}
        >
          <svg viewBox="0 0 100 100" preserveAspectRatio="none" focusable="false">
            <polygon points="29.3,0 70.7,0 100,29.3 100,70.7 70.7,100 29.3,100 0,70.7 0,29.3" />
          </svg>
        </span>
      ))}
    </div>
  );
}
