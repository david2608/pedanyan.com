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

/** Two points and the line between them. For a year-on-year change the slope is
 *  the finding; a two-bar chart makes the reader compute it. */
export function Slope({
  a, b, format, tone = "var(--rp-neg)"
}: {
  a: { label: string; value: number; note?: string };
  b: { label: string; value: number; note?: string };
  format?: (value: number) => string;
  tone?: string;
}) {
  const { ref, seen } = useInView<HTMLDivElement>(0.3);
  const print = format ?? ((value: number) => value.toLocaleString("en-US"));
  const top = Math.max(a.value, b.value);
  const y = (value: number) => 20 + (1 - value / top) * 150;

  return (
    <div className="rp-slope" ref={ref}>
      <svg viewBox="0 0 400 210" preserveAspectRatio="none" role="presentation">
        <line x1="0" y1={y(top)} x2="400" y2={y(top)} className="rp-grid" />
        <line x1="0" y1="190" x2="400" y2="190" className="rp-grid" />
        <line
          x1="70" y1={y(a.value)} x2="330" y2={seen ? y(b.value) : y(a.value)}
          stroke={tone} strokeWidth="2" className="rp-slope-line"
        />
        <circle cx="70" cy={y(a.value)} r="5" fill={tone} />
        <circle cx="330" cy={seen ? y(b.value) : y(a.value)} r="5" fill={tone} className="rp-slope-end" />
      </svg>
      <div className="rp-slope-ends">
        <span><b>{print(a.value)}</b><i>{a.label}</i>{a.note ? <em>{a.note}</em> : null}</span>
        <span><b>{print(b.value)}</b><i>{b.label}</i>{b.note ? <em>{b.note}</em> : null}</span>
      </div>
    </div>
  );
}

/** A hundred squares. Percentages of a whole read faster as a block of units
 *  than as a bar, and nobody has to trust an axis. */
export function Waffle({
  parts, columns = 10
}: {
  parts: Array<{ label: string; value: number; color: string; estimate?: boolean }>;
  columns?: number;
}) {
  const { ref, seen } = useInView<HTMLDivElement>(0.3);
  const total = parts.reduce((sum, part) => sum + part.value, 0);
  const cells: Array<{ color: string; label: string; estimate?: boolean }> = [];
  parts.forEach((part) => {
    const count = Math.round((part.value / total) * 100);
    for (let index = 0; index < count; index += 1) cells.push({ color: part.color, label: part.label, estimate: part.estimate });
  });
  while (cells.length < 100) cells.push({ color: "var(--rp-line)", label: "—" });

  return (
    <div className="rp-waffle-wrap" ref={ref}>
      <div className="rp-waffle" style={{ gridTemplateColumns: `repeat(${columns}, 1fr)` }}>
        {cells.slice(0, 100).map((cell, index) => (
          <span
            key={index}
            className="rp-waffle-cell"
            data-estimate={cell.estimate ? "true" : undefined}
            style={{ background: cell.color, opacity: seen ? 1 : 0, transitionDelay: `${index * 6}ms` }}
            title={cell.label}
          />
        ))}
      </div>
      <ul className="rp-legend">
        {parts.map((part) => (
          <li key={part.label}><i style={{ background: part.color }} />{part.label}<b>{Math.round((part.value / total) * 100)}%</b></li>
        ))}
      </ul>
    </div>
  );
}

/** Two populations on one baseline, facing away from each other. The gap is the
 *  point, so the bands are printed down the middle where both sides meet. */
export function Butterfly({
  left, right, leftLabel, rightLabel, leftColor = "var(--rp-muted)", rightColor = "var(--rp-accent)", leftEstimate
}: {
  left: Array<{ band: string; value: number }>;
  right: Array<{ band: string; value: number }>;
  leftLabel: string;
  rightLabel: string;
  leftColor?: string;
  rightColor?: string;
  leftEstimate?: boolean;
}) {
  const { ref, seen } = useInView<HTMLDivElement>(0.2);
  const rows = Math.max(left.length, right.length);
  const top = Math.max(...left.map((row) => row.value), ...right.map((row) => row.value));

  return (
    <div className="rp-butterfly" ref={ref}>
      <div className="rp-butterfly-head">
        <span>{leftLabel}</span>
        <span />
        <span>{rightLabel}</span>
      </div>
      {Array.from({ length: rows }, (_, index) => {
        const l = left[index];
        const r = right[index];
        return (
          <div className="rp-butterfly-row" key={index}>
            <span className="rp-bf-side is-left">
              {l ? (
                <>
                  <b>{l.value}%</b>
                  <span
                    className="rp-bf-bar"
                    data-estimate={leftEstimate ? "true" : undefined}
                    style={{ width: seen ? `${(l.value / top) * 100}%` : "0%", background: leftColor, transitionDelay: `${index * 30}ms` }}
                    title={`${leftLabel} · ${l.band}: ${l.value}%`}
                  />
                  <i>{l.band}</i>
                </>
              ) : null}
            </span>
            <span className="rp-bf-mid" aria-hidden="true" />
            <span className="rp-bf-side is-right">
              {r ? (
                <>
                  <i>{r.band}</i>
                  <span
                    className="rp-bf-bar"
                    style={{ width: seen ? `${(r.value / top) * 100}%` : "0%", background: rightColor, transitionDelay: `${index * 30}ms` }}
                    title={`${rightLabel} · ${r.band}: ${r.value}%`}
                  />
                  <b>{r.value}%</b>
                </>
              ) : null}
            </span>
          </div>
        );
      })}
    </div>
  );
}

