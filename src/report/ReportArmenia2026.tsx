import { useEffect, useMemo, useState } from "react";
import data from "./armenia2026.json";
import {
  ChapterDivider, ChartCard, ConfPill, HeroStat, MethodDrawer, ShareChapter, StatRow, download, toCsv
} from "./reportKit";
import { DotMatrix } from "./reportCharts";
import "./report.css";

/* =============================================================================
   State of Design in Armenia 2026 — one page, five anchors.

   Everything the page says comes out of armenia2026.json. No figure is written
   into this file: if a number is wrong it is wrong in one place, and the CSV a
   reader downloads is the same object the chart drew.
   ============================================================================= */

const CHAPTERS = data.chapters;

function useScrollSpy(ids: string[]) {
  const [live, setLive] = useState(ids[0]);
  const [progress, setProgress] = useState(0);
  const [past, setPast] = useState(false);

  useEffect(() => {
    const read = () => {
      const max = document.documentElement.scrollHeight - window.innerHeight;
      setProgress(max > 0 ? Math.min(1, window.scrollY / max) : 0);
      setPast(window.scrollY > window.innerHeight * 0.6);
      /* The live chapter is the last one whose divider has crossed a third of
         the screen — measured on the elements themselves rather than tracked
         with an observer, so it cannot disagree with what is on screen. */
      let current = ids[0];
      ids.forEach((id) => {
        const node = document.getElementById(id);
        if (node && node.getBoundingClientRect().top <= window.innerHeight * 0.34) current = id;
      });
      setLive(current);
    };
    read();
    window.addEventListener("scroll", read, { passive: true });
    window.addEventListener("resize", read);
    return () => {
      window.removeEventListener("scroll", read);
      window.removeEventListener("resize", read);
    };
  }, [ids]);

  return { live, progress, past };
}

