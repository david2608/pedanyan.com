import { useEffect, useRef, useState, type ReactNode } from "react";
import { ArrowRight, ArrowDown, RotateCcw, Maximize2, X } from "lucide-react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { PullToContinue } from "./PullToContinue";
import "./tinkoffCase.css";

gsap.registerPlugin(ScrollTrigger);
const asset = (name: string) => `/portfolio-assets/tinkoff-checkout/${name}.png`;
const process = [
  { title: "Understand the task", phase: "Discovery", detail: "Business goals, user stories, constraints and deadlines come before a solution.", evidence: "Checkout: identify where customers abandon the funnel.", tags: ["Business goal", "Analytics", "Constraints"] },
  { title: "Find the reason", phase: "Ideation", detail: "Combine data analysis with internal and external research. Map the user journey and challenge the first explanation.", evidence: "Checkout: customer testing and merchant interviews revealed a trust gap.", tags: ["User interviews", "Merchant research", "Journey"] },
  { title: "Explore alternatives", phase: "Interaction design", detail: "Work through information architecture, scenarios and navigation. Agree on a direction with product and engineering.", evidence: "Checkout: explore entry wording, brand recognition, order context and hierarchy.", tags: ["Scenarios", "Variants", "Alignment"] },
  { title: "Test, then revise", phase: "Validation", detail: "When a solution needs validation, build a prototype and return to research. The answer can send the design back for another iteration.", evidence: "Checkout: use multivariate testing to inform the selected direction.", tags: ["Prototype", "Experiment", "Feedback"] },
  { title: "Resolve the whole flow", phase: "Design & specifications", detail: "The process guide includes the main flow, edge cases, loading, empty, error and success states, plus adaptive layouts.", evidence: "Checkout: bring the selected approach into final product design with the cross-functional team.", tags: ["Main flow", "States", "Engineering"] },
  { title: "Check and release", phase: "Review & UI testing", detail: "The guide closes with team review, scenario and UI checks, and a bug-fixing loop before release.", evidence: "Checkout: the optimized experience launched. Conversion improved by approximately 30%.", tags: ["Review", "Fix", "Release"] }
];

function Heading({ label, children }: { label: string; children: ReactNode }) {
  return <header className="tk-heading"><p className="tk-label">{label.replace(/^\d+ \/ /, "")}</p><h2>{children}</h2></header>;
}

function Evidence({ name, caption }: { name: string; caption: string }) {
  const dialog = useRef<HTMLDialogElement>(null);
  return <figure className="tk-evidence">
    <button className="tk-evidence-open" aria-label={`Enlarge: ${caption}`} onClick={() => dialog.current?.showModal()}>
      <img src={asset(name)} alt={caption} loading="lazy" decoding="async" />
      <span className="tk-zoom"><Maximize2 size={18} aria-hidden="true" /></span>
    </button>
    <figcaption>{caption}</figcaption>
    <dialog ref={dialog} className="tk-lightbox" onClick={e => { if (e.target === e.currentTarget) dialog.current?.close(); }}>
      <button aria-label="Close image" onClick={() => dialog.current?.close()} autoFocus><X size={24} /></button>
      <img src={asset(name)} alt={caption} loading="lazy" /><p>{caption}</p>
    </dialog>
  </figure>;
}

function Process() {
  const root = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState(0);
  useEffect(() => {
    const ctx = gsap.context(() => {
      root.current?.querySelectorAll<HTMLElement>(".tk-process-step").forEach((step, index) => {
        ScrollTrigger.create({ trigger: step, start: "top 55%", end: "bottom 55%", onEnter: () => setActive(index), onEnterBack: () => setActive(index) });
      });
    }, root);
    return () => ctx.revert();
  }, []);
  return <div className="tk-process" ref={root}>
    <div className="tk-process-map">
      <p className="tk-label">From question to release</p>
      <ol>{process.map((step, i) => <li key={step.phase} className={i === active ? "is-active" : i < active ? "is-done" : ""}>
        <a href={`#tk-process-${i}`} aria-current={i === active ? "step" : undefined}><span>{String(i + 1).padStart(2, "0")}</span>{step.phase}</a>
      </li>)}</ol>
      <div className={`tk-feedback ${active === 3 ? "is-active" : ""}`}><RotateCcw size={18} /> Evidence can send us back to exploration.</div>
    </div>
    <div className="tk-process-story">{process.map((step, i) => <section className="tk-process-step" id={`tk-process-${i}`} key={step.phase}>
      <p className="tk-label">{String(i + 1).padStart(2, "0")} / {step.phase}</p>
      <h3>{step.title}</h3><p>{step.detail}</p><ul className="tk-process-tags">{step.tags.map(tag => <li key={tag}>{tag}</li>)}</ul>
      <p className="tk-process-evidence">{step.evidence}</p>
    </section>)}</div>
  </div>;
}