/** A career ladder: one step per grade, step width = the share, whisker = the
 *  range the share could be. Steps because the thing being described is a
 *  ladder, and a reader climbing it reads the shape before the numbers. */
export function Ladder({
  data, estimate
}: {
  data: Array<{ grade: string; years: string; share: [number, number]; headcount: [number, number] }>;
  estimate?: boolean;
}) {
  const { ref, seen } = useInView<HTMLDivElement>(0.2);
  const top = Math.max(...data.map((row) => row.share[1]));
  return (
    <div className="rp-ladder" ref={ref}>
      {data.map((row, index) => {
        const mid = (row.share[0] + row.share[1]) / 2;
        return (
          <div className="rp-ladder-step" key={row.grade}>
            <span className="rp-ladder-label">{row.grade}<i>{row.years} years</i></span>
            <span className="rp-ladder-track">
              <span
                className="rp-ladder-fill"
                data-estimate={estimate ? "true" : undefined}
                style={{ width: seen ? `${(mid / top) * 100}%` : "0%", transitionDelay: `${index * 30}ms` }}
                title={`${row.grade}: ${row.share[0]}–${row.share[1]}% · ${row.headcount[0].toLocaleString("en-US")}–${row.headcount[1].toLocaleString("en-US")} people`}
              />
              <span
                className="rp-ladder-whisker"
                style={{ left: `${(row.share[0] / top) * 100}%`, width: `${((row.share[1] - row.share[0]) / top) * 100}%`, opacity: seen ? 1 : 0 }}
              />
            </span>
            <span className="rp-bar-value">{row.share[0]}–{row.share[1]}%</span>
          </div>
        );
      })}
    </div>
  );
}

/** A number that is a share of something, drawn as an arc. Used only where the
 *  denominator is small and named — three of them side by side, never as a pie. */
export function Meter({ value, of, label, color = "var(--rp-accent)" }: { value: number; of: number; label: string; color?: string }) {
  const { ref, seen } = useInView<HTMLDivElement>(0.4);
  const radius = 42;
  const circumference = 2 * Math.PI * radius;
  const share = of > 0 ? value / of : 0;
  return (
    <div className="rp-meter" ref={ref}>
      <svg viewBox="0 0 100 100" role="img" aria-label={`${label}: ${value} of ${of}`}>
        <circle cx="50" cy="50" r={radius} className="rp-meter-track" />
        <circle
          cx="50" cy="50" r={radius}
          className="rp-meter-fill"
          stroke={color}
          strokeDasharray={circumference}
          strokeDashoffset={seen ? circumference * (1 - share) : circumference}
          transform="rotate(-90 50 50)"
        />
        <text x="50" y="46" className="rp-meter-value">{value}</text>
        <text x="50" y="62" className="rp-meter-of">of {of}</text>
      </svg>
      <span className="rp-meter-label">{label}</span>
    </div>
  );
}

/** A single number line, log scale, with the observations pinned on it. Log
 *  because the top of this range is forty times the bottom; a linear axis would
 *  put every ordinary salary in the first centimetre. */
