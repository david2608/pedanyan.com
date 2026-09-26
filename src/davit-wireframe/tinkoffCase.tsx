import { useEffect, useRef, useState, type ReactNode } from "react";
import { ArrowRight, ArrowDown, RotateCcw, Maximize2, X, ChevronRight, MapPin, Store, Package, Truck, Check, ShoppingBag } from "lucide-react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { PullToContinue } from "./PullToContinue";
import "./tinkoffCase.css";

gsap.registerPlugin(ScrollTrigger);
const asset = (name: string) => `/portfolio-assets/tinkoff-checkout/${name}.png`;
const deliveryChoices = [
  { id: "pickup", title: "В пункт самовывоза", detail: "12 мая · от 500 ₽", price: 500, icon: Package },
  { id: "store", title: "В магазин", detail: "Бесплатно", price: 0, icon: MapPin },
  { id: "courier", title: "Курьером", detail: "от 620 ₽", price: 620, icon: Truck },
  { id: "yandex", title: "Яндекс Доставка", detail: "12 мая · от 700 ₽", price: 700, icon: Store },
];
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

function CheckoutMobileMockup({ hero = false }: { hero?: boolean }) {
  const [selected, setSelected] = useState("yandex");
  const [submitted, setSubmitted] = useState(false);
  const delivery = deliveryChoices.find(item => item.id === selected) ?? deliveryChoices[3];
  const total = 16042 + delivery.price;
  return <div className={`tk-checkout-device${hero ? " is-hero" : ""}`}>
    <div className="tk-phone-status"><span>9:41</span><span className="tk-status-glyphs" aria-hidden="true"><i /><i /><i /></span></div>
    <div className="tk-phone-topbar"><span className="tk-phone-back"><ArrowRight size={15} /></span><strong>T-БАНК</strong><span /></div>
    <div className="tk-phone-scroll">
      <div className="tk-phone-heading"><span>Оформление заказа</span><ShoppingBag size={16} /></div>
      <div className="tk-phone-address"><span>АДРЕС ДОСТАВКИ</span><strong>Москва, Большая Тульская, 5</strong><ChevronRight size={16} /></div>
      <div className="tk-phone-section-label"><strong>Способ доставки</strong><span>Изменить</span></div>
      <div className="tk-delivery-list" role="group" aria-label="Способ доставки">
        {deliveryChoices.map(option => {
          const Icon = option.icon;
          const active = option.id === selected;
          return <button type="button" key={option.id} className={`tk-delivery-option${active ? " is-selected" : ""}`} aria-pressed={active} onClick={() => { setSelected(option.id); setSubmitted(false); }}>
            <span className="tk-option-icon"><Icon size={17} strokeWidth={2.2} /></span>
            <span className="tk-option-copy"><strong>{option.title}</strong><small>{option.detail}</small></span>
            <span className="tk-option-radio">{active && <Check size={12} strokeWidth={3} />}</span>
          </button>;
        })}
      </div>
      <button type="button" className="tk-installment" onClick={() => setSubmitted(false)}><span className="tk-installment-icon">₽</span><span><strong>Долями</strong><small>4 платежа без переплат</small></span><span className="tk-installment-switch" /></button>
      <div className="tk-phone-products"><span>4 товара</span><strong>{total.toLocaleString("ru-RU")} ₽</strong><ChevronRight size={15} /></div>
    </div>
    <div className="tk-phone-bottom"><div className="tk-phone-total"><span>Итого</span><strong>{total.toLocaleString("ru-RU")} ₽</strong></div><button type="button" className={`tk-submit${submitted ? " is-submitted" : ""}`} onClick={() => setSubmitted(true)}>{submitted ? <><Check size={16} /> Заказ готов</> : "Оформить"}</button></div>
  </div>;
}

function CheckoutPrototype() {
  return <div className="tk-prototype-showcase" data-tk-reveal>
    <div className="tk-prototype-copy">
      <p className="tk-label">Mobile checkout · interactive prototype</p>
      <h3>Delivery choice stays part of checkout.</h3>
      <p>Choose a delivery method. The selected card, delivery price and pinned order total respond together, just as they should in a mobile purchase flow.</p>
    </div>
    <div className="tk-prototype-stage"><CheckoutMobileMockup /></div>
  </div>;
}

