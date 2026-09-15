import { useEffect, useRef, useState, type CSSProperties, type ReactNode } from "react";
import { PullToContinue } from "./PullToContinue";
import { LigaPhone, LigaPhoneInView, type LigaScreenId } from "./ligaScreens";
import portfolioManifest from "./portfolio-content.json";
import "./ligaSteepPage.css";

/**
 * LIGA Mobile, rebuilt on the Steep page architecture.
 *
 * This is not a restyle of the case-study shell - it is a different page
 * model. Steep is a product magazine: a 1200px column, a centred oversized
 * serif headline with product UI fragments floating around it rather than
 * nested in a dashboard frame, sections alternating between paper and fog at
 * 80px gaps, two-column text+UI splits, ghost typographic tags instead of
 * badges, and exactly one peach editorial card in the whole page.
 *
 * So the eleven sections of the original are re-cut:
 *   opening       -> hero collage: headline + four floating artifacts
 *   project       -> a hairline meta row, not a definition stack
 *   outcome       -> three stat cards with gestural charts
 *   context       -> one headline over four ghost-tagged serif numerals
 *   problem       -> the one peach editorial card, beside the staged scene
 *   accident      -> eight alternating text+artifact splits, not a pinned phone
 *   advantages    -> a three-across neutral card grid
 *   fail + validation -> a two-up editorial pair
 *   everyday      -> a four-across row of floating artifacts
 *   design-system -> a four-across neutral card grid
 *   reflection    -> a centred closing statement
 *   navigation    -> the scroll-to-continue pull, unchanged
 *
 * The copy is read from the same content file as /am/projects/liga, so the
 * two pages can only differ in architecture.
 */

/* ------------------------------------------------------------------ content */

type Item = Record<string, string | undefined>;
type Meta = { label: string; value: string };
type Section = { id: string; eyebrow?: string; title?: string; subtitle?: string; body?: string; items?: Item[]; metadata?: Meta[]; columns?: number };

const liga = (portfolioManifest.projects as unknown as { project: { slug: string; title: string }; sections: Section[] }[])
  .find((p) => p.project.slug === "liga");

const section = (id: string): Section => liga?.sections.find((s) => s.id === id) ?? { id };
const strip = (html?: string) => (html ?? "").replace(/<[^>]+>/g, "").trim();
/** Paragraphs of a rich-text body, as plain strings. */
const paras = (html?: string) =>
  (html ?? "")
    .split(/<\/p>/i)
    .map((chunk) => strip(chunk))
    .filter(Boolean);

const ASSET = "/portfolio-assets/liga";

/** Italicises one phrase inside a sentence - the Steep headline signature. */
function emphasise(text: string | undefined, phrase: string): ReactNode {
  if (!text) return null;
  const at = text.indexOf(phrase);
  if (at < 0) return text;
  return (
    <>
      {text.slice(0, at)}
      <em>{phrase}</em>
      {text.slice(at + phrase.length)}
    </>
  );
}

/* --------------------------------------------------------------- primitives */

/** The only elevated surface in the system: a white card with a 10% shadow. */
function Artifact({ children, className = "", label }: { children: ReactNode; className?: string; label?: string }) {
  return (
    <figure className={`st-artifact ${className}`}>
      {children}
      {label ? <figcaption>{label}</figcaption> : null}
    </figure>
  );
}

/**
 * A coded screen cropped to one region, so it reads as a UI fragment rather
 * than a device mockup - the Steep imagery rule. `top` and `h` are in the
 * design file's pixels (the screen is 393x854); `width` is the rendered width
 * of the window, and the screen is scaled to fit it.
 */
function Fragment({
  screen,
  top = 0,
  h = 280,
  width = 300,
  label,
  className = ""
}: {
  screen: LigaScreenId;
  top?: number;
  h?: number;
  width?: number;
  label?: string;
  className?: string;
}) {
  const ref = useRef<HTMLDivElement | null>(null);
  const [active, setActive] = useState(false);
  useEffect(() => {
    const host = ref.current;
    if (!host || typeof IntersectionObserver === "undefined") {
      setActive(true);
      return;
    }
    const io = new IntersectionObserver(([entry]) => setActive(entry.isIntersecting), { threshold: 0.2 });
    io.observe(host);
    return () => io.disconnect();
  }, []);
  const scale = width / 393;
  return (
    <Artifact className={`is-fragment ${className}`} label={label}>
      <div className="st-fragment" style={{ width, height: Math.round(h * scale) }} ref={ref}>
        <div
          className="st-fragment-inner"
          style={{ transform: `scale(${scale}) translateY(${-top}px)` }}
        >
          <LigaPhone screen={screen} active={active} frame={false} />
        </div>
      </div>
    </Artifact>
  );
}

/** A whole device, floating. Used where the shape of the screen is the point. */
function Device({ screen, className = "", label }: { screen: LigaScreenId; className?: string; label?: string }) {
  return (
    <Artifact className={`is-device ${className}`} label={label}>
      <LigaPhoneInView screen={screen} />
    </Artifact>
  );
}