export function LogLine({
  min, max, pins, format
}: {
  min: number;
  max: number;
  pins: Array<{ value: number; label: string; source?: string }>;
  format?: (value: number) => string;
}) {
  const { ref, seen } = useInView<HTMLDivElement>(0.3);
  const print = format ?? ((value: number) => value.toLocaleString("en-US"));
  const at = (value: number) => ((Math.log10(value) - Math.log10(min)) / (Math.log10(max) - Math.log10(min))) * 100;
  const ticks = [100000, 300000, 1000000, 3000000].filter((tick) => tick > min && tick < max);

  /* Two pins share a value (2.0M), so they are stacked rather than overlapped. */
  const seenAt = new Map<number, number>();
  const placed = pins.map((pin) => {
    const level = seenAt.get(pin.value) ?? 0;
    seenAt.set(pin.value, level + 1);
    return { ...pin, level };
  });

  return (
    <div className="rp-logline" ref={ref} data-seen={seen ? "true" : undefined}>
      <div className="rp-logline-axis">
        {ticks.map((tick) => (
          <span className="rp-logline-tick" key={tick} style={{ left: `${at(tick)}%` }}>
            <i />{print(tick)}
          </span>
        ))}
      </div>
      <div className="rp-logline-track">
        {placed.map((pin, index) => (
          <span
            className="rp-logline-pin"
            key={`${pin.value}-${pin.label}`}
            style={{ left: `${at(pin.value)}%`, ["--level" as string]: String(pin.level), transitionDelay: `${index * 40}ms` }}
            title={`${pin.label}: ${print(pin.value)}${pin.source ? ` · ${pin.source}` : ""}`}
          >
            <i />
            <b>{print(pin.value)}</b>
            <em>{pin.label}</em>
          </span>
        ))}
      </div>
    </div>
  );
}

/** One mark per thing counted. Thirty-three providers is a number small enough
 *  to draw one by one, and drawing them makes the shape of the sector obvious
 *  in a way a bar of height 33 never does. */
export function UnitChart({
  groups, colors
}: {
  groups: Array<{ type: string; count: number; note?: string; teaches: string }>;
  colors: Record<string, string>;
}) {
  const { ref, seen } = useInView<HTMLDivElement>(0.25);
  return (
    <div className="rp-units" ref={ref}>
      {groups.map((group, groupIndex) => (
        <div className="rp-unit-group" key={group.type}>
          <div className="rp-unit-cells">
            {Array.from({ length: group.count }, (_, index) => (
              <span
                key={index}
                className="rp-unit-cell"
                style={{
                  background: colors[group.teaches],
                  opacity: seen ? 1 : 0,
                  transitionDelay: `${(groupIndex * 6 + index) * 22}ms`
                }}
                title={`${group.type} — teaches ${group.teaches}`}
              />
            ))}
          </div>
          <span className="rp-unit-label">
            <b>{group.count}</b> {group.type}
            {group.note ? <i>{group.note}</i> : null}
          </span>
        </div>
      ))}
      <ul className="rp-legend">
        {Object.entries(colors).map(([key, color]) => (
          <li key={key}><i style={{ background: color }} />{key === "ux" ? "UX/UI" : key === "graphic" ? "Graphic" : "Both"}</li>
        ))}
      </ul>
    </div>
  );
}

/** A line over four or five readings. One axis, one series, direct labels at
 *  both ends — the shape is the whole message. */
export function MiniLine({
  points, format, tone = "var(--rp-accent)"
}: {
  points: Array<{ when: string; value: number }>;
  format?: (value: number) => string;
  tone?: string;
}) {
  const { ref, seen } = useInView<HTMLDivElement>(0.3);
  const print = format ?? ((value: number) => String(value));
  const values = points.map((point) => point.value);
  const lo = Math.min(...values);
  const hi = Math.max(...values);
  const pad = (hi - lo) * 0.35 || 1;
  const x = (index: number) => (index / (points.length - 1)) * 100;
  const y = (value: number) => 92 - ((value - (lo - pad)) / ((hi + pad) - (lo - pad))) * 74;
  const path = points.map((point, index) => `${index === 0 ? "M" : "L"}${x(index)} ${y(point.value)}`).join(" ");

  return (
    <div className="rp-miniline" ref={ref}>
      <svg viewBox="0 0 100 100" preserveAspectRatio="none" role="presentation">
        <path d={path} fill="none" stroke={tone} strokeWidth="2" vectorEffect="non-scaling-stroke"
              style={{ strokeDasharray: 400, strokeDashoffset: seen ? 0 : 400, transition: "stroke-dashoffset 700ms ease" }} />
        {points.map((point, index) => (
          <circle key={point.when} cx={x(index)} cy={y(point.value)} r="1.6" fill={tone} vectorEffect="non-scaling-stroke">
            <title>{`${point.when}: ${print(point.value)}`}</title>
          </circle>
        ))}
      </svg>
      <div className="rp-miniline-labels">
        {points.map((point) => (
          <span key={point.when}><b>{print(point.value)}</b><i>{point.when}</i></span>
        ))}
      </div>
    </div>
  );
}
