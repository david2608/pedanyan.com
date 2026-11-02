import { useState } from "react";
import "@fontsource/syne/600.css";
import "@fontsource/syne/700.css";
import "./firstBrief.css";

/* =============================================================================
   First Brief — one real project, one junior designer, one small business.

   Every sentence here comes from the launch post of 13 Oct 2026 or from the two
   Google Forms. Nothing about the programme is invented: no number of companies,
   no number of designers, no outcomes, because none have happened yet. The only
   figure on the page is the one from the September research, which is published
   and sourced.

   The forms carry the deadline. The page does not, so it does not go stale the
   day the first wave closes.

   Registration happens on the page. Both Google Forms are embedded in the
   #apply section, one per tab, so a visitor reads the eight rules and then
   signs up without leaving — which is the whole point of having a page to send
   people to. Only the active tab's iframe is mounted, so the page loads one
   form, not two. /am/first-brief#designers opens the designer tab directly.
   ============================================================================= */

/* The canonical form URLs, resolved from the forms.gle short links. The long
   form is what Google will embed; ?embedded=true drops its own page chrome. */
const FORM_COMPANIES =
  "https://docs.google.com/forms/d/e/1FAIpQLScOtNT_XL8L6HqoEXDKhJQmp4-gXz-2yQMhFRQQMMUCDb9QlA/viewform";
const FORM_DESIGNERS =
  "https://docs.google.com/forms/d/e/1FAIpQLScddIpiwbse_YGgOO6bIqcCvXq7vY2ywjOL7aTqaBEQw6GXEw/viewform";

/* The short links stay for the "open in a new tab" fallback: they are the ones
   already in circulation on LinkedIn. */
const SHARE_COMPANIES = "https://forms.gle/mwpZ76QXiPJqjLsD7";
const SHARE_DESIGNERS = "https://forms.gle/Y2hesaXGyuTmv5tL7";

const REPORT = "/report/design-armenia-2026";

const STEPS = [
  {
    title: "You send one real project",
    body: "A landing page, an app flow, a brand refresh, a usability audit. One thing, with a result you could point at and say whether it exists."
  },
  {
    title: "I pick the designer",
    body: "Not the next one on a list. The one whose portfolio already looks like the thing you are asking for."
  },
  {
    title: "Four to eight weeks, up to fifteen hours a week",
    body: "I review the work every week. That review is the part that keeps the quality from sliding, and it is the part you are not paying for."
  },
  {
    title: "Both sides come out ahead",
    body: "You have the work. The designer has a real case, a real client and a reference letter. Nobody spent a salary to find out whether it would work."
  }
];

const RULES = [
  "One defined project with a clear result (landing page, app flow, brand refresh, usability audit).",
  "4–8 weeks, up to 15 hours a week, remote or on-site by agreement.",
  "One named contact person who gives feedback within 48 hours.",
  "The designer may show the work in their portfolio (after launch, or anonymised under NDA).",
  "A short reference letter at the end and an honest yes/no on a possible hire.",
  "A stipend, transport or lunch cover is encouraged; companies that offer one are matched first.",
  "Either side can stop with one week's notice.",
  "Not a replacement for a paid designer: no full-time hours, no open-ended internship."
];

type Side = "companies" | "designers";

const SIDES: Record<Side, {
  who: string;
  tab: string;
  asideTitle: string;
  asideBody: string;
  need: string[];
  form: string;
  share: string;
  frameTitle: string;
}> = {
  companies: {
    who: "If you run a business",
    tab: "Send a project",
    asideTitle: "What the form asks",
    asideBody:
      "What should exist at the end, who gives the feedback, and whether you accept the eight rules above. About ten minutes.",
    need: [
      "The project in one sentence.",
      "One named contact who answers within 48 hours.",
      "Yes or no to the eight rules.",
      "Whether you can cover a stipend, transport or lunch."
    ],
    form: FORM_COMPANIES,
    share: SHARE_COMPANIES,
    frameTitle: "First Brief — registration form for companies"
  },
  designers: {
    who: "If you are a junior designer",
    tab: "Put your name in",
    asideTitle: "What the form asks",
    asideBody:
      "A portfolio link and a one-page CV, both opening without a login. Everything else the form asks for, you already know.",
    need: [
      "A portfolio link anyone can open.",
      "A one-page CV, no login.",
      "The kind of project you want to work on.",
      "LinkedIn, if you have one."
    ],
    form: FORM_DESIGNERS,
    share: SHARE_DESIGNERS,
    frameTitle: "First Brief — registration form for junior designers"
  }
};

