import React, { useLayoutEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { ArrowDown, ArrowUpRight, Blocks, ChartNoAxesCombined, Check, ChevronDown, Command, Fingerprint, Layers3, MessageCircle, MoveUpRight, PanelTop, Sparkles, Users, WalletCards } from "lucide-react";
import { PullToContinue } from "./PullToContinue";
import "./freedxCase.css";

gsap.registerPlugin(ScrollTrigger);

const appScreens = [
  { src: "/portfolio-assets/freedx/home-app.png", alt: "FreedX mobile home screen in dark mode, with account balance, quick actions, rewards and spot markets", label: "Home · dark theme" },
  { src: "/portfolio-assets/freedx/home-light.png", alt: "FreedX mobile home screen in the light visual theme", label: "Home · light theme" },
  { src: "/portfolio-assets/freedx/vip-logout.png", alt: "FreedX logged-out VIP program screen with membership levels and benefits", label: "VIP · logged-out state" }
];

const workstreams = [
  { icon: Blocks, title: "Exchange", copy: "The trading product and its surrounding journeys: discovery, account states, deposits, conversion, trading and history." },
  { icon: WalletCards, title: "Wallet", copy: "A money layer that had to feel coherent with the exchange, not like a separate product bolted onto it." },
  { icon: PanelTop, title: "Backoffice", copy: "Operational tools and internal workflows designed as part of the product ecosystem, not left behind the customer interface." },
  { icon: Command, title: "Cross-platform", copy: "A shared design language spanning product surfaces, so teams could extend the experience without starting from zero each time." }
];

const operatingModel = [
  { n: "01", title: "Make the real problem visible", copy: "We aligned on what was broken, what could be trusted, and what had to be rebuilt before adding more surface area." },
  { n: "02", title: "Work as one product team", copy: "Product and communication designers worked alongside engineering and business partners. Decisions, dependencies and open questions stayed visible." },
  { n: "03", title: "Hand off with context", copy: "Design reviews and handoff became a conversation: states, behavior and rationale travelled with the interface, not as a surprise after delivery." },
  { n: "04", title: "Improve the system as we shipped", copy: "The starter UI kit gave us a base. We reshaped it around FreedX, then made the shared patterns useful across teams and platforms." }
];

function CodeProductBoard() {
  return <div className="dw-freedx-product-board" aria-label="Animated conceptual view of the FreedX product ecosystem">
    <div className="dw-freedx-board-top"><div className="dw-freedx-board-brand"><span className="dw-freedx-brand-mark">f</span><b>freedx</b></div><div className="dw-freedx-board-nav"><span>Overview</span><span>Markets</span><span>Wallet</span></div><div className="dw-freedx-board-avatar">D</div></div>
    <div className="dw-freedx-board-body">
      <aside className="dw-freedx-board-rail"><span className="active"><PanelTop size={16} /></span><span><ChartNoAxesCombined size={16} /></span><span><WalletCards size={16} /></span><span><Layers3 size={16} /></span></aside>
      <div className="dw-freedx-board-main">
        <div className="dw-freedx-board-heading"><div><small>MONDAY, 10:24 AM</small><h3>Good morning, Davit</h3></div><button type="button"><ChevronDown size={13} /> All accounts</button></div>
        <div className="dw-freedx-board-grid">
          <article className="dw-freedx-balance"><span>Total portfolio</span><strong>$84,290.52</strong><small className="positive">↗ 4.28% <i>past 24 hours</i></small><div className="dw-freedx-chart" aria-hidden="true"><svg viewBox="0 0 360 92" preserveAspectRatio="none"><path className="chart-fill" d="M0 73 C24 67 30 76 51 57 S82 61 102 48 S133 56 153 39 S182 51 208 32 S238 45 258 24 S292 37 309 17 S340 28 360 8 V92 H0Z"/><path className="chart-line" d="M0 73 C24 67 30 76 51 57 S82 61 102 48 S133 56 153 39 S182 51 208 32 S238 45 258 24 S292 37 309 17 S340 28 360 8"/></svg></div></article>
          <article className="dw-freedx-asset-list"><div className="dw-freedx-mini-heading"><span>My assets</span><span>View all <ArrowUpRight size={12} /></span></div>{[["₿","Bitcoin","BTC","$42,680.20","+2.4%"],["Ξ","Ethereum","ETH","$28,104.16","+1.8%"],["◎","Solana","SOL","$8,506.16","−0.6%"]].map(([symbol,name,ticker,value,change])=><div className="dw-freedx-asset" key={ticker}><b>{symbol}</b><span><strong>{name}</strong><small>{ticker}</small></span><span className="asset-value"><strong>{value}</strong><small>{change}</small></span></div>)}</article>
          <article className="dw-freedx-action-card"><span className="dw-freedx-action-icon"><WalletCards size={17} /></span><div><strong>Move money</strong><small>Deposit, convert or transfer</small></div><MoveUpRight size={15} /></article>
          <article className="dw-freedx-action-card"><span className="dw-freedx-action-icon violet"><Sparkles size={17} /></span><div><strong>Rewards Hub</strong><small>Your next milestone is close</small></div><MoveUpRight size={15} /></article>
        </div>
      </div>
    </div>
    <div className="dw-freedx-board-caption"><span><i /> CODED PRODUCT VIEW</span><span>EXCHANGE · WALLET · ACCOUNT</span></div>
  </div>;
}

function DesignSystemCard() {
  return <div className="dw-freedx-system-card" aria-label="Illustration of the adapted FreedX design system">
    <div className="dw-freedx-system-top"><span>FREEDX / FOUNDATION</span><span><Command size={14} /> FIGMA</span></div>
    <div className="dw-freedx-system-content"><div className="dw-freedx-system-sidebar"><b>Components</b>{["Color", "Typography", "Buttons", "Inputs", "Navigation", "Data display"].map((x,i)=><span className={i===2?"selected":""} key={x}>{x}</span>)}</div>
      <div className="dw-freedx-system-canvas"><small>COMPONENT / ACTION</small><h3>One kit. FreedX rules.</h3><div className="dw-freedx-button-row"><button type="button" className="primary">Continue <ArrowUpRight size={14}/></button><button type="button" className="secondary">Cancel</button><span className="system-check"><Check size={13}/></span></div><div className="dw-freedx-token-row"><i/><i/><i/><i/><span>Brand tokens</span></div><div className="dw-freedx-system-note"><Fingerprint size={17}/><span><b>Built for the product</b><small>States · variables · reusable patterns</small></span></div></div>
    </div>
    <div className="dw-freedx-system-footer"><span>STARTER UI KIT → FREEDX DESIGN SYSTEM</span><span>SHARED · ADAPTED · AUTOMATED</span></div>
  </div>;
}

export function FreedxScreenGridCard() {
  return <div className="dw-freedx-card-visual" aria-hidden="true"><div className="dw-freedx-card-orbit"/><img src={appScreens[0].src} alt=""/><img src={appScreens[1].src} alt=""/><span>FREEDX / BUILT FROM THE GROUND UP</span></div>;
}

export function FreedxCaseStudy() {
  const root = useRef<HTMLElement | null>(null);
  useLayoutEffect(() => {
    const host = root.current;
    if (!host || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const ctx = gsap.context(() => {
      gsap.fromTo(".dw-freedx-hero-copy > *", { autoAlpha: 0, y: 28 }, { autoAlpha: 1, y: 0, duration: .8, stagger: .1, ease: "power3.out", delay: .15 });
      gsap.fromTo(".dw-freedx-hero-stage", { autoAlpha: 0, scale: .92, rotate: 2 }, { autoAlpha: 1, scale: 1, rotate: 0, duration: 1.1, ease: "power3.out", delay: .25 });
      gsap.utils.toArray<HTMLElement>("[data-fx-reveal]").forEach((el) => gsap.fromTo(el, { autoAlpha: 0, y: 38 }, { autoAlpha: 1, y: 0, duration: .75, ease: "power2.out", scrollTrigger: { trigger: el, start: "top 84%", once: true } }));
      gsap.fromTo(".dw-freedx-product-board", { y: 58, rotateX: 5, scale: .96 }, { y: 0, rotateX: 0, scale: 1, ease: "none", scrollTrigger: { trigger: ".dw-freedx-board-stage", start: "top 78%", end: "bottom 30%", scrub: .8 } });
      gsap.fromTo(".dw-freedx-system-card", { x: 55, rotate: 2, scale: .96 }, { x: 0, rotate: 0, scale: 1, ease: "none", scrollTrigger: { trigger: ".dw-freedx-system-stage", start: "top 82%", end: "bottom 35%", scrub: .8 } });
      gsap.fromTo(".dw-freedx-system-token", { scale: .2, autoAlpha: 0, transformOrigin: "center" }, { scale: 1, autoAlpha: 1, stagger: .12, duration: .65, ease: "back.out(1.5)", scrollTrigger: { trigger: ".dw-freedx-system-stage", start: "top 70%", once: true } });
      gsap.fromTo(".dw-freedx-team-dot", { scale: 0, autoAlpha: 0 }, { scale: 1, autoAlpha: 1, duration: .4, stagger: .08, ease: "back.out(2)", scrollTrigger: { trigger: ".dw-freedx-team-growth", start: "top 75%", once: true } });
      gsap.fromTo(".dw-freedx-proof-line", { scaleX: 0, transformOrigin: "left center" }, { scaleX: 1, duration: 1.2, ease: "power2.inOut", scrollTrigger: { trigger: ".dw-freedx-proof", start: "top 76%", once: true } });
    }, host);
    return () => ctx.revert();
  }, []);

  return <article className="dw-case-study dw-case-freedx" ref={root}>
    <section className="dw-freedx-hero" aria-labelledby="freedx-title">
      <div className="dw-freedx-hero-copy"><p className="dw-freedx-eyebrow"><span/> FREEDX · PRODUCT REBUILD</p><h1 id="freedx-title">We rebuilt the exchange<br/><em>from the pieces left behind.</em></h1><p className="dw-freedx-deck">The previous product had left the team with more to repair than extend. We started again from the foundations: product, process and the way the team worked together.</p><div className="dw-freedx-hero-role"><span>MY ROLE</span><strong>Head of Design</strong><i/><span>TEAM</span><strong>2 → 7</strong></div><a className="dw-freedx-scroll" href="#freedx-problem">Start with the problem <ArrowDown size={16}/></a></div>
      <div className="dw-freedx-hero-stage"><div className="dw-freedx-hero-orbit orbit-a"/><div className="dw-freedx-hero-orbit orbit-b"/><figure className="dw-freedx-device dw-freedx-device-main"><img src={appScreens[0].src} alt={appScreens[0].alt}/><figcaption>FreedX V2 · Home</figcaption></figure><figure className="dw-freedx-device dw-freedx-device-side"><img src={appScreens[1].src} alt={appScreens[1].alt}/><figcaption>One language · two themes</figcaption></figure><span className="dw-freedx-hero-stamp"><span>PRODUCT<br/>REBUILT</span><ArrowUpRight size={17}/></span></div>
      <div className="dw-freedx-hero-bottom"><span>PRODUCT · PEOPLE · PRACTICE</span><span>HEAD OF DESIGN</span><span>FREEDX</span></div>
    </section>

    <section className="dw-freedx-problem" id="freedx-problem" data-fx-reveal><div className="dw-freedx-problem-mark"><span>01</span><i/></div><div className="dw-freedx-problem-copy"><p className="dw-freedx-kicker">The starting point</p><h2>We did not inherit a system.<br/><em>We inherited the cost of not having one.</em></h2><p>The product needed more than a visual refresh. Fragmented experiences, inconsistent patterns and a strained delivery process made each new feature harder to trust and harder to ship. The team had to restore the foundations while continuing to move the product forward.</p><blockquote>“First, make the work understandable again. Then make it work together.”</blockquote></div><div className="dw-freedx-problem-side"><span>WHAT NEEDED REBUILDING</span>{["Product coherence", "Design-to-build handoff", "Reusable foundations", "Team communication"].map(x=><div key={x}><i/><b>{x}</b></div>)}</div></section>

    <section className="dw-freedx-operating" aria-labelledby="freedx-operating-title"><div className="dw-freedx-operating-head" data-fx-reveal><p className="dw-freedx-kicker">How we got unstuck</p><h2 id="freedx-operating-title">Rebuild the way we work,<br/><em>while rebuilding the product.</em></h2><p>No handoff theatre. No design team working in a silo. We made the decisions, dependencies and next steps visible enough for product, design and engineering to move together.</p></div><div className="dw-freedx-operating-track">{operatingModel.map(({n,title,copy},i)=><article key={n} data-fx-reveal><span className="dw-freedx-op-number">{n}</span><div className="dw-freedx-op-node"><i/>{i<operatingModel.length-1&&<b/>}</div><div><h3>{title}</h3><p>{copy}</p></div></article>)}</div><div className="dw-freedx-comms-strip" data-fx-reveal><MessageCircle size={19}/><p>Communication was part of the design deliverable: shared context, explicit decisions, clear ownership and a handoff the next person could actually use.</p><span>WORKING MODEL</span></div></section>

    <section className="dw-freedx-platform" aria-labelledby="freedx-platform-title"><header data-fx-reveal><p className="dw-freedx-kicker">One ecosystem, not one app</p><h2 id="freedx-platform-title">An exchange is the beginning.<br/><em>The product has to hold together around it.</em></h2><p>We brought the customer-facing exchange, wallet and internal operations into the same product conversation, across platforms.</p></header><div className="dw-freedx-workstreams">{workstreams.map(({icon:Icon,title,copy},i)=><article key={title} data-fx-reveal><span className="dw-freedx-ws-index">0{i+1}</span><Icon size={22} strokeWidth={1.6}/><h3>{title}</h3><p>{copy}</p><span className="dw-freedx-ws-arrow"><ArrowUpRight size={16}/></span></article>)}</div></section>

    <section className="dw-freedx-board-section" aria-labelledby="freedx-board-title"><div className="dw-freedx-board-copy" data-fx-reveal><p className="dw-freedx-kicker">The product, made tangible</p><h2 id="freedx-board-title">A useful home is a working system in miniature.</h2><p>The real Figma home screen brings portfolio context, quick money actions, rewards and market discovery into one starting point. This coded companion view animates that relationship: the account, assets and next action belong to the same experience.</p><div className="dw-freedx-board-legend"><span><i/> ACCOUNT CONTEXT</span><span><i/> ASSETS</span><span><i/> NEXT ACTION</span></div></div><div className="dw-freedx-board-stage" data-fx-reveal><CodeProductBoard/></div></section>

    <section className="dw-freedx-system-section" aria-labelledby="freedx-system-title"><div className="dw-freedx-system-intro" data-fx-reveal><p className="dw-freedx-kicker">A foundation the teams could extend</p><h2 id="freedx-system-title">A starter kit was our starting point.<br/><em>FreedX was the design system.</em></h2><p>We adapted the UI kit into a brand-owned, cross-product system: considered foundations, reusable components and variants that made consistency practical across exchange, wallet and backoffice work.</p><p>We used Figma’s component and variable capabilities to keep patterns connected as the system grew. Later, we automated parts of the design-to-code workflow with Claude Code, so the shared language could travel further than the file.</p></div><div className="dw-freedx-system-stage"><div className="dw-freedx-system-token token-one"><span>01</span><b>COLOR</b><i/><i/><i/><i/></div><div className="dw-freedx-system-token token-two"><span>02</span><b>TYPE</b><strong>Aa</strong><small>INTERFACE / CLEAR / SCALABLE</small></div><div className="dw-freedx-system-token token-three"><span>03</span><b>COMPONENT</b><span className="token-control"><Check size={13}/> Confirm action</span></div><DesignSystemCard/></div></section>

    <section className="dw-freedx-brand-section" aria-labelledby="freedx-brand-title"><div className="dw-freedx-brand-copy" data-fx-reveal><p className="dw-freedx-kicker">A product people can recognize</p><h2 id="freedx-brand-title">The brand had to work<br/><em>inside and outside the product.</em></h2><p>We carried the identity beyond interface screens: brand expression, mascot and marketing materials gave the product a recognizable voice, while the same design discipline kept the experience coherent.</p><div className="dw-freedx-brand-tags"><span>BRANDING</span><span>MASCOT</span><span>MARKETING</span><span>PRODUCT LANGUAGE</span></div></div><div className="dw-freedx-brand-visual" data-fx-reveal><div className="dw-freedx-brand-grid"/><div className="dw-freedx-brand-token"><span>F</span><b>freedx</b><small>MAKE YOUR MOVE</small></div><div className="dw-freedx-brand-orbit"><span>FREEDX</span><i/><i/><i/></div><div className="dw-freedx-brand-caption">IDENTITY · PRODUCT · COMMUNICATION</div></div></section>

    <section className="dw-freedx-team" aria-labelledby="freedx-team-title"><div className="dw-freedx-team-copy" data-fx-reveal><p className="dw-freedx-kicker">The team behind the rebuild</p><h2 id="freedx-team-title">From two people<br/><em>to a team of seven.</em></h2><p>We grew from a small starting team into dedicated product and communication design teams. My job as Head of Design was to set direction, develop people and keep the work connected as the team and product surface expanded.</p><div className="dw-freedx-team-metrics"><div><strong>2 → 7</strong><span>TEAM GROWTH</span></div><div><strong>02</strong><span>DESIGN TEAMS</span></div></div></div><div className="dw-freedx-team-growth" aria-label="Seven team members, grown from two" data-fx-reveal><div className="team-growth-label"><span>THE TEAM</span><span>2 → 7</span></div><div className="dw-freedx-team-dots">{Array.from({length:7},(_,i)=><span key={i} className={`dw-freedx-team-dot ${i<2?"founding":"grown"}`}><Users size={i<2?20:17}/></span>)}</div><div className="dw-freedx-team-branches"><span>PRODUCT DESIGN</span><i/><span>COMMUNICATION DESIGN</span></div><p>Different disciplines. One shared direction.</p></div></section>

    <section className="dw-freedx-evidence" aria-labelledby="freedx-evidence-title"><div className="dw-freedx-evidence-head" data-fx-reveal><p className="dw-freedx-kicker">Evidence from the product file</p><h2 id="freedx-evidence-title">Not a deck about a product.<br/><em>The product work itself.</em></h2><p>Selected mobile screens from the FreedX V2 Figma file. These are original exports; the coded views above are companions to explain the system, not substitutes for the product designs.</p></div><div className="dw-freedx-evidence-gallery">{appScreens.map((screen,i)=><figure key={screen.src} data-fx-reveal><div><img src={screen.src} alt={screen.alt}/></div><figcaption><span>{screen.label}</span><span>0{i+1}</span></figcaption></figure>)}</div><div className="dw-freedx-evidence-source"><span>FREEDX V2 · FIGMA</span><span>HOME · THEMING · VIP STATES</span></div></section>

    <section className="dw-freedx-proof" aria-labelledby="freedx-proof-title"><div className="dw-freedx-proof-head" data-fx-reveal><p className="dw-freedx-kicker">What changed</p><h2 id="freedx-proof-title">We turned a repair job<br/><em>into a platform the team could build on.</em></h2></div><div className="dw-freedx-proof-line"/><div className="dw-freedx-proof-grid"><article data-fx-reveal><span>01 / PRODUCT</span><h3>Connected surfaces</h3><p>Exchange, wallet and backoffice approached as one cross-platform ecosystem.</p></article><article data-fx-reveal><span>02 / PRACTICE</span><h3>Clearer collaboration</h3><p>Shared decisions and deliberate communication carried through design and handoff.</p></article><article data-fx-reveal><span>03 / CAPABILITY</span><h3>A team with room to grow</h3><p>From two to seven, with product and communication design capabilities.</p></article></div><p className="dw-freedx-proof-note">This story focuses on the verified work and team changes described here. No product adoption, revenue or trading-performance numbers are implied.</p></section>

    <section className="dw-freedx-next"><PullToContinue href="/am/projects/icredo" kicker="Next case study" title="iCredo" cursorLabel="Dive into iCredo"/></section>
  </article>;
}
