import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { ReactNode } from "react";

/* =============================================================================
   The report's own component kit. Built once here and used by every chapter, so
   a chart card looks and behaves the same on page four as on page one.

   Two rules run through all of it:
   - every number states how well it is known (HARD / REPORTED / ESTIMATE), and
     the pill is a link into the method section rather than decoration;
   - every chart is also a table. The table is visually hidden but present in the
     DOM, so a screen reader, a crawler and a reader with images off all get the
     numbers, not an empty box.
   ============================================================================= */

export type Conf = "HARD" | "REPORTED" | "ESTIMATE";

export const REDUCED = () =>
  typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

/* --- seen once ------------------------------------------------------------- */

export function useInView<T extends Element>(threshold = 0.25) {
  const ref = useRef<T | null>(null);
  const [seen, setSeen] = useState(false);
  useEffect(() => {
    const node = ref.current;
    if (!node || seen) return;
    if (REDUCED()) { setSeen(true); return; }
    const observer = new IntersectionObserver(
      (entries) => { if (entries.some((entry) => entry.isIntersecting)) setSeen(true); },
      { threshold }
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, [seen, threshold]);
  return { ref, seen };
}

/* --- count-up -------------------------------------------------------------- */

/** Counts to `value` once, in 600ms. Anything that is not a plain number —
 *  "1.2M AMD", "9 · 7 · 4", "6,400 → 5,600" — is printed as written, because
 *  animating a string is how a report starts inventing numbers. */
export function CountUp({ value, duration = 600 }: { value: string; duration?: number }) {
  const { ref, seen } = useInView<HTMLSpanElement>(0.6);
  const target = useMemo(() => {
    const match = /^-?[\d,]+(\.\d+)?$/.exec(value.trim());
    return match ? Number(value.replace(/,/g, "")) : null;
  }, [value]);
  const [shown, setShown] = useState<string>(target === null ? value : "0");

  useEffect(() => {
    if (!seen || target === null) { if (target === null) setShown(value); return; }
    if (REDUCED()) { setShown(value); return; }
    const start = performance.now();
    let frame = 0;
    const step = (now: number) => {
      const t = Math.min(1, (now - start) / duration);
      const eased = 1 - Math.pow(1 - t, 3);
      setShown(Math.round(target * eased).toLocaleString("en-US"));
      if (t < 1) frame = requestAnimationFrame(step);
      else setShown(value);
    };
    frame = requestAnimationFrame(step);
    return () => cancelAnimationFrame(frame);
  }, [seen, target, value, duration]);

  return <span ref={ref}>{shown}</span>;
}

/* --- confidence ------------------------------------------------------------ */

export function ConfPill({ conf, note }: { conf: Conf | string; note?: string }) {
  return (
    <a className="rp-pill" data-conf={conf} href="#method" title={note ?? `${conf} — see method`}>
      {conf}
    </a>
  );
}

/* --- stats ----------------------------------------------------------------- */

export function HeroStat({
  value, label, delta, deltaTone = "negative", conf, sub
}: {
  value: string; label: string; delta?: string;
  deltaTone?: "negative" | "positive"; conf?: Conf | string; sub?: string;
}) {
  return (
    <div className="rp-herostat">
      <div className="rp-herostat-value"><CountUp value={value} /></div>
      <div className="rp-herostat-row">
        {delta ? <span className="rp-delta" data-tone={deltaTone}>{delta}</span> : null}
        {conf ? <ConfPill conf={conf} /> : null}
      </div>
      <p className="rp-herostat-label">{label}</p>
      {sub ? <p style={{ maxWidth: "62ch" }}>{sub}</p> : null}
    </div>
  );
}

export function StatRow({ items }: { items: Array<{ value: string; label: string; conf?: string; date?: string; source?: string }> }) {
  return (
    <div className="rp-statrow">
      {items.map((item) => (
        <div className="rp-stat" key={item.label}>
          <span className="rp-stat-value">{item.value}</span>
          <span className="rp-stat-label">{item.label}</span>
          <span className="rp-herostat-row">
            {item.conf ? <ConfPill conf={item.conf} /> : null}
            {item.date || item.source ? (
              <span className="rp-stat-label">{[item.source, item.date].filter(Boolean).join(" · ")}</span>
            ) : null}
          </span>
        </div>
      ))}
    </div>
  );
}

/* --- csv ------------------------------------------------------------------- */

export function toCsv(rows: Array<Record<string, unknown>>): string {
  if (!rows.length) return "";
  const columns = Array.from(rows.reduce<Set<string>>((set, row) => {
    Object.keys(row).forEach((key) => set.add(key));
    return set;
  }, new Set()));
  const cell = (value: unknown) => {
    const text = value === null || value === undefined ? "" : String(value);
    return /[",\n]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text;
  };
  return [columns.join(","), ...rows.map((row) => columns.map((key) => cell(row[key])).join(","))].join("\n");
}

export function download(name: string, text: string, type = "text/csv;charset=utf-8") {
  const url = URL.createObjectURL(new Blob([text], { type }));
  const link = document.createElement("a");
  link.href = url;
  link.download = name;
  link.click();
  URL.revokeObjectURL(url);
}

/* --- chart card ------------------------------------------------------------ */

export function ChartCard({
  id, finding, unit, conf, source, method, rows, csvName, children, foot
}: {
  id: string;
  finding: string;
  unit: string;
  conf?: Conf | string;
  source?: string;
  method?: string;
  /** The chart's numbers. Rendered as a hidden table and offered as CSV — the
      chart is a view of this, never the only copy of it. */
  rows?: Array<Record<string, unknown>>;
  csvName?: string;
  children: ReactNode;
  foot?: ReactNode;
}) {
  const hostRef = useRef<HTMLDivElement | null>(null);

  const png = useCallback(() => {
    const svg = hostRef.current?.querySelector("svg");
    if (!svg) return;
    const box = svg.getBoundingClientRect();
    const clone = svg.cloneNode(true) as SVGSVGElement;
    clone.setAttribute("xmlns", "http://www.w3.org/2000/svg");
    clone.setAttribute("width", String(Math.round(box.width)));
    clone.setAttribute("height", String(Math.round(box.height)));
    const blob = new Blob([new XMLSerializer().serializeToString(clone)], { type: "image/svg+xml" });
    const url = URL.createObjectURL(blob);
    const image = new Image();
    image.onload = () => {
      const canvas = document.createElement("canvas");
      const scale = 2;
      canvas.width = Math.round(box.width * scale);
      canvas.height = Math.round(box.height * scale);
      const context = canvas.getContext("2d");
      if (context) {
        context.fillStyle = getComputedStyle(document.documentElement).getPropertyValue("--rp-card") || "#ffffff";
        context.fillRect(0, 0, canvas.width, canvas.height);
        context.drawImage(image, 0, 0, canvas.width, canvas.height);
        canvas.toBlob((out) => {
          if (!out) return;
          const link = document.createElement("a");
          link.href = URL.createObjectURL(out);
          link.download = `${id}.png`;
          link.click();
          URL.revokeObjectURL(link.href);
        });
      }
      URL.revokeObjectURL(url);
    };
    image.src = url;
  }, [id]);

  const copy = useCallback(() => {
    const text = [finding, unit, rows ? toCsv(rows) : "", source ? `Source: ${source}` : ""]
      .filter(Boolean).join("\n\n");
    void navigator.clipboard?.writeText(text);
  }, [finding, unit, rows, source]);

  return (
    <figure className="rp-card" id={id} style={{ margin: 0 }} aria-label={finding}>
      <div className="rp-card-head">
        <h3>{finding}</h3>
        <span className="rp-card-unit">{unit}</span>
      </div>

      <div ref={hostRef}>{children}</div>

      {rows?.length ? (
        <table className="rp-sr">
          <caption>{finding}</caption>
          <thead>
            <tr>{Object.keys(rows[0]).map((key) => <th key={key} scope="col">{key}</th>)}</tr>
          </thead>
          <tbody>
            {rows.map((row, index) => (
              <tr key={index}>{Object.keys(rows[0]).map((key) => <td key={key}>{String(row[key] ?? "")}</td>)}</tr>
            ))}
          </tbody>
        </table>
      ) : null}

      <figcaption className="rp-card-foot">
        <span className="rp-card-foot-src">
          {source ? <>Source: {source}</> : null}
          {foot}
        </span>
        {conf ? <ConfPill conf={conf} /> : null}
        {method ? <span className="rp-help" role="note" title={method}>?</span> : null}
        <span className="rp-tools">
          <button type="button" className="rp-tool" onClick={copy}>Copy</button>
          <button type="button" className="rp-tool" onClick={png}>PNG</button>
          {rows?.length ? (
            <button type="button" className="rp-tool" onClick={() => download(`${csvName ?? id}.csv`, toCsv(rows))}>CSV</button>
          ) : null}
        </span>
      </figcaption>
    </figure>
  );
}

/* --- editorial furniture --------------------------------------------------- */

export function CalloutQuote({ text, by }: { text: string; by: string }) {
  return (
    <blockquote className="rp-quote">
      <p>“{text}”</p>
      <cite>{by}</cite>
    </blockquote>
  );
}

export function MethodDrawer({ title = "How we counted this", open = false, children }: { title?: string; open?: boolean; children: ReactNode }) {
  return (
    <details className="rp-drawer" open={open}>
      <summary>{title}</summary>
      <div className="rp-drawer-body">{children}</div>
    </details>
  );
}

export function ChapterDivider({
  n, id, title, summary, hero, heroLabel, read
}: { n: string; id: string; title: string; summary: string; hero: string; heroLabel: string; read: string }) {
  return (
    <header className="rp-divider" id={id}>
      <div className="rp-shell rp-divider-grid">
        <div>
          <span className="rp-divider-n">{n}</span>
          <h2>{title}</h2>
          <p>{summary}</p>
        </div>
        <div className="rp-divider-meta">
          <span className="rp-divider-hero">{hero}</span>
          <span className="rp-stat-label">{heroLabel}</span>
          <span className="rp-divider-read">{read} read</span>
          <ShareChapter anchor={id} />
        </div>
      </div>
    </header>
  );
}

export function ShareChapter({ anchor }: { anchor: string }) {
  const [done, setDone] = useState(false);
  return (
    <button
      type="button"
      className="rp-tool"
      onClick={() => {
        const url = `${window.location.origin}${window.location.pathname}#${anchor}`;
        void navigator.clipboard?.writeText(url).then(() => {
          setDone(true);
          window.setTimeout(() => setDone(false), 1600);
        });
      }}
    >
      {done ? "Link copied" : "Share this chapter"}
    </button>
  );
}