export function TinkoffCaseStudy() {
  const root = useRef<HTMLElement>(null);
  useEffect(() => {
    const mm = gsap.matchMedia();
    mm.add("(prefers-reduced-motion: no-preference)", () => {
      const ctx = gsap.context(() => {
        gsap.from(".tk-hero-copy > *", { y: 20, opacity: 0, duration: .7, stagger: .1, clearProps: "all" });
        root.current?.querySelectorAll<HTMLElement>("[data-tk-reveal]").forEach(el => {
          gsap.from(el, { y: 28, opacity: 0, duration: .65, clearProps: "all", scrollTrigger: { trigger: el, start: "top 92%", once: true } });
        });
        root.current?.querySelectorAll<HTMLElement>(".tk-flow").forEach(el => {
          gsap.from(el.children, { y: 16, opacity: 0, stagger: .16, duration: .5, clearProps: "all", scrollTrigger: { trigger: el, start: "top 85%", once: true } });
        });
      }, root);
      return () => ctx.revert();
    });
    return () => mm.revert();
  }, []);
  return <article className="tk-case" ref={root}>
    <section className="tk-hero">
      <div className="tk-inner tk-hero-copy">
        <p className="tk-label">Fintech / E-commerce</p>
        <h1>Tinkoff Checkout</h1>
        <p className="tk-deck">Turning checkout drop-off into ~30% conversion improvement.</p>
        <div className="tk-author"><strong>Davit Pedanyan</strong><span>Lead Product Designer · SME · E-commerce · Fintech</span></div>
      </div>
      <div className="tk-inner tk-hero-footer"><span>Tinkoff Bank / Tinkoff Business</span><a href="#tk-context" aria-label="Read the case study"><ArrowDown size={22} /></a></div>
    </section>

    <section className="tk-section tk-inner" id="tk-context">
      <Heading label="01 / Context">A familiar bank.<br />An unfamiliar checkout.</Heading>
      <div className="tk-two-col" data-tk-reveal>
        <div><p>Tinkoff Checkout gave merchants a checkout they could integrate into their websites and platforms, either as the main flow or a Tinkoff-powered alternative.</p><p>It started as an experimental product with several hundred business users. The opportunity was to turn familiarity with the bank into confidence at the moment of payment.</p></div>
        <dl className="tk-metrics"><div><dt>~38M</dt><dd>Tinkoff customers at the time<br /><small>The bank ecosystem, not Checkout users.</small></dd></div><div><dt>2–3×</dt><dd>Business-user growth during my time on the product<br /><small>A shared product outcome, not attributable to design alone.</small></dd></div></dl>
      </div>
      <ol className="tk-flow tk-ecosystem">{["Tinkoff ecosystem", "Merchant website", "Integrated checkout", "Customer payment"].map(item => <li key={item}>{item}<ArrowRight size={18} aria-hidden="true" /></li>)}</ol>
    </section>

    <section className="tk-section tk-role-band"><div className="tk-inner">
      <Heading label="02 / My contribution">I led the design.<br />We solved the problem together.</Heading>
      <div className="tk-role-grid" data-tk-reveal>
        <div><h3>I owned and led</h3><ul><li>Design strategy and direction</li><li>Design exploration and final product design</li><li>Usability testing and experimentation</li><li>Multivariate testing across key funnel stages</li></ul></div>
        <div><h3>I helped shape</h3><ul><li>Product strategy and roadmap direction</li><li>Quarterly planning and budget discussions</li><li>Metrics analysis with Power BI</li><li>Executive reviews and business priorities</li></ul></div>
        <div><h3>We worked together on</h3><ul><li>User and merchant research</li><li>Qualitative and quantitative analysis</li><li>Problem definition and prioritization</li><li>Launch and iteration</li></ul></div>
      </div>
      <p className="tk-collaborators">Product managers · Researchers · UX writers · Business analysts · Engineering · Merchants</p>
    </div></section>

    <section className="tk-section tk-inner" id="tk-problem">
      <Heading label="03 / The problem">Analytics showed where customers left.<br />Not why.</Heading>
      <p className="tk-prose">We mapped abandonment across three transitions. The goal was to help more customers complete their purchase, not simply make the checkout look different.</p>
      <div className="tk-funnel" data-tk-reveal>{[
        ["Merchant website", "Checkout entry", "Customers did not continue through the entry button."],
        ["Checkout", "Authentication / OTP", "Customers entered, but did not progress through authentication."],
        ["Authentication", "Payment completion", "Even authenticated customers left before completing payment."]
      ].map(([from, to, why], i) => <div className="tk-funnel-row" key={from}><span className="tk-number">0{i + 1}</span><div><h3>{from}<ArrowRight size={22} aria-hidden="true" />{to}</h3><p>{why}</p></div><span className="tk-drop">Drop-off observed</span></div>)}</div>
      <p className="tk-note">Historical stage-level conversion rates are unavailable. No funnel percentages are inferred here.</p>
    </section>

    <section className="tk-section tk-inner">
      <Heading label="04 / Research">The missing context was costing trust.</Heading>
      <div className="tk-two-col" data-tk-reveal><div><h3>Customers</h3><p>Interviews and usability testing helped us understand the experience after someone selected Tinkoff Checkout. The transition led into a new environment without enough recognizable branding or transaction context.</p></div><div><h3>Merchants</h3><p>We paired that research with business-side interviews, including Golden Apple, and quantitative analysis. This connected customer uncertainty with the merchants' checkout problems.</p></div></div>
      <div className="tk-trust" data-tk-reveal><p className="tk-label">The root cause</p><h2>In a financial flow,<br />losing context means<br /><mark>losing trust.</mark></h2><p>Customers needed to understand who was handling the payment and what they were paying for.</p></div>
    </section>

    <section className="tk-section tk-inner" id="tk-process">
      <Heading label="05 / The process">Evidence changed the direction.</Heading>
      <p className="tk-prose">Research, design and validation were connected. The process below adapts the supplied UX/UI guide, with Checkout-specific evidence alongside each stage.</p>
      <Process />
    </section>

    <section className="tk-section tk-design-band" id="tk-design"><div className="tk-inner">
      <Heading label="06 / Entry point">Make the next action clear before the click.</Heading>
      <p className="tk-prose">We explored wording, visual treatment and the value proposition of the entry button. Multiple alternatives went into testing rather than choosing one on appearance alone.</p>
      <div className="tk-image-pair" data-tk-reveal><Evidence name="entry-context" caption="Original button specifications: spacing, width, height and color alternatives." /><Evidence name="button-variants" caption="Original entry-button explorations: labels, benefits and personalized variants." /></div>
      <Heading label="07 / Trust & purchase context">Keep the merchant, the bank<br />and the order connected.</Heading>
      <p className="tk-prose">Stronger brand recognition and visible purchase details addressed the uncertainty after the transition. The explorations compare how authentication, merchant identity and the order summary fit together.</p>
      <div data-tk-reveal><Evidence name="brand-explorations" caption="Original Figma comparison: existing authentication and alternative brand / order-context treatments. These are explorations, not a claimed test winner." /></div>
      <Heading label="08 / Hierarchy & experimentation">Compare alternatives.<br />Then choose on evidence.</Heading>
      <p className="tk-prose">We explored the arrangement of delivery options, purchase information and the next action. Multivariate testing informed the direction that went into final product design.</p>
      <ol className="tk-flow">{["Concept", "Design variants", "Multivariate testing", "Selected direction"].map(item => <li key={item}>{item}<ArrowRight size={18} aria-hidden="true" /></li>)}</ol>
      <div data-tk-reveal><Evidence name="checkout-variants" caption="Original mobile checkout variants from Figma. Individual experiment results and the winning variant are not documented in the supplied materials." /></div>
    </div></section>

    <section className="tk-section tk-inner" id="tk-flow">
      <Heading label="09 / The experience">One purchase.<br />A continuous path to payment.</Heading>
      <ol className="tk-user-flow tk-flow">{["Merchant checkout", "Tinkoff entry", "Recognizable checkout", "Verify order", "Authentication", "Payment", "Success"].map((item, i) => <li key={item}><span className="tk-number">0{i + 1}</span><strong>{item}</strong><ArrowRight size={18} aria-hidden="true" /></li>)}</ol>
      <p className="tk-note">Structured user flow reconstructed from the case brief. Product explorations are shown above; this diagram is not a screen-by-screen release specification.</p>
    </section>

    <section className="tk-section tk-impact"><div className="tk-inner">
      <Heading label="10 / Launched & learned">A clearer checkout.<br />More completed purchases.</Heading>
      <div className="tk-impact-grid" data-tk-reveal><div><p className="tk-impact-number">~30%</p><p className="tk-impact-label">relative improvement in checkout conversion</p></div><div><h3>Optimized and launched</h3><p>The work moved from funnel analysis and research to tested alternatives and a released checkout experience.</p><p>For me, the lesson was to treat trust as part of the transaction itself: the customer needs continuity, not just fewer steps.</p></div></div>
      <p className="tk-note">Approximate relative improvement recalled by Davit. The historical analytics report is not currently available. This is not a 30-percentage-point increase, and no revenue or stage-level uplift is claimed.</p>
    </div></section>
    <PullToContinue href="/am/projects/icredo" kicker="Next case study" title="iCredo" />
  </article>;
}