/** An exported shot, floating. */
function Shot({ src, className = "", label }: { src: string; className?: string; label?: string }) {
  return (
    <Artifact className={`is-shot ${className}`} label={label}>
      <img src={`${ASSET}/${src}.webp`} alt="" width={786} height={1692} loading="lazy" decoding="async" />
    </Artifact>
  );
}

/** A gestural line, no axes and no gridlines - Steep's chart rule. */
function Spark({ points, area = true }: { points: number[]; area?: boolean }) {
  const w = 132;
  const h = 40;
  const max = Math.max(...points);
  const min = Math.min(...points);
  const span = max - min || 1;
  const xy = points.map((p, i) => [(i / (points.length - 1)) * w, h - ((p - min) / span) * (h - 6) - 3]);
  const d = xy.map(([x, y], i) => `${i ? "L" : "M"}${x.toFixed(1)} ${y.toFixed(1)}`).join(" ");
  return (
    <svg viewBox={`0 0 ${w} ${h}`} className="st-spark" aria-hidden="true" preserveAspectRatio="none">
      {area ? <path d={`${d} L${w} ${h} L0 ${h} Z`} className="st-spark-area" /> : null}
      <path d={d} className="st-spark-line" />
    </svg>
  );
}

/** A ring, for a proportion. */
function Ring({ value }: { value: number }) {
  const c = 2 * Math.PI * 17;
  return (
    <svg viewBox="0 0 40 40" className="st-ring" aria-hidden="true">
      <circle cx="20" cy="20" r="17" className="st-ring-track" />
      <circle cx="20" cy="20" r="17" className="st-ring-fill" strokeDasharray={`${c * value} ${c}`} />
    </svg>
  );
}

/** Section wrapper: paper or fog, 80px rhythm, 1200px column. */
function Band({ id, tone = "paper", children, className = "" }: { id?: string; tone?: "paper" | "fog"; children: ReactNode; className?: string }) {
  return (
    <section id={id} className={`st-band is-${tone} ${className}`}>
      <div className="st-inner">{children}</div>
    </section>
  );
}

/* -------------------------------------------------------------------- page */

