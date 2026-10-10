import { useEffect, useMemo, useState } from "react";
import "@fontsource/syne/600.css";
import "@fontsource/syne/700.css";
import data from "./armenia2026.json";
import { ChapterDivider, ConfPill, MethodDrawer, download, toCsv } from "./reportKit";
import { DotMatrix } from "./reportCharts";
import { ReportPeople } from "./ReportPeople";
import { ReportEmployers } from "./ReportEmployers";
import { ReportSalaries } from "./ReportSalaries";
import { ReportEducation } from "./ReportEducation";
import "./report.css";

/* =============================================================================
   State of Design in Armenia 2026 — one page, four chapters.

   Everything it says comes out of armenia2026.json. No figure is written into
   this file: a wrong number is wrong in one place, and the CSV a reader
   downloads is the object the chart drew.

   The page is ordered so that a reader meets the strongest number first, is
   told immediately what it does NOT prove, and only then is offered the
   chapters. The admission is the second thing on the page on purpose.
   ============================================================================= */

const CHAPTERS = data.chapters;
const SURVEY = "https://docs.google.com/forms/d/e/1FAIpQLSeVAJGuzs_MpiPSYBSMMfjuLWL09SqAzi0iyI6Jv22ta0ZGgA/viewform";
const LINKEDIN = "https://www.linkedin.com/in/davit-pedanyan";
const INSTAGRAM: string | null = "https://www.instagram.com/pedanyan";

/* The six patterns no chapter charts. The other eight are told better by the
   chapter that owns them, and repeating them here is what made the first
   version feel like the same finding five times. */
const LOOSE_PATTERNS = [2, 3, 7, 8, 9, 12];

const UNKNOWNS = [
  { q: "Why the number fell", a: "Emigration, redundancy, a change of title, or a profile nobody updated. The source counts the drop, not the reason." },
  { q: "What designers earn, by grade", a: "No survey publishes it and no vacancy shows it. Chapter 3 is our estimate." },
  { q: "How many left design for another profession", a: "Nobody tracks it, here or anywhere." }
];

