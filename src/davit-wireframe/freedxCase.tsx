import React, { useEffect, useRef } from "react";
import { ArrowDown, ArrowUpRight, BarChart3, CircleDollarSign, Layers3, ShieldCheck, WalletCards } from "lucide-react";
import { PullToContinue } from "./PullToContinue";
import "./freedxCase.css";

const appScreens = [
  {
    src: "/portfolio-assets/freedx/home-app.png",
    alt: "FreedX mobile home screen in dark mode, with account balance, quick actions, rewards and spot markets",
    label: "Home · dark theme"
  },
  {
    src: "/portfolio-assets/freedx/home-light.png",
    alt: "FreedX mobile home screen in the light visual theme",
    label: "Home · light theme"
  },
  {
    src: "/portfolio-assets/freedx/vip-logout.png",
    alt: "FreedX logged-out VIP program screen with membership levels and benefits",
    label: "VIP · logged-out state"
  }
];

const journeys = [
  {
    number: "01",
    title: "Get ready to act",
    copy: "Login, verification and account states frame what a person can do next. The V2 file carries both signed-in and logged-out states, rather than designing only the happy path.",
    icon: ShieldCheck,
    tags: ["Login", "Verification", "Account"]
  },
  {
    number: "02",
    title: "Move between money and markets",
    copy: "The home screen puts balance and daily performance beside Deposit, Convert and Transfer. Markets then let people move from watchlists into Spot or Futures and onward to Buy / Sell.",
    icon: WalletCards,
    tags: ["Home", "Deposit / Withdraw", "Convert", "Buy / Sell"]
  },
  {
    number: "03",
    title: "Give the relationship room to grow",
    copy: "Rewards, contests, referrals and VIP sit alongside the trading product. They are treated as connected destinations, with their own entry and account states.",
    icon: CircleDollarSign,
    tags: ["Rewards", "Trading Contest", "Referral", "VIP"]
  }
];

export function FreedxScreenGridCard() {
  return <div className="dw-freedx-card-visual" aria-hidden="true">
    <div className="dw-freedx-card-orbit" />
    <img src="/portfolio-assets/freedx/home-app.png" alt="" />
    <img src="/portfolio-assets/freedx/home-light.png" alt="" />
    <span>FREEDX / V2</span>
  </div>;
}