export function LigaSteepCaseStudy({ nextHref, nextTitle, nextCursor }: { nextHref: string; nextTitle: string; nextCursor: string }) {
  const intro = section("intro");
  const project = section("project");
  const outcome = section("outcome");
  const context = section("context");
  const problem = section("problem");
  const accident = section("accident");
  const advantages = section("advantages");
  const fail = section("the-fail");
  const validation = section("validation");
  const everyday = section("everyday");
  const system = section("design-system");
  const reflection = section("reflection");

  const meta = project.metadata ?? [];

  const stats = outcome.items ?? [];
  const charts = [
    <Spark key="a" points={[9, 7, 6, 4, 4]} />,
    <Spark key="b" points={[2, 3, 4, 5, 5, 5]} />,
    <Ring key="c" value={0.72} />
  ];

  return (
    <article className="st-page">
      {/* ---- hero: a headline with product fragments floating around it ---- */}
      <header className="st-hero">
        <div className="st-inner">
          <p className="st-tag">Insurance · 2025</p>
          <h1>{emphasise(intro.subtitle, "never to open")}</h1>
          <p className="st-lede">{paras(project.body)[0]}</p>
          <div className="st-actions">
            <a className="st-pill" href="#accident">The accident flow</a>
            <a className="st-pill is-ghost" href="#system">The system</a>
          </div>

          <div className="st-collage" aria-hidden="true">
            <Fragment screen="claim-status" top={118} h={300} width={300} />
            <Fragment screen="offline" top={236} h={404} width={286} />
            <Fragment screen="home" top={556} h={286} width={300} />
            <div className="st-stat-float">
              <p className="st-stat-label">Report steps</p>
              <p className="st-stat-value">4</p>
              <p className="st-stat-delta">one hand, standing up</p>
              <Spark points={[9, 7, 6, 4, 4]} />
            </div>
          </div>
        </div>
      </header>

      {/* ---- meta: a hairline row, not a definition stack ---- */}
      <Band tone="paper" className="st-meta-band">
        <dl className="st-meta">
          {meta.map((m) => (
            <div key={m.label}>
              <dt>{m.label}</dt>
              <dd>{m.value}</dd>
            </div>
          ))}
        </dl>
        <div className="st-about">
          {paras(project.body).slice(1).map((p, i) => (
            <p key={i}>{p}</p>
          ))}
        </div>
      </Band>

      {/* ---- outcome: three stat cards with gestural charts ---- */}
      <Band tone="fog" id="outcome">
        <p className="st-tag">{outcome.eyebrow}</p>
        <h2 className="st-h2">{outcome.title}</h2>
        <div className="st-stats">
          {stats.map((s, i) => (
            <div className="st-stat" key={s.value}>
              <div className="st-stat-head">
                <p className="st-stat-value">{s.value}</p>
                {charts[i]}
              </div>
              <p className="st-stat-body">{s.label}</p>
            </div>
          ))}
        </div>
        <p className="st-note">{strip(outcome.body)}</p>
      </Band>

      {/* ---- context: one headline over four ghost-tagged numerals ---- */}
      <Band tone="paper" id="context">
        <h2 className="st-h2 is-wide">{context.title}</h2>
        <div className="st-numerals">
          {(context.items ?? []).map((item) => (
            <div key={item.value}>
              <p className="st-numeral">{item.value}</p>
              <p>{item.label}</p>
            </div>
          ))}
        </div>
      </Band>

      {/* ---- problem: the one peach card in the page ---- */}
      <Band tone="paper" id="problem" className="st-problem">
        <div className="st-peach">
          <p className="st-tag is-on-peach">{problem.eyebrow}</p>
          <h2>{problem.title}</h2>
          {problem.subtitle ? <p className="st-peach-lede">{problem.subtitle}</p> : null}
          {paras(problem.body).map((p, i) => (
            <p key={i}>{p}</p>
          ))}
        </div>
        <div className="st-problem-art">
          <Fragment screen="home" top={96} h={360} width={320} label="Where the journey used to start: a policy list and a phone number." />
        </div>
      </Band>

      {/* ---- the accident flow: alternating text + artifact splits ---- */}
      <Band tone="fog" id="accident" className="st-flow-head">
        <p className="st-tag">{accident.eyebrow}</p>
        <h2 className="st-h2">{accident.title}</h2>
        <p className="st-note">{strip(accident.body)}</p>
      </Band>
      {(accident.items ?? []).map((step, i) => (
        <Band tone={i % 2 ? "paper" : "fog"} key={step.screen} className="st-split">
          <div className={`st-split-inner${i % 2 ? " is-flipped" : ""}`}>
            <div className="st-split-copy">
              <p className="st-tag">Step {String(i + 1).padStart(2, "0")}</p>
              <h3>{step.caption}</h3>
              <p>{strip(step.text)}</p>
            </div>
            <div className="st-split-art">
              <Device screen={step.screen as LigaScreenId} />
            </div>
          </div>
        </Band>
      ))}

      {/* ---- six decisions: a three-across neutral card grid ---- */}
      <Band tone="paper" id="advantages">
        <h2 className="st-h2 is-wide">{advantages.title}</h2>
        <p className="st-note">{strip(advantages.body)}</p>
        <div className="st-cards">
          {(advantages.items ?? []).map((item) => {
            const [problemText, didText] = paras(item.text);
            return (
              <article className="st-card" key={item.value}>
                <p className="st-tag">Problem</p>
                <p className="st-card-problem">{problemText}</p>
                <h3>{item.value}</h3>
                <p>{didText}</p>
                {item.shot ? <Shot src={item.shot} className="is-inline" /> : null}
              </article>
            );
          })}
        </div>
      </Band>

      {/* ---- what went wrong, and what the prototype was for ---- */}
      <Band tone="fog" id="process">
        <div className="st-twoup">
          {[fail, validation].map((s) => (
            <div key={s.id}>
              <p className="st-tag">{s.eyebrow}</p>
              <h3 className="st-h3">{s.title}</h3>
              {paras(s.body).map((p, i) => (
                <p key={i}>{p}</p>
              ))}
            </div>
          ))}
        </div>
      </Band>

      {/* ---- the quiet half: a row of floating artifacts ---- */}
      <Band tone="paper" id="everyday">
        <p className="st-tag">{everyday.eyebrow}</p>
        <h2 className="st-h2">{everyday.title}</h2>
        <p className="st-note">{strip(everyday.body)}</p>
        <div className="st-row" style={{ "--row-cols": everyday.columns ?? 4 } as CSSProperties}>
          {(everyday.items ?? []).map((item) => (
            <Shot key={item.asset} src={item.asset as string} label={item.caption} />
          ))}
        </div>
      </Band>

      {/* ---- the system: a four-across neutral card grid ---- */}
      <Band tone="fog" id="system">
        <h2 className="st-h2 is-wide">{system.title}</h2>
        <div className="st-cards is-four">
          {(system.items ?? []).map((item) => (
            <article className="st-card is-quiet" key={item.value}>
              <p className="st-tag">{item.value}</p>
              <h3>{item.label}</h3>
              {paras(item.text).map((p, i) => (
                <p key={i}>{p}</p>
              ))}
            </article>
          ))}
        </div>
      </Band>

      {/* ---- closing statement ---- */}
      <Band tone="paper" id="reflection" className="st-closing">
        <p className="st-tag">{reflection.eyebrow}</p>
        <h2 className="st-h2">{reflection.title}</h2>
        {paras(reflection.body).map((p, i) => (
          <p key={i}>{p}</p>
        ))}
      </Band>

      {/* ---- the pull to the next case, unchanged ---- */}
      <section className="st-next">
        <PullToContinue href={nextHref} kicker="Next case study" title={nextTitle} cursorLabel={nextCursor} />
      </section>
    </article>
  );
}
