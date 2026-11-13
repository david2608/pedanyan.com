import { useLayoutEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { SplitText } from "gsap/SplitText";
import "@fontsource/syne/600.css";
import "@fontsource/syne/700.css";
import "./school.css";

/* =============================================================================
   Design Generalist — the course landing page.   /am/school

   Direction. Davit pointed at madewithgsap.com and asked for that. What that
   page actually does — and what is worth taking — is three things: motion is
   the material rather than the decoration, counters are used as graphics, and
   the page closes on a full-width band. The rest of it sells animation effects
   with video loops, which a course cannot do. So the visual language here is
   staggered monumental type on hairline rules, no cards: words are the object,
   the rules carry the information, and every action is a label beside an arrow
   circle rather than a filled pill. One black stage opens it, one black band
   closes it, and everything between is the site's own chalk and ink.

   Motion. GSAP 3.15: SplitText on the stage words, ScrollTrigger for the
   programme counter, the ticker and the row reveals. Every animation is a
   gsap.from(), so the page's resting state IS its final state — which matters
   because scripts/prerender.mjs ships the static HTML, and a page built on
   gsap.to() would ship blank, the way the report's charts did.

   Content. Every line comes from Davit's own copy, with the contradictions his
   correction settled: five months, not "4–5"; 450,000 AMD in total at 90,000 a
   month; individual discounts. The "4-month version" note is gone — the page
   sells one course. Gaps he still has to fill are listed in the handover, not
   invented here.
   ============================================================================= */

gsap.registerPlugin(ScrollTrigger, SplitText);

const FORM = "https://forms.gle/UQoe5kECv8WzXGo28";

const reducedMotion = () =>
  typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

/* 42 lessons x 3 hours = 126. Davit's own arithmetic, not a new claim. */
const NUMBERS = [
  { figure: "5", label: "months" },
  { figure: "2", label: "lessons a week" },
  { figure: "3", label: "hours each" },
  { figure: "42", label: "lessons" },
  { figure: "126", label: "hours in the room" },
  { figure: "12–15", label: "people" }
];

const FITS = [
  "You do UI, and you keep deferring brand.",
  "You do graphics, and you want product thinking.",
  "You keep hearing about AI and code, and you still haven't used either at work."
];

const LEAVE = [
  "A project in the discipline you avoided.",
  "Your AI workflow: which tool, for which step, with which prompt.",
  "An app that runs on a real URL, with a public repo behind it.",
  "A portfolio site, case studies, and one written piece published under your name."
];

const BLOCKS = [
  {
    n: "01",
    title: "Design Generalist",
    weeks: "Weeks 1–5",
    lessons: "10 lessons",
    covers:
      "Product thinking, research without a research team, visual fundamentals, brand, UX writing, motion, design systems.",
    leave: "A finished project in a discipline you haven't worked in."
  },
  {
    n: "02",
    title: "AI Designer",
    weeks: "Weeks 6–9",
    lessons: "8 lessons",
    covers:
      "Prompting, AI in research, flows and prototypes with AI, MCP and workflows, generative graphics, designing AI products.",
    leave: "A workflow you'll use on Monday, and screens for an AI feature."
  },
  {
    n: "03",
    title: "Vibe Coder",
    weeks: "Weeks 10–14",
    lessons: "10 lessons",
    covers:
      "How the web works, Git and GitHub, front end with Claude Code and Cursor, deploying on Vercel, data and auth with Supabase, working with developers.",
    leave: "A live app and a public repo. No more “I'll ask the developer.”"
  },
  {
    n: "04",
    title: "Get Prepared",
    weeks: "Weeks 15–17",
    lessons: "6 lessons",
    covers:
      "Positioning and CV, case studies, a portfolio site, LinkedIn, GitHub and Medium, interviews and negotiation.",
    leave: "A portfolio that shows the generalist, not the specialist."
  },
  {
    n: "05",
    title: "First Brief",
    weeks: "Weeks 18–21",
    lessons: "8 lessons",
    covers:
      "Teams of three or four take a real brief from a real business. Design, build, hand over. Demo day in front of the client.",
    leave: "Client work that shipped, and a case study about work that was not yours to invent."
  }
];

const FAQ = [
  {
    q: "Do I need to code?",
    a: "No. Vibe Coder starts from how the web works. You write code with AI, not from memory."
  },
  {
    q: "Online or in person?",
    a: "In person. The studio is at Vagharshyan 2, behind the American University."
  },
  {
    q: "What do I need?",
    a: "A laptop. We use Figma, Claude, Cursor, GitHub, Vercel and Supabase. Most are free; the AI tools cost about $20 a month during the blocks that need them."
  },
  {
    q: "Can I see it before I pay?",
    a: "Yes. There is a free open lesson before the start. Come, see the format, meet the group, then decide."
  }
];

/* The one action on the page: a label beside an arrow circle, never a filled pill. */
function Apply({ label = "Apply", tone }: { label?: string; tone?: "light" }) {
  return (
    <a className={"sc-act" + (tone === "light" ? " is-light" : "")} href={FORM} target="_blank" rel="noreferrer">
      <span>{label}</span>
      <i aria-hidden="true">
        <svg viewBox="0 0 32 32" fill="none">
          <path d="M7 16h18M18 9l7 7-7 7" stroke="currentColor" strokeWidth="1.6" />
        </svg>
      </i>
    </a>
  );
}

export function SchoolPage() {
  const root = useRef<HTMLDivElement | null>(null);

  useLayoutEffect(() => {
    const host = root.current;
    if (!host || reducedMotion()) return;

    const ctx = gsap.context(() => {
      /* --- the stage words rise, line by line ------------------------------ */
      const words = host.querySelectorAll<HTMLElement>(".sc-stage-word");
      words.forEach((word, i) => {
        const split = new SplitText(word, { type: "chars" });
        gsap.from(split.chars, {
          yPercent: 115,
          duration: 0.9,
          ease: "power3.out",
          stagger: 0.028,
          delay: 0.1 + i * 0.12
        });
      });

      gsap.from(".sc-stage-fade", {
        y: 18,
        autoAlpha: 0,
        duration: 0.8,
        ease: "power2.out",
        stagger: 0.09,
        delay: 0.55
      });

      /* --- the number rail counts in as it arrives ------------------------- */
      gsap.from(".sc-num", {
        scrollTrigger: { trigger: ".sc-numbers", start: "top 82%" },
        yPercent: 40,
        autoAlpha: 0,
        duration: 0.7,
        ease: "power2.out",
        stagger: 0.06
      });

      /* --- every ruled row wipes up from its own rule ---------------------- */
      host.querySelectorAll<HTMLElement>(".sc-row").forEach((row) => {
        gsap.from(row, {
          scrollTrigger: { trigger: row, start: "top 88%" },
          y: 26,
          autoAlpha: 0,
          duration: 0.6,
          ease: "power2.out"
        });
      });

      /* --- the ticker runs with the scroll, not on a loop ------------------ */
      gsap.to(".sc-ticker-run", {
        scrollTrigger: { trigger: ".sc-ticker", start: "top bottom", end: "bottom top", scrub: 0.6 },
        xPercent: -34,
        ease: "none"
      });

      /* --- the programme counter: the GSAP site's device, doing real work --- */
      const readout = host.querySelector<HTMLElement>(".sc-count-now");
      host.querySelectorAll<HTMLElement>(".sc-block").forEach((block) => {
        ScrollTrigger.create({
          trigger: block,
          start: "top 55%",
          end: "bottom 55%",
          onToggle: ({ isActive }) => {
            if (isActive && readout) readout.textContent = block.dataset.n ?? "01";
          }
        });
      });

      /* --- the manifesto words part as you pass them ----------------------- */
      gsap.from(".sc-manifesto .sc-big", {
        scrollTrigger: { trigger: ".sc-manifesto", start: "top 78%" },
        y: 40,
        autoAlpha: 0,
        duration: 0.8,
        ease: "power3.out",
        stagger: 0.1
      });
    }, host);

    return () => ctx.revert();
  }, []);

  return (
    <div className="sc" ref={root}>
      {/* --- the stage ------------------------------------------------------- */}
      <header className="sc-stage">
        <div className="sc-shell">
          <p className="sc-eyebrow sc-stage-fade">A course for working designers · Yerevan</p>

          <h1 className="sc-stage-type">
            <span className="sc-stage-line is-a">
              <span className="sc-stage-word">Design</span>
            </span>
            <span className="sc-stage-line is-b">
              <span className="sc-stage-word">Generalist</span>
            </span>
          </h1>

          <div className="sc-stage-foot">
            <p className="sc-stage-lead sc-stage-fade">
              Five months from an idea to a product that runs. Design, AI and code, in one person —
              yours.
            </p>
            <div className="sc-stage-act sc-stage-fade">
              <Apply tone="light" />
              <p className="sc-stage-note">Starts early December. Free open lesson before that.</p>
            </div>
          </div>
        </div>
      </header>

      {/* --- the numbers ----------------------------------------------------- */}
      <section className="sc-numbers">
        <div className="sc-shell">
          <div className="sc-num-rail">
            {NUMBERS.map((item) => (
              <div className="sc-num" key={item.label}>
                <strong>{item.figure}</strong>
                <span>{item.label}</span>
              </div>
            ))}
          </div>
          <p className="sc-num-where">In person · Vagharshyan 2, Yerevan</p>
        </div>
      </section>

      {/* --- why I built it -------------------------------------------------- */}
      <section className="sc-section sc-manifesto">
        <div className="sc-shell">
          <p className="sc-eyebrow">Why I built it</p>
          <p className="sc-big is-light">Most designers I hire</p>
          <p className="sc-big">are good at one thing.</p>
          <div className="sc-manifesto-pocket">
            <p>
              The products they work on need five. A UI designer who can't do brand work. A brand
              designer who has never framed a problem. Both waiting for a developer to tell them
              what's possible.
            </p>
            <p>
              <strong>AI made the gap smaller and the excuse weaker.</strong> This course closes it:
              one discipline you've never touched, a workflow built on AI, an app you ship yourself,
              and a portfolio that shows all three.
            </p>
          </div>
        </div>
      </section>

      {/* --- the ticker ------------------------------------------------------ */}
      <section className="sc-ticker" aria-hidden="true">
        <div className="sc-ticker-run">
          {Array.from({ length: 4 }).map((_, i) => (
            <span key={i}>
              Design <i>·</i> AI <i>·</i> Code <i>·</i> Career <i>·</i>{" "}
            </span>
          ))}
        </div>
      </section>

      {/* --- who it's for ---------------------------------------------------- */}
      <section className="sc-section">
        <div className="sc-shell">
          <p className="sc-eyebrow">Who it's for</p>
          <h2 className="sc-head">Working designers who are tired of having only one.</h2>
          <div className="sc-rows">
            {FITS.map((line) => (
              <div className="sc-row sc-row-plain" key={line}>
                <p>{line}</p>
              </div>
            ))}
          </div>
          <p className="sc-aside">
            Just starting out? Apply anyway and say so in the form. We'll talk about whether this is
            the right step now.
          </p>
        </div>
      </section>

      {/* --- what you leave with --------------------------------------------- */}
      <section className="sc-section sc-chalk">
        <div className="sc-shell">
          <p className="sc-eyebrow">What you leave with</p>
          <div className="sc-rows is-counted">
            {LEAVE.map((line, i) => (
              <div className="sc-row sc-row-count" key={line}>
                <span className="sc-row-n">{String(i + 1).padStart(2, "0")}</span>
                <p>{line}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* --- the programme ---------------------------------------------------- */}
      <section className="sc-section sc-programme" id="programme">
        <div className="sc-shell">
          <div className="sc-programme-head">
            <div>
              <p className="sc-eyebrow">The programme</p>
              <h2 className="sc-head">
                21 weeks, 42 lessons. Every block ends with something that exists outside the
                classroom.
              </h2>
            </div>
            <p className="sc-count" aria-hidden="true">
              <span className="sc-count-now">01</span>
              <span className="sc-count-of">/ 05</span>
            </p>
          </div>

          <div className="sc-blocks">
            {BLOCKS.map((block) => (
              <article className="sc-row sc-block" data-n={block.n} key={block.n}>
                <span className="sc-block-n">{block.n}</span>
                <div className="sc-block-body">
                  <h3>{block.title}</h3>
                  <p className="sc-block-meta">
                    {block.weeks} <i>·</i> {block.lessons}
                  </p>
                  <p className="sc-block-covers">{block.covers}</p>
                  <p className="sc-block-leave">
                    <span>You leave with</span> {block.leave}
                  </p>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* --- how a lesson works ------------------------------------------------ */}
      <section className="sc-section sc-chalk">
        <div className="sc-shell">
          <div className="sc-lesson">
            <div>
              <p className="sc-eyebrow">How a lesson works</p>
              <h2 className="sc-head">Three hours, and half an hour of it is me talking.</h2>
            </div>
            <div className="sc-lesson-body">
              <div className="sc-lesson-bar" aria-hidden="true">
                <span className="is-theory" />
                <span className="is-practice" />
              </div>
              <p className="sc-lesson-key">
                <span>
                  <i className="is-theory" /> About 30 minutes of theory
                </span>
                <span>
                  <i className="is-practice" /> The rest is practice, studio time with mentors, and
                  critique
                </span>
              </p>
              <p>
                Homework is three to five hours a week, and it is always the next step of the same
                project. Never a worksheet.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* --- who teaches -------------------------------------------------------- */}
      <section className="sc-section">
        <div className="sc-shell">
          <p className="sc-eyebrow">Who teaches</p>
          <div className="sc-teacher">
            <h2 className="sc-head">Davit Pedanyan</h2>
            <div className="sc-teacher-body">
              <p>
                I've designed digital products, brands, interfaces and design systems for 17
                startups. I've taught design at Armenian Code Academy for almost six years, and in
                2026 ACA gave me an award for it.
              </p>
              <p>
                <strong>This course is what I wish someone had taught me in year three.</strong>
              </p>
              <p className="sc-aside">
                This is my own course, not Armenian Code Academy's. Some lessons are led by guest
                mentors: a developer, a brand designer and a design manager.
              </p>
              <p className="sc-teacher-link">
                <a href="/am/designer">More about my work →</a>
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* --- price --------------------------------------------------------------- */}
      <section className="sc-section sc-price" id="price">
        <div className="sc-shell">
          <p className="sc-eyebrow">Price</p>
          <div className="sc-price-grid">
            <p className="sc-price-figure">
              90,000 <span>AMD / month</span>
            </p>
            <div className="sc-rows">
              <div className="sc-row sc-row-plain">
                <p>
                  <strong>450,000 AMD</strong> for the five months. Pay monthly, or all of it
                  upfront.
                </p>
              </div>
              <div className="sc-row sc-row-plain">
                <p>Instalments are available through IDBank's Rocket Line.</p>
              </div>
              <div className="sc-row sc-row-plain">
                <p>
                  Individual discounts exist. If the price is the thing stopping you, say so in the
                  form.
                </p>
              </div>
            </div>
          </div>
          <div className="sc-price-act">
            <Apply />
          </div>
        </div>
      </section>

      {/* --- questions ------------------------------------------------------------ */}
      <section className="sc-section sc-chalk">
        <div className="sc-shell">
          <p className="sc-eyebrow">Questions</p>
          <div className="sc-rows">
            {FAQ.map((item) => (
              <div className="sc-row sc-faq" key={item.q}>
                <h3>{item.q}</h3>
                <p>{item.a}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* --- the closing band ------------------------------------------------------ */}
      <footer className="sc-close">
        <div className="sc-shell">
          <p className="sc-eyebrow">Starts early December</p>
          <p className="sc-close-q">Twelve to fifteen people. Shall we talk?</p>
          <div className="sc-close-act">
            <Apply label="Apply for the open lesson" tone="light" />
            <p className="sc-stage-note">
              Apply and I'll send you the date of the free open lesson.
            </p>
          </div>
          <div className="sc-close-rule" />
          <p className="sc-close-foot">
            <span>Design Generalist · Yerevan</span>
            <span>Vagharshyan 2</span>
          </p>
        </div>
      </footer>
    </div>
  );
}
