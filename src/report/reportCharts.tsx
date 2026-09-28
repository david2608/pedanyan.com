import { useEffect, useRef } from "react";
import { REDUCED, useInView } from "./reportKit";

/* =============================================================================
   Charts, drawn by hand in SVG.

   No chart library: half of what this report needs — dumbbells, waffles, a
   butterfly, a log-scale pin line, a unit chart — are custom shapes in every
   library anyway, and the ones that come free (a bar, a line) are twenty lines
   of SVG. The trade is that every mark here is explicit, which is what a page
   about disputed numbers needs.

   Shared conventions:
   - gridlines 1px at 8% ink, no chart frame;
   - estimates carry the hatch pattern and a dashed outline;
   - bars grow from zero once, 400ms, staggered 30ms, and not at all under
     prefers-reduced-motion;
   - every <title> under a mark is its hover tooltip, which is also what a
     screen reader announces.
   ============================================================================= */

export function Hatch({ id, color }: { id: string; color: string }) {
  return (
    <defs>
      <pattern id={id} width="6" height="6" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
        <rect width="6" height="6" fill={color} fillOpacity="0.16" />
        <line x1="0" y1="0" x2="0" y2="6" stroke={color} strokeWidth="2" strokeOpacity="0.55" />
      </pattern>
    </defs>
  );
}

/** One dot per designer. 6,400 of them, and the last 800 fade as the reader
 *  scrolls the hero — the only animation on the page that carries a number. */
export function DotMatrix({ total, lost, columns = 160 }: { total: number; lost: number; columns?: number }) {
  const hostRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const host = hostRef.current;
    if (!host) return;
    if (REDUCED()) { host.style.setProperty("--gone", "1"); return; }
    const read = () => {
      const rect = host.getBoundingClientRect();
      /* Fades across the second half of the element's own travel through the
         viewport, so the drop happens while the reader is looking at it. */
      const raw = (window.innerHeight * 0.75 - rect.top) / Math.max(1, rect.height);
      host.style.setProperty("--gone", String(Math.min(1, Math.max(0, raw))));
    };
    read();
    window.addEventListener("scroll", read, { passive: true });
    window.addEventListener("resize", read);
    return () => {
      window.removeEventListener("scroll", read);
      window.removeEventListener("resize", read);
    };
  }, []);

  const rows = Math.ceil(total / columns);
  const kept = total - lost;

  return (
    <div className="rp-matrix" ref={hostRef} role="img" aria-label={`${total.toLocaleString("en-US")} dots, one per designer; ${lost} of them fade out`}>
      <svg viewBox={`0 0 ${columns * 8} ${rows * 8}`} preserveAspectRatio="xMidYMid meet">
        {Array.from({ length: total }, (_, index) => {
          const x = (index % columns) * 8 + 4;
          const y = Math.floor(index / columns) * 8 + 4;
          const leaving = index >= kept;
          return (
            <circle
              key={index}
              cx={x}
              cy={y}
              r={2.1}
              className={leaving ? "rp-dot is-leaving" : "rp-dot"}
              style={leaving ? { ["--i" as string]: String((index - kept) / lost) } : undefined}
            />
          );
        })}
      </svg>
    </div>
  );
}

/** A horizontal bar row: the report's default shape. Labels sit at the bar's
 *  end rather than in a legend, so nothing has to be decoded. */
export function BarRows({
  data, max, color, format, estimate
}: {
  data: Array<{ label: string; value: number; color?: string; estimate?: boolean; note?: string }>;
  max?: number;
  color?: string;
  format?: (value: number) => string;
  estimate?: boolean;
}) {
  const { ref, seen } = useInView<HTMLDivElement>(0.2);
  const top = max ?? Math.max(...data.map((row) => row.value));
  const print = format ?? ((value: number) => value.toLocaleString("en-US"));

  return (
    <div className="rp-bars" ref={ref} data-seen={seen ? "true" : undefined}>
      {data.map((row, index) => (
        <div className="rp-bar-row" key={row.label}>
          <span className="rp-bar-label" title={row.label}>{row.label}</span>
          <span className="rp-bar-track">
            <span
              className="rp-bar-fill"
              data-estimate={row.estimate ?? estimate ? "true" : undefined}
              style={{
                width: seen ? `${(row.value / top) * 100}%` : "0%",
                background: row.color ?? color ?? "var(--rp-ink)",
                transitionDelay: `${index * 30}ms`
              }}
              title={`${row.label}: ${print(row.value)}${row.note ? ` · ${row.note}` : ""}`}
            />
          </span>
          <span className="rp-bar-value">{print(row.value)}</span>
        </div>
      ))}
    </div>
  );
}