function useScrollSpy(ids: string[]) {
  const [live, setLive] = useState(ids[0]);
  const [progress, setProgress] = useState(0);
  const [past, setPast] = useState(false);

  useEffect(() => {
    const read = () => {
      const max = document.documentElement.scrollHeight - window.innerHeight;
      setProgress(max > 0 ? Math.min(1, window.scrollY / max) : 0);
      setPast(window.scrollY > window.innerHeight * 0.6);
      /* Measured on the elements themselves rather than through an observer, so
         the live chapter can never disagree with what is on screen. */
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

  /* A hash has to land on its section even though the page mounts with its
     charts empty and its height still growing. */
  useEffect(() => {
    if (!window.location.hash) return;
    const target = document.querySelector(window.location.hash);
    if (!target) return;
    const settle = window.setTimeout(() => target.scrollIntoView({ block: "start" }), 140);
    return () => window.clearTimeout(settle);
  }, []);

  const patterns = data.overview.patterns.filter((pattern) => LOOSE_PATTERNS.includes(pattern.id));

  return (
    <div className="rp">
      <nav className={`rp-nav${past ? " is-on" : ""}`} aria-label="Chapters">
        <div className="rp-nav-inner">
          {CHAPTERS.map((chapter) => (
            <a key={chapter.id} href={`#${chapter.id}`} className={live === chapter.id ? "is-live" : undefined}>
              <i>{chapter.n}</i>{chapter.title}
            </a>
          ))}
          <a href="#method">Method</a>
        </div>
        <span className="rp-progress" style={{ width: `${progress * 100}%` }} />
      </nav>

      {/* --- 00 masthead ------------------------------------------------------ */}
      <div className="rp-shell">
        <header className="rp-masthead">
          <span><b>State of Design in Armenia</b> · 2026</span>
          <span>Research: Davit Pedanyan · September 2026</span>
          <span>22 min · Every figure marked</span>
        </header>
      </div>

      {/* --- 01 the number ---------------------------------------------------- */}
      <header className="rp-hero" id="overview">
        <div className="rp-shell">
          <div className="rp-hero-grid">
            <h1>{data.meta.h1}</h1>
            <div className="rp-hero-number">
              <span className="rp-statement-big">{data.overview.hero.stat.value}</span>
              <span className="rp-hero-row">
                <span className="rp-delta" data-tone="negative">{data.overview.hero.stat.delta}</span>
                <ConfPill conf={data.overview.hero.stat.conf} />
              </span>
              <span className="rp-hero-label">{data.overview.hero.stat.label}</span>
            </div>
          </div>

          <div className="rp-matrix-wrap">
            <DotMatrix total={data.overview.hero.matrix.total} lost={data.overview.hero.matrix.lost} />
            <p className="rp-caption">{data.overview.hero.matrix.caption}</p>
          </div>
        </div>
      </header>

      {/* --- 02 intro ---------------------------------------------------------- */}
      <section className="rp-section rp-intro">
        <div className="rp-shell">
          <div className="rp-text">
          <p>
            This is a count, not an opinion. For a month I gathered everything about designers in
            Armenia that could be counted from public sources — company pages, job boards, salary
            sites, the websites of every place that teaches design — and put it in one place,
            because nobody had.
          </p>
          <p>
            Every figure says how well it is known. <b>Measured</b> means I counted it myself from a
            named source. <b>Reported</b> means somebody else published it and I am quoting them.
            <b> Estimate</b> means it is mine, built from the sources in the chart's footer. Where I
            have nothing, the page says so rather than filling the gap.
          </p>
          </div>
        </div>
      </section>

      {/* --- 03 what we could not determine ----------------------------------- */}
      <section className="rp-section" aria-labelledby="unknowns">
        <div className="rp-shell">
          <p className="rp-eyebrow" id="unknowns">What this report does not know</p>
          <div className="rp-ruled">
            {UNKNOWNS.map((row, index) => (
              <div className="rp-row" key={row.q}>
                <span className="rp-row-n">{String(index + 1).padStart(2, "0")}</span>
                <span className="rp-row-lead">{row.q}</span>
                <span className="rp-row-body">{row.a}</span>
                <span className="rp-row-meta" />
              </div>
            ))}
          </div>
          <p style={{ marginTop: 34, maxWidth: "54ch" }}>
            And my own interest, stated: I teach design and sell courses, and this report says the
            market shrank — the one claim my own interest argues against. I also teach at Armenian
            Code Academy, one of the providers in Chapter 4.
          </p>
        </div>
      </section>

      {/* --- 04 contents ------------------------------------------------------ */}
      <section className="rp-section" aria-labelledby="contents">
        <div className="rp-shell">
          <p className="rp-eyebrow" id="contents">Four chapters</p>
          <div className="rp-ruled rp-contents">
            {CHAPTERS.slice(1).map((chapter) => (
              <a href={`#${chapter.id}`} key={chapter.id}>
                <div className="rp-row">
                  <span className="rp-row-n">{chapter.n}</span>
                  <span className="rp-row-lead">{chapter.title}</span>
                  <span className="rp-row-body">{chapter.summary}</span>
                  <span className="rp-contents-hero">{chapter.hero}</span>
                </div>
              </a>
            ))}
          </div>
        </div>
      </section>

      {/* --- 05–08 the chapters ----------------------------------------------- */}
      {CHAPTERS.slice(1).map((chapter) => (
        <section className="rp-section" key={chapter.id} style={{ paddingTop: 0 }}>
          <ChapterDivider {...chapter} />
          {chapter.id === "people" ? <ReportPeople /> : null}
          {chapter.id === "employers" ? <ReportEmployers /> : null}
          {chapter.id === "salaries" ? <ReportSalaries /> : null}
          {chapter.id === "education" ? <ReportEducation /> : null}
        </section>
      ))}

      {/* --- 08 the loose patterns -------------------------------------------- */}
      <section className="rp-section" id="patterns">
        <div className="rp-shell">
          <p className="rp-eyebrow">Six patterns no chart in this report proves</p>
          <div className="rp-ruled">
            {patterns.map((pattern) => (
              <div className="rp-row" key={pattern.id}>
                <span className="rp-row-n">{String(pattern.id).padStart(2, "0")}</span>
                <span className="rp-row-lead">{pattern.claim}</span>
                <span className="rp-row-body">
                  {pattern.from !== "—" ? <em style={{ opacity: 0.6, fontStyle: "normal" }}>{pattern.from} → </em> : null}
                  {pattern.to}
                </span>
                <span className="rp-row-meta">
                  {pattern.source} <ConfPill conf={pattern.conf} />
                </span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* --- 09 what changed --------------------------------------------------- */}
      <section className="rp-section" id="shifts">
        <div className="rp-shell">
          <p className="rp-eyebrow">What changed · our interpretation <ConfPill conf="ESTIMATE" /></p>
          <div className="rp-ruled">
            {data.overview.shifts.map((row) => (
              <div className="rp-row" key={row.shift}>
                <span className="rp-row-n" />
                <span className="rp-row-lead">{row.shift}</span>
                <span className="rp-row-body" style={{ opacity: 0.62 }}>{row.from}</span>
                <span className="rp-row-body">{row.to}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* --- 10 gaps ----------------------------------------------------------- */}
      <section className="rp-section" id="gaps">
        <div className="rp-shell">
          <p className="rp-eyebrow">Gaps, and next year</p>
          <div className="rp-ruled">
            {data.education.gaps.map((gap) => (
              <div className="rp-row" key={gap.title}>
                <span className="rp-row-n">□</span>
                <span className="rp-row-lead">{gap.title}</span>
                <span className="rp-row-body">{gap.note}</span>
                <span className="rp-row-meta" />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* --- 11 method and sources --------------------------------------------- */}
      <section className="rp-section" id="method">
        <div className="rp-shell">
          <p className="rp-eyebrow">Method</p>
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

          <p className="rp-eyebrow" style={{ marginTop: 78 }}>Sources</p>
          <ul className="rp-sources">
            {data.sources.map((source) => <li key={source}><span>{source}</span></li>)}
          </ul>
        </div>
      </section>

      {/* --- 12 three exits ---------------------------------------------------- */}
      <section className="rp-section" id="next" style={{ paddingBottom: 0 }}>
        <div className="rp-shell">
          <p className="rp-eyebrow">Where to go from here</p>
        </div>
        <div className="rp-shell">
          <div className="rp-exits">
            <a className="rp-exit" href={SURVEY} target="_blank" rel="noreferrer">
              <span className="rp-exit-who">If you design in Armenia</span>
              <h3>Answer the 2027 survey</h3>
              <p>Five minutes, anonymous. The part this report could not count.</p>
              <span className="rp-exit-go">Take the survey →</span>
            </a>
            <a className="rp-exit" href="#employers">
              <span className="rp-exit-who">If you are hiring</span>
              <h3>Who you are bidding against</h3>
              <p>Every employer we could count, and what the bands look like.</p>
              <span className="rp-exit-go">Read chapter 2 →</span>
            </a>
            <a className="rp-exit" href="#education">
              <span className="rp-exit-who">If you are choosing a course</span>
              <h3>What it costs, and what it leads to</h3>
              <p>Thirty-three providers, their prices, and what the market asks of a junior.</p>
              <span className="rp-exit-go">Read chapter 4 →</span>
            </a>
          </div>
        </div>
      </section>

      {/* --- 13 who counted it ------------------------------------------------ */}
      <section className="rp-section rp-follow" id="follow">
        <div className="rp-shell">
          <p className="rp-eyebrow">Who counted it</p>
          <div className="rp-follow-grid">
            <div className="rp-text">
              <p>
                Davit Pedanyan designs products in Yerevan and teaches design here. This count
                began as a question nobody could answer for him and turned into a month of
                opening company pages one at a time. Next year it is meant to be a shorter job,
                because the survey will do the part a public page cannot.
              </p>
            </div>
            <ul className="rp-follow-links">
              <li>
                <a href={LINKEDIN} target="_blank" rel="noreferrer">
                  <b>LinkedIn</b><span>The 2027 count as it is gathered, number by number</span>
                </a>
              </li>
              {INSTAGRAM ? (
                <li>
                  <a href={INSTAGRAM} target="_blank" rel="noreferrer">
                    <b>Instagram</b><span>The charts, one at a time</span>
                  </a>
                </li>
              ) : null}
              <li>
                <a href="https://pedanyan.com/?utm_source=report&utm_medium=pdf">
                  <b>pedanyan.com</b><span>The design work behind the research</span>
                </a>
              </li>
            </ul>
          </div>
        </div>
      </section>

      <footer className="rp-footer">
        <div className="rp-shell">
          <p>{data.meta.research}</p>
          <p>{data.meta.footerSources}</p>
        </div>
      </footer>

      {/* The share control lives on each chapter divider, where it copies that
          chapter's own link. One floating button is enough here. */}
      <div className={`rp-float${past ? " is-on" : ""}`}>
        <button type="button" onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}>Top</button>
      </div>
    </div>
  );
}