export function TinkoffScreenGridCard() {
  /* THE LOOP HAS TO BE LONGER THAN THE CARD IS WIDE.
     Each row used to be three screens duplicated once, so the pattern came
     round every three columns — and roughly four and a half columns are on
     screen at any moment, which meant the same phone was visible twice at the
     same time and the loop read as a stutter rather than as travel.

     Six unique screens per row, still duplicated once for the seamless -50%
     translate, puts the repeat past the card's edge. The rows start at
     different offsets into the twelve screens so they do not line up into
     visible columns of sameness either.

     How much is on screen is close to a constant: a column is 17cqw, so the
     card fits about 5.9 of them whatever its size — until the column hits its
     215px cap, past roughly a 1960px viewport, after which more columns fit
     and a second copy can creep back into frame. Widening the run further
     costs another twelve tiles per row for a case most readers never hit. */
  const ROW_OFFSETS = [0, 5, 10, 3];
  const rows = ROW_OFFSETS.map((offset) =>
    Array.from({ length: 6 }, (_, i) => (offset + i) % 12)
  );
  const screens = [
    { title: "Корзина", kind: "cart" },
    { title: "Доставка", kind: "delivery" },
    { title: "Способ оплаты", kind: "payment" },
    { title: "Оплата частями", kind: "installments" },
    { title: "Адрес доставки", kind: "address" },
    { title: "Заказ оформлен", kind: "success" },
    { title: "Детали заказа", kind: "details" },
    { title: "Статус заказа", kind: "status" },
    { title: "Ваш заказ", kind: "receipt" },
    { title: "Подтверждение", kind: "confirm" },
    { title: "Способ получения", kind: "pickup" },
    { title: "Всё готово", kind: "done" },
  ];
  const tiles = rows.flatMap(row => [...row, ...row]);
  return <div className="tk-screen-grid-card" role="img" aria-label="A moving perspective grid of Tinkoff Checkout mobile screens">
    <div className="tk-screen-grid-plane" aria-hidden="true">
      <div className="tk-screen-grid-track">{tiles.map((tile, index) => {
        const screen = screens[tile];
        return <div className={`tk-grid-screen variant-${tile % 6} screen-${screen.kind}`} key={index}>
        <div className="tk-grid-status"><i /><i /><i /><b>9:41</b></div>
        <div className="tk-grid-top"><span>‹</span><b>T-БАНК</b><span>⋯</span></div>
        <div className="tk-grid-content"><strong>{screen.title}</strong>
          {screen.kind === "cart" || screen.kind === "receipt" ? <div className="tk-grid-items">{[0, 1, 2].map(item => <span key={item}><i /><b /><em>{item === 2 ? "16 742 ₽" : ""}</em></span>)}</div> : null}
          {screen.kind === "delivery" || screen.kind === "pickup" ? <><span className="tk-grid-address"><i /><i /><i /></span><div className="tk-grid-options">{[0, 1, 2].map(option => <span className={option === tile % 3 ? "is-active" : ""} key={option}><i /><b /><em /></span>)}</div></> : null}
          {screen.kind === "payment" ? <div className="tk-grid-options">{[0, 1, 2].map((option) => <span className={option === 0 ? "is-active" : ""} key={option}><i /><b /><em /></span>)}</div> : null}
          {screen.kind === "installments" ? <div className="tk-grid-payments">{["Сегодня", "Через 2 недели", "Через месяц", "Через полтора"].map((label, item) => <span className={item === 0 ? "is-active" : ""} key={label}><i /><b>{label}</b><em>4 186 ₽</em></span>)}</div> : null}
          {screen.kind === "address" ? <><span className="tk-grid-map"><i /><b /><em /></span><span className="tk-grid-address"><i /><i /></span></> : null}
          {screen.kind === "success" || screen.kind === "done" ? <div className="tk-grid-success"><i>✓</i><b>Всё прошло успешно</b><span /></div> : null}
          {screen.kind === "details" || screen.kind === "confirm" || screen.kind === "status" ? <><div className={`tk-grid-progress ${screen.kind}`}><i /><i /><i /></div><span className="tk-grid-address"><i /><i /><i /></span><div className="tk-grid-options">{[0, 1].map(option => <span className={option === 0 ? "is-active" : ""} key={option}><i /><b /><em /></span>)}</div></> : null}
          <span className="tk-grid-total"><i /><b /></span><span className="tk-grid-action" />
        </div>
      </div>})}</div>
    </div>
    <span className="tk-screen-grid-glow" aria-hidden="true" />
    <span className="tk-screen-grid-center-logo" aria-hidden="true"><i>Т</i><b>Т-БАНК</b></span>
  </div>;
}

function TinkoffHeroScene() {
  return <div className="tk-hero-scene" aria-label="Animated preview of a merchant order moving into Tinkoff mobile checkout">
    <div className="tk-merchant-card"><div className="tk-merchant-brand"><span className="tk-brand-dot"><ShoppingBag size={15} /></span><strong>МАГАЗИН</strong><span>Корзина</span></div><p>Ваш заказ</p><div className="tk-merchant-item"><span className="tk-item-shape" /><span><strong>Покупка онлайн</strong><small>4 товара</small></span><b>16 742 ₽</b></div><div className="tk-merchant-pay"><span>Оплатить через</span><strong><span className="tk-tbank-mark">Т</span> Т-БАНК</strong><ArrowRight size={16} /></div></div>
    <div className="tk-handoff-path" aria-hidden="true"><span /><span /><span /></div>
    <div className="tk-hero-phone"><CheckoutMobileMockup hero /></div>
    <div className="tk-floating-proof"><span className="tk-proof-check"><Check size={14} /></span><span><strong>Заказ под контролем</strong><small>Доставка · {"\u041c\u043e\u0441\u043a\u0432\u0430"}</small></span></div>
  </div>;
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
      <div className="tk-inner tk-hero-layout">
        <div className="tk-hero-copy">
          <p className="tk-label">Fintech / E-commerce</p>
          <h1>Tinkoff Checkout</h1>
          <p className="tk-deck">Turning checkout drop-off into ~30% conversion improvement.</p>
          <div className="tk-author"><strong>Davit Pedanyan</strong><span>Lead Product Designer · SME · E-commerce · Fintech</span></div>
        </div>
        <TinkoffHeroScene />
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
      <CheckoutPrototype />
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