export function FreedxCaseStudy() {
  const root = useRef<HTMLElement | null>(null);
  useEffect(() => {
    const host = root.current;
    if (!host || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const targets = [...host.querySelectorAll("[data-portfolio-reveal]")];
    targets.forEach(node => node.classList.add("is-pending"));
    const observer = new IntersectionObserver(entries => entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.remove("is-pending");
        entry.target.classList.add("is-visible");
        observer.unobserve(entry.target);
      }
    }), { threshold: 0.12 });
    targets.forEach(node => observer.observe(node));
    return () => observer.disconnect();
  }, []);

  return <article className="dw-case-study dw-case-freedx" ref={root}>
    <section className="dw-freedx-hero" aria-labelledby="freedx-title">
      <div className="dw-freedx-hero-copy" data-portfolio-reveal>
        <p className="dw-freedx-eyebrow"><span /> Product design · V2 platform</p>
        <h1 id="freedx-title">One exchange.<br /><em>A connected system.</em></h1>
        <p className="dw-freedx-deck">Leading design for FreedX V2, bringing trading, money movement, account tools and rewards into one coherent product experience.</p>
        <a className="dw-freedx-scroll" href="#freedx-brief"><span>Explore the work</span><ArrowDown size={16} /></a>
      </div>
      <div className="dw-freedx-hero-stage" data-portfolio-reveal>
        <div className="dw-freedx-halo" />
        <figure className="dw-freedx-device dw-freedx-device-main"><img src={appScreens[0].src} alt={appScreens[0].alt} /><figcaption>FreedX V2 · Home</figcaption></figure>
        <figure className="dw-freedx-device dw-freedx-device-side"><img src={appScreens[1].src} alt={appScreens[1].alt} /><figcaption>Light theme</figcaption></figure>
        <span className="dw-freedx-market-pulse"><i /> MARKET OPEN</span>
        <span className="dw-freedx-hero-index">01 / 13</span>
      </div>
      <div className="dw-freedx-hero-bottom"><span>DESIGN LEADERSHIP</span><span>PRODUCT · SYSTEM · TEAM</span><span>2026</span></div>
    </section>

    <section className="dw-freedx-brief" id="freedx-brief" data-portfolio-reveal>
      <div className="dw-freedx-section-marker"><span>01</span><i /></div>
      <div className="dw-freedx-brief-copy">
        <p className="dw-freedx-kicker">The assignment</p>
        <h2>Design the whole exchange, not just the trade.</h2>
        <p>FreedX V2 spans the moments around a trade as much as the transaction itself: getting access, understanding an account, moving assets, finding a market, and returning for more.</p>
      </div>
      <dl className="dw-freedx-meta">
        <div><dt>Project</dt><dd>FreedX V2</dd></div>
        <div><dt>Role</dt><dd>Head of Design</dd></div>
        <div><dt>Delivery</dt><dd>Design team</dd></div>
        <div><dt>Scope</dt><dd>Mobile product · design system</dd></div>
      </dl>
    </section>

    <section className="dw-freedx-scope" aria-labelledby="freedx-scope-title">
      <header data-portfolio-reveal><p className="dw-freedx-kicker">The product surface</p><h2 id="freedx-scope-title">Thirteen connected areas.<br />One product language.</h2><p>The V2 App file organizes the work across core product journeys, from sign-in and verification to trading and account history.</p></header>
      <div className="dw-freedx-scope-grid">
        {[
          { n: "01", title: "Access", list: "Login · Verification · Account", icon: ShieldCheck },
          { n: "02", title: "Navigate", list: "Home · Assets · Widget System", icon: Layers3 },
          { n: "03", title: "Transact", list: "Deposit / Withdraw · Convert · Buy / Sell", icon: WalletCards },
          { n: "04", title: "Engage", list: "Trading Contest · Referral · VIP · History", icon: BarChart3 }
        ].map(({ n, title, list, icon: Icon }) => <article key={n} data-portfolio-reveal>
          <span className="dw-freedx-scope-number">{n}</span><Icon aria-hidden="true" size={21} strokeWidth={1.6} /><h3>{title}</h3><p>{list}</p>
        </article>)}
      </div>
    </section>

    <section className="dw-freedx-home-story" aria-labelledby="freedx-home-title">
      <div className="dw-freedx-home-copy" data-portfolio-reveal>
        <p className="dw-freedx-kicker">A home screen with a job</p>
        <h2 id="freedx-home-title">Make the next useful action easy to find.</h2>
        <p>The design brings account context and market activity into the same starting point. Balance and P&amp;L sit with quick actions; reward campaigns, spotlight assets, watchlists and Spot / Futures controls continue the path below.</p>
        <ul><li>Account context before a new action</li><li>Deposit, Convert and Transfer in the first action row</li><li>Market discovery with filters and live movement cues</li></ul>
      </div>
      <figure className="dw-freedx-home-figure" data-portfolio-reveal><img src={appScreens[0].src} alt={appScreens[0].alt} /><figcaption><span>FIGMA · HOME PAGE · ANDROID</span><span>01 — 03</span></figcaption></figure>
    </section>

    <section className="dw-freedx-journeys" aria-labelledby="freedx-journeys-title">
      <header data-portfolio-reveal><p className="dw-freedx-kicker">The journeys</p><h2 id="freedx-journeys-title">Design around intent,<br />not isolated screens.</h2></header>
      <div className="dw-freedx-journey-list">
        {journeys.map(({ number, title, copy, icon: Icon, tags }) => <article key={number} data-portfolio-reveal>
          <span className="dw-freedx-journey-number">{number}</span><Icon aria-hidden="true" size={24} strokeWidth={1.5} />
          <div><h3>{title}</h3><p>{copy}</p><ul>{tags.map(tag => <li key={tag}>{tag}</li>)}</ul></div><ArrowUpRight className="dw-freedx-journey-arrow" size={18} aria-hidden="true" />
        </article>)}
      </div>
    </section>

    <section className="dw-freedx-screen-gallery" aria-labelledby="freedx-screen-title">
      <div className="dw-freedx-gallery-heading" data-portfolio-reveal><div><p className="dw-freedx-kicker">States are part of the design</p><h2 id="freedx-screen-title">Same product.<br />Different moments.</h2></div><p>Explore the actual mobile frames exported from the V2 Figma file. The system covers theme and account-state variation, not a single polished happy path.</p></div>
      <div className="dw-freedx-screen-track">
        {appScreens.map((screen, index) => <figure key={screen.src} data-portfolio-reveal>
          <div className="dw-freedx-screen-image"><img src={screen.src} alt={screen.alt} loading={index === 0 ? "eager" : "lazy"} /></div>
          <figcaption><span>{screen.label}</span><span>0{index + 1}</span></figcaption>
        </figure>)}
      </div>
      <div className="dw-freedx-gallery-note"><span>V2 APP / SELECTED FRAMES</span><span>Scroll to explore <ArrowDown size={14} /></span></div>
    </section>

    <section className="dw-freedx-leadership" aria-labelledby="freedx-leadership-title">
      <div className="dw-freedx-leadership-index"><span>04</span><i /></div>
      <div data-portfolio-reveal><p className="dw-freedx-kicker">How I led the work</p><h2 id="freedx-leadership-title">A shared system.<br />A team behind it.</h2></div>
      <div className="dw-freedx-leadership-copy" data-portfolio-reveal><p>As Head of Design, I set direction and guided the team across the V2 product areas. The work is presented as a team delivery: the decisions, screens and system belong to the people who made them together.</p><p>The Core Design System sits alongside the app work in the Figma folder, while the V2 file separates major journeys into development-ready design areas. That gives the story a useful through-line: align the system, then apply it where users need to move.</p></div>
    </section>

    <section className="dw-freedx-outcome" aria-labelledby="freedx-outcome-title">
      <div className="dw-freedx-outcome-top"><p className="dw-freedx-kicker">What the files show</p><span>V2 APP · FIGMA</span></div>
      <h2 id="freedx-outcome-title">A broad V2 design handoff,<br /><em>organized for the next team.</em></h2>
      <div className="dw-freedx-proof-row"><article><strong>13</strong><span>named product areas across the V2 App file</span></article><article><strong>17</strong><span>pages in the V2 App file, including system and exploration pages</span></article><article><strong>Ready</strong><span>core product pages marked “Ready for dev” in Figma</span></article></div>
      <p className="dw-freedx-outcome-caveat">These describe the design scope and handoff state visible in Figma; product or business impact metrics were not present in the materials reviewed.</p>
    </section>

    <section className="dw-freedx-next"><PullToContinue href="/am/projects/icredo" kicker="Next case study" title="iCredo" cursorLabel="Dive into iCredo" /></section>
  </article>;
}