/** Low–high with a dot at the typical value. Ranges are never a single bar:
 *  a bar says "this much", a dumbbell says "somewhere in here". */
export function Dumbbell({
  data, min, max, format, estimate
}: {
  data: Array<{ label: string; low: number; mid?: number | null; high: number; color?: string; series?: string; estimate?: boolean }>;
  min?: number;
  max?: number;
  format?: (value: number) => string;
  estimate?: boolean;
}) {
  const { ref, seen } = useInView<HTMLDivElement>(0.2);
  const lo = min ?? 0;
  const hi = max ?? Math.max(...data.map((row) => row.high));
  const at = (value: number) => ((value - lo) / (hi - lo)) * 100;
  const print = format ?? ((value: number) => value.toLocaleString("en-US"));

  return (
    <div className="rp-dumbbells" ref={ref} data-seen={seen ? "true" : undefined}>
      {data.map((row, index) => (
        <div className="rp-db-row" key={`${row.label}-${row.series ?? ""}`}>
          <span className="rp-bar-label">
            {row.label}
            {row.series ? <i>{row.series}</i> : null}
          </span>
          <span className="rp-db-track">
            <span
              className="rp-db-range"
              data-estimate={row.estimate ?? estimate ? "true" : undefined}
              style={{
                left: `${at(row.low)}%`,
                width: seen ? `${at(row.high) - at(row.low)}%` : "0%",
                background: row.color ?? "var(--rp-ink)",
                transitionDelay: `${index * 30}ms`
              }}
              title={`${row.label}${row.series ? ` · ${row.series}` : ""}: ${print(row.low)}–${print(row.high)}`}
            />
            {row.mid != null ? (
              <span
                className="rp-db-dot"
                style={{ left: `${at(row.mid)}%`, background: row.color ?? "var(--rp-ink)", opacity: seen ? 1 : 0, transitionDelay: `${index * 30 + 220}ms` }}
                title={`Typical: ${print(row.mid)}`}
              />
            ) : null}
          </span>
          <span className="rp-bar-value">
            {print(row.low)}–{print(row.high)}
          </span>
        </div>
      ))}
    </div>
  );
}

/** A 100% bar. Not a pie, and never more than five parts. */
export function ShareBar({
  data, format
}: {
  data: Array<{ label: string; value: number; color: string; note?: string }>;
  format?: (value: number) => string;
}) {
  const { ref, seen } = useInView<HTMLDivElement>(0.3);
  const total = data.reduce((sum, row) => sum + row.value, 0);
  const print = format ?? ((value: number) => `${Math.round((value / total) * 100)}%`);
  return (
    <div ref={ref}>
      <div className="rp-sharebar" data-seen={seen ? "true" : undefined}>
        {data.map((row, index) => (
          <span
            key={row.label}
            className="rp-sharebar-part"
            style={{
              width: seen ? `${(row.value / total) * 100}%` : "0%",
              background: row.color,
              transitionDelay: `${index * 30}ms`
            }}
            title={`${row.label}: ${print(row.value)}${row.note ? ` · ${row.note}` : ""}`}
          />
        ))}
      </div>
      <ul className="rp-legend">
        {data.map((row) => (
          <li key={row.label}><i style={{ background: row.color }} />{row.label}<b>{print(row.value)}</b></li>
        ))}
      </ul>
    </div>
  );
}
