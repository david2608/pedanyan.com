import { useEffect, useRef } from "react";
import type { CSSProperties } from "react";
import "./octagonField.css";

// Deterministic placement, biased to the edges so the octagons frame the
// numbers instead of sitting behind them. x is kept out of the 30–70% band
// except for a few that pass high or low, where the copy never reaches.
type Shard = { x: number; y: number; size: number; delay: number; duration: number; spin: number };

const SHARDS: Shard[] = [
  { x: 6, y: 18, size: 210, delay: 0, duration: 13, spin: -18 },
  { x: 91, y: 26, size: 260, delay: 2.4, duration: 15, spin: 22 },
  { x: 15, y: 68, size: 150, delay: 4.8, duration: 11.5, spin: 8 },
  { x: 84, y: 74, size: 190, delay: 1.2, duration: 14, spin: -12 },
  { x: 2, y: 44, size: 120, delay: 7.1, duration: 12.5, spin: 30 },
  { x: 96, y: 52, size: 140, delay: 5.6, duration: 16, spin: -25 },
  { x: 24, y: 8, size: 96, delay: 9.3, duration: 10.5, spin: 14 },
  { x: 76, y: 92, size: 170, delay: 3.7, duration: 13.5, spin: -8 },
  { x: 46, y: 4, size: 130, delay: 6.2, duration: 15.5, spin: 20 },
  { x: 58, y: 96, size: 110, delay: 8.4, duration: 12, spin: -30 },
  { x: 10, y: 88, size: 240, delay: 10.6, duration: 17, spin: 10 },
  { x: 88, y: 10, size: 100, delay: 11.8, duration: 11, spin: -20 },
  { x: 20, y: 36, size: 78, delay: 13.1, duration: 14.5, spin: 26 },
  { x: 80, y: 44, size: 88, delay: 12.2, duration: 13, spin: -16 }
];

/**
 * Octagons travelling from deep in Z out past the viewer, behind everything,
 * at low opacity. Their pace tracks scroll velocity, so scrolling harder makes
 * the field rush — the numbers read as accelerating rather than just counting.
 */
export function OctagonField() {
  const fieldRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const field = fieldRef.current;
    if (!field) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    let lastY = window.scrollY;
    let velocity = 0;
    let boost = 1;
    let frame = 0;

    // One loop owns --warp. The scroll listener only records how far the page
    // moved since the last frame; the loop turns that into a target and eases
    // towards it — fast to spin up, slow to settle, so the rush has a tail.
    const loop = () => {
      const y = window.scrollY;
      velocity = Math.min(120, Math.abs(y - lastY));
      lastY = y;
      const target = 1 + (velocity / 120) * 2.6;
      boost += (target - boost) * (target > boost ? 0.28 : 0.035);
      field.style.setProperty("--warp", boost.toFixed(3));
      frame = requestAnimationFrame(loop);
    };

    frame = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(frame);
  }, []);

  return (
    <div className="dw-octagon-field" ref={fieldRef} aria-hidden="true">
      {SHARDS.map((shard, index) => (
        <span
          className="dw-octagon"
          key={index}
          style={{
            "--x": `${shard.x}%`,
            "--y": `${shard.y}%`,
            "--size": `${shard.size}px`,
            "--delay": `${-shard.delay}s`,
            "--duration": `${shard.duration}s`,
            "--spin": `${shard.spin}deg`
          } as CSSProperties}
        >
          <svg viewBox="0 0 100 100" focusable="false">
            <polygon points="29.3,0 70.7,0 100,29.3 100,70.7 70.7,100 29.3,100 0,70.7 0,29.3" />
          </svg>
        </span>
      ))}
    </div>
  );
}
