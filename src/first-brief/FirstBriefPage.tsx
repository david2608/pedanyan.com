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
   ============================================================================= */

const FORM_COMPANIES = "https://forms.gle/mwpZ76QXiPJqjLsD7";
const FORM_DESIGNERS = "https://forms.gle/Y2hesaXGyuTmv5tL7";
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

export function FirstBriefPage() {
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

      {/* --- the two doors ------------------------------------------------------ */}
      <section className="fb-section" id="apply">
        <div className="fb-shell">
          <p className="fb-eyebrow">Two ways in</p>
          <div className="fb-doors">
            <a className="fb-door" href={FORM_COMPANIES} target="_blank" rel="noreferrer">
              <span className="fb-who">If you run a business</span>
              <h3>Send a project</h3>
              <p>
                The form asks what should exist at the end, who gives feedback, and whether you
                accept the eight rules. Ten minutes.
              </p>
              <span className="fb-door-go">Submit a brief →</span>
            </a>
            <a className="fb-door" href={FORM_DESIGNERS} target="_blank" rel="noreferrer">
              <span className="fb-who">If you are a junior designer</span>
              <h3>Put your name in</h3>
              <p>
                Bring a portfolio link and a one-page CV, both opening without a login. Everything
                else the form asks for, you already know.
              </p>
              <span className="fb-door-go">Apply →</span>
            </a>
          </div>
        </div>
      </section>

      <footer className="fb-foot">
        <div className="fb-shell">
          <p>
            First Brief is run by Davit Pedanyan, Yerevan. It is not an agency and not an
            internship programme. Designers' profiles are shared with partner companies only with
            their consent, and work is shown publicly only where both sides agreed to it.
          </p>
        </div>
      </footer>
    </div>
  );
}