/* Arriving at #designers (or #designer) opens the designer tab, so one link can
   be sent to a class and another to a company. */
function initialSide(): Side {
  if (typeof window === "undefined") return "companies";
  return window.location.hash.toLowerCase().startsWith("#designer") ? "designers" : "companies";
}

export function FirstBriefPage() {
  const [side, setSide] = useState<Side>(initialSide);
  const active = SIDES[side];

  return (
    <div className="fb">
      {/* --- the problem, stated as the two people who have it ---------------- */}
      <header className="fb-hero">
        <div className="fb-shell">
          <p className="fb-eyebrow">First Brief · Armenia</p>
          <h1>
            A business needs design. A junior designer needs
            {" "}
            <span className="fb-hero-name">experience</span>. Both are looking,
            and neither is finding.
          </h1>
          <p className="fb-hero-lead">
            First Brief puts one real project in front of one junior designer, for four to eight
            weeks, with me reviewing the work every week. The business gets the thing it needed.
            The designer gets the first entry on a CV that has none.
          </p>
          <p className="fb-hero-cta">
            <a href="#apply">Read the terms, then register on this page →</a>
          </p>
        </div>
      </header>

      {/* --- the deadlock ----------------------------------------------------- */}
      <section className="fb-section">
        <div className="fb-shell">
          <p className="fb-eyebrow">The deadlock</p>
          <div className="fb-pair">
            <div>
              <span className="fb-who">The junior designer</span>
              <h3>Has studied. Has a portfolio. Cannot get in.</h3>
              <p>
                The first job asks for experience, and experience asks for a first job. In my
                September research, <strong>every open UX vacancy in Yerevan wanted three to six
                years</strong>. Not most of them. All of them.
              </p>
              <p>
                <a href={REPORT}>State of Design in Armenia 2026 →</a>
              </p>
            </div>
            <div>
              <span className="fb-who">The small business</span>
              <h3>Knows what is wrong. Cannot justify a hire.</h3>
              <p>
                A website that has not been touched in years. An Instagram no designer has ever
                seen. A checkout where people get lost. Hiring a designer to fix it is expensive,
                and it is a bet. Startups have the same problem with less money.
              </p>
            </div>
          </div>

          <div className="fb-knot">
            <p>
              These two problems solve each other. That is the whole idea, and it is the reason
              the programme can be free: nobody is being asked for anything they do not already
              have going spare.
            </p>
          </div>
        </div>
      </section>

      {/* --- how it works ------------------------------------------------------ */}
      <section className="fb-section">
        <div className="fb-shell">
          <p className="fb-eyebrow">How it works</p>
          <div className="fb-steps">
            {STEPS.map((step, index) => (
              <div className="fb-step" key={step.title}>
                <span className="fb-step-n">{String(index + 1).padStart(2, "0")}</span>
                <h3>{step.title}</h3>
                <p>{step.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* --- what each side carries -------------------------------------------- */}
      <section className="fb-section">
        <div className="fb-shell">
          <p className="fb-eyebrow">What each side gets, and gives</p>
          <div className="fb-gets">
            <div className="fb-get">
              <h3>The business gets</h3>
              <ul>
                <li>Finished work on one defined project.</li>
                <li>A fresh pair of eyes on something nobody in the company looks at any more.</li>
                <li>A possible future teammate, seen working before anyone signs anything.</li>
                <li>No salary risk.</li>
              </ul>
              <h3>And gives</h3>
              <ul>
                <li>A clear brief.</li>
                <li>One person who answers within 48 hours.</li>
                <li>An honest yes or no at the end — about the work, and about a job.</li>
              </ul>
            </div>
            <div className="fb-get">
              <h3>The designer gets</h3>
              <ul>
                <li>A real brief from a real client, not another self-set exercise.</li>
                <li>A case for the portfolio.</li>
                <li>A reference letter.</li>
                <li>Weekly review from me, which is the part that turns the work into experience.</li>
              </ul>
              <h3>And gives</h3>
              <ul>
                <li>Up to fifteen hours a week, for four to eight weeks.</li>
                <li>The work, on time, at the standard.</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* --- the rules, verbatim from the companies form ----------------------- */}
      <section className="fb-section">
        <div className="fb-shell">
          <p className="fb-eyebrow">The eight rules</p>
          <div className="fb-rules">
            {RULES.map((rule) => (
              <div className="fb-rule-row" key={rule}>
                <p>{rule}</p>
              </div>
            ))}
          </div>
          <p className="fb-rules-note">
            These are the terms. The form asks you to accept them before anything else.
            {" "}
            <a href="#apply">Register below →</a>
          </p>
        </div>
      </section>

      {/* --- who the designers are --------------------------------------------- */}
      <section className="fb-section">
        <div className="fb-shell">
          <p className="fb-eyebrow">Who the designers are</p>
          <div className="fb-pair">
            <div>
              <h3>Mostly people I taught.</h3>
              <p>
                UX/UI, product and graphic designers. Most came through my classes at Armenian
                Code Academy; the rest from other courses. Every one of them has been through the
                same standard before they get here — portfolio, CV, LinkedIn.
              </p>
            </div>
            <div>
              <h3>Why I am doing this.</h3>
              <p>
                In the last class of every course I teach, somebody asks the same question: where
                do I get experience? For nine years I have not had a good answer.
                <strong> This is the answer.</strong>
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* --- registration, on the page ------------------------------------------ */}
      <section className="fb-section fb-reg" id="apply">
        <div className="fb-shell">
          <p className="fb-eyebrow">Register</p>
          <h2 className="fb-reg-title">Two ways in. Both start on this page.</h2>

          <div className="fb-tabs" role="tablist" aria-label="Choose how you are joining">
            {(Object.keys(SIDES) as Side[]).map((key) => (
              <button
                key={key}
                type="button"
                role="tab"
                id={`fb-tab-${key}`}
                aria-controls={`fb-panel-${key}`}
                aria-selected={side === key}
                className={"fb-tab" + (side === key ? " is-on" : "")}
                onClick={() => setSide(key)}
              >
                <span className="fb-who">{SIDES[key].who}</span>
                <span className="fb-tab-title">{SIDES[key].tab}</span>
              </button>
            ))}
          </div>

          <div
            className="fb-reg-panel"
            role="tabpanel"
            id={`fb-panel-${side}`}
            aria-labelledby={`fb-tab-${side}`}
          >
            <aside className="fb-reg-aside">
              <h3>{active.asideTitle}</h3>
              <p>{active.asideBody}</p>
              <ul className="fb-reg-need">
                {active.need.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
              <p className="fb-reg-fallback">
                Form not loading?
                {" "}
                <a href={active.share} target="_blank" rel="noreferrer">
                  Open it in a new tab ↗
                </a>
              </p>
            </aside>

            <div className="fb-reg-frame">
              {/* Only the open tab is mounted, so the page loads one form, not two. */}
              <iframe
                key={side}
                title={active.frameTitle}
                src={`${active.form}?embedded=true`}
                loading="lazy"
              >
                Loading…
              </iframe>
            </div>
          </div>
        </div>
      </section>

      <footer className="fb-foot">
        <div className="fb-shell">
          <p>
            First Brief is run by Davit Pedanyan, Yerevan. It is not an agency and not an
            internship programme. Designers' profiles are shared with partner companies only with
            their consent, and work is shown publicly only where both sides agreed to it.
            Registration runs on Google Forms; what you type there goes to Google and to me.
          </p>
        </div>
      </footer>
    </div>
  );
}