export function ReportArmenia2026() {
  const ids = useMemo(() => CHAPTERS.map((chapter) => chapter.id), []);
  const { live, progress, past } = useScrollSpy(ids);
  const [filter, setFilter] = useState<"All" | "People" | "Jobs" | "Money" | "Education">("All");

  /* A hash in the URL has to land on the section even though the page mounts
     with its charts still empty and its height still growing. */
  useEffect(() => {
    if (!window.location.hash) return;
    const target = document.querySelector(window.location.hash);
    if (!target) return;
    const settle = window.setTimeout(() => target.scrollIntoView({ block: "start" }), 120);
    return () => window.clearTimeout(settle);
  }, []);

  const patterns = data.overview.patterns.filter((pattern) => filter === "All" || pattern.cat === filter);

  return (
    <div className="rp">
      <nav className={`rp-nav${past ? " is-on" : ""}`} aria-label="Chapters">
        <div className="rp-nav-inner">
          {CHAPTERS.map((chapter) => (
            <a key={chapter.id} href={`#${chapter.id}`} className={live === chapter.id ? "is-live" : undefined}>
              <i>{chapter.n}</i>{chapter.title}
            </a>
          ))}
        </div>
        <span className="rp-progress" style={{ width: `${progress * 100}%` }} />
      </nav>

      {/* --- hero ------------------------------------------------------------ */}
      <header className="rp-hero" id="overview">
        <div className="rp-shell">
          <p className="rp-eyebrow">{data.meta.eyebrow}</p>
          <h1 className="rp-text">{data.meta.h1}</h1>
          <div className="rp-hero-stat">
            <HeroStat
              value={data.overview.hero.stat.value}
              label={data.overview.hero.stat.label}
              delta={data.overview.hero.stat.delta}
              deltaTone="negative"
              conf={data.overview.hero.stat.conf}
            />
            <ul className="rp-hero-small">
              {data.overview.hero.small.map((item) => (
                <li key={item.label}>
                  <b>{item.value}</b>
                  <span>{item.label}</span>
                  <ConfPill conf={item.conf} />
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="rp-shell rp-hero-matrix">
          <DotMatrix total={data.overview.hero.matrix.total} lost={data.overview.hero.matrix.lost} />
          <p className="rp-caption">{data.overview.hero.matrix.caption}</p>
        </div>
      </header>

      {/* --- key numbers ----------------------------------------------------- */}
      <section className="rp-section" aria-labelledby="key-numbers">
        <div className="rp-shell">
          <h2 id="key-numbers" className="rp-section-title">Key numbers</h2>
          <StatRow items={data.overview.keyNumbers} />
        </div>
      </section>

      {/* --- patterns -------------------------------------------------------- */}
      <section className="rp-section" aria-labelledby="patterns">
        <div className="rp-shell">
          <h2 id="patterns" className="rp-section-title">14 patterns, 2024 → 2026</h2>
          <div className="rp-chips" role="tablist" aria-label="Filter patterns">
            {(["All", "People", "Jobs", "Money", "Education"] as const).map((chip) => (
              <button
                key={chip}
                type="button"
                role="tab"
                aria-selected={filter === chip}
                className={`rp-chip${filter === chip ? " is-on" : ""}`}
                onClick={() => setFilter(chip)}
              >
                {chip}
              </button>
            ))}
          </div>
          <div className="rp-patterns">
            {patterns.map((pattern) => (
              <article className="rp-pattern" key={pattern.id}>
                <span className="rp-pattern-n">{String(pattern.id).padStart(2, "0")}</span>
                <h3>{pattern.claim}</h3>
                <p className="rp-pattern-move">
                  <span>{pattern.from}</span>
                  <em aria-hidden="true">→</em>
                  <span>{pattern.to}</span>
                </p>
                <footer>
                  <span>{pattern.source}</span>
                  <ConfPill conf={pattern.conf} />
                </footer>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* --- shift table ----------------------------------------------------- */}
      <section className="rp-section" aria-labelledby="shifts">
        <div className="rp-shell">
          <div className="rp-section-head">
            <h2 id="shifts" className="rp-section-title">What changed</h2>
            <span className="rp-herostat-row">
              <span className="rp-card-unit">Our interpretation</span>
              <ConfPill conf="ESTIMATE" />
            </span>
          </div>
          <div className="rp-shifts">
            {data.overview.shifts.map((row) => (
              <div className="rp-shift" key={row.shift}>
                <span className="rp-shift-name">{row.shift}</span>
                <span className="rp-shift-from">{row.from}</span>
                <span className="rp-shift-arrow" aria-hidden="true" />
                <span className="rp-shift-to">{row.to}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* --- chapter cards --------------------------------------------------- */}
      <section className="rp-section" aria-labelledby="chapters">
        <div className="rp-shell">
          <h2 id="chapters" className="rp-section-title">Four chapters</h2>
          <div className="rp-chaptercards">
            {CHAPTERS.slice(1).map((chapter) => (
              <a className="rp-chaptercard" key={chapter.id} href={`#${chapter.id}`}>
                <span className="rp-divider-n">{chapter.n}</span>
                <h3>{chapter.title}</h3>
                <p>{chapter.summary}</p>
                <span className="rp-chaptercard-hero">{chapter.hero}<i>{chapter.heroLabel}</i></span>
              </a>
            ))}
          </div>
        </div>
      </section>

      {/* --- chapters -------------------------------------------------------- */}
      {CHAPTERS.slice(1).map((chapter) => (
        <ChapterDivider key={chapter.id} {...chapter} />
      ))}

      {/* --- method, sources, CTA -------------------------------------------- */}
      <section className="rp-section" id="method">
        <div className="rp-shell">
          <h2 className="rp-section-title">Method</h2>
          <div className="rp-method">
            <ul className="rp-conf-key">
              {data.method.confidence.map((item) => (
                <li key={item.key}>
                  <ConfPill conf={item.key} />
                  <span>{item.text}</span>
                </li>
              ))}
            </ul>
            <MethodDrawer title="How we counted this" open>
              <ul>
                {data.method.notes.map((note) => <li key={note}>{note}</li>)}
              </ul>
            </MethodDrawer>
            <button
              type="button"
              className="rp-tool"
              onClick={() => download("design-armenia-2026.csv", toCsv(data.employers.companies.data))}
            >
              Download all data (CSV)
            </button>
          </div>

          <h2 className="rp-section-title" style={{ marginTop: "72px" }}>Sources</h2>
          <ol className="rp-sources">
            {data.sources.map((source) => <li key={source}>{source}</li>)}
          </ol>
        </div>
      </section>

      <section className="rp-section rp-cta">
        <div className="rp-shell rp-cta-grid">
          {data.cta.map((card) => (
            <article key={card.title}>
              <h3>{card.title}</h3>
              <p>{card.body}</p>
            </article>
          ))}
        </div>
      </section>

      <footer className="rp-footer">
        <div className="rp-shell">
          <p>{data.meta.research}</p>
          <p>{data.meta.footerSources}</p>
        </div>
      </footer>

      <div className={`rp-float${past ? " is-on" : ""}`}>
        <ShareChapter anchor={live} />
        <button type="button" onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}>Back to top</button>
      </div>
    </div>
  );
}
