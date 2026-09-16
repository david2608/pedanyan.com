import { useLayoutEffect, useRef, useState, type CSSProperties, type ReactNode } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import "./caseStudyMotion.css";

/**
 * Scroll-driven case-study sections (piloted on tempo-v2).
 *
 *   outcome      - the result up front: three figures that count up as they enter
 *   walkthrough  - one pinned phone whose screen advances while the steps scroll past
 *   plate        - a full-bleed colour plate with the phone cropped by its edge,
 *                  drifting slower than the text (ManyChat's feature story, adapted)
 *   strip        - a pinned horizontal run of screens, driven by vertical scroll
 *
 * Every timeline lives in a gsap.context and is scrubbed by ScrollTrigger, so the
 * page never plays *at* the reader - it moves as they move. Reduced motion falls
 * back to static layouts that read the same.
 */

gsap.registerPlugin(ScrollTrigger);

type Item = { asset?: string; screen?: string; caption?: string; text?: string; value?: string; label?: string };

type SectionBase = {
  id: string;
  className: string;
  style: CSSProperties;
  eyebrow?: string;
  title?: string;
  body?: string;
  items?: Item[];
  variant?: string;
  asset?: string;
  screen?: string;
  renderImage: (assetKey?: string, eager?: boolean) => ReactNode;
  renderHtml: (html?: string, className?: string) => ReactNode;
  /** Optional: a code-built screen (see icredoScreens.tsx) instead of an image. */
  renderScreen?: (screenId: string, active: boolean) => ReactNode;
  /** A compact closing observation that belongs to the walkthrough itself. */
  footer?: ReactNode;
};

const itemKey = (item: Item) => item.screen ?? item.asset ?? "";

const reducedMotion = () =>
  typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

/* ------------------------------------------------------------------ outcome */

export function OutcomeSection({ id, className, style, eyebrow, title, body, items = [], renderHtml }: SectionBase) {
  const ref = useRef<HTMLElement | null>(null);
  const stats = items.filter((item) => item.value);

  useLayoutEffect(() => {
    const host = ref.current;
    if (!host || reducedMotion()) return;
    const ctx = gsap.context(() => {
      host.querySelectorAll<HTMLElement>(".dw-outcome-stat strong").forEach((el) => {
        const target = Number(el.dataset.value);
        if (!Number.isFinite(target)) return;
        const counter = { value: 0 };
        el.textContent = "0";
        gsap.to(counter, {
          value: target,
          duration: 1.4,
          ease: "power3.out",
          scrollTrigger: { trigger: el, start: "top 85%", once: true },
          onUpdate: () => {
            el.textContent = String(Math.round(counter.value));
          }
        });
      });
      gsap.from(host.querySelectorAll(".dw-outcome-stat"), {
        y: 28,
        autoAlpha: 0,
        duration: 0.7,
        ease: "power3.out",
        stagger: 0.12,
        scrollTrigger: { trigger: host, start: "top 78%", once: true }
      });
    }, host);
    return () => ctx.revert();
  }, []);

  return (
    <section className={`${className} dw-outcome`} style={style} id={id} ref={ref}>
      <div className="dw-outcome-inner">
        {eyebrow ? <p className="dw-case-eyebrow">{eyebrow}</p> : null}
        {title ? <h2 className="dw-outcome-title">{title}</h2> : null}
        {stats.length ? (
          <dl className="dw-outcome-stats">
            {stats.map((stat) => (
              <div className="dw-outcome-stat" key={stat.label}>
                <dt>{stat.label}</dt>
                <dd>
                  <strong data-value={stat.value}>{stat.value}</strong>
                  {stat.caption ? <span>{stat.caption}</span> : null}
                </dd>
              </div>
            ))}
          </dl>
        ) : null}
        {renderHtml(body, "dw-case-richtext dw-outcome-body")}
      </div>
    </section>
  );
}

/* -------------------------------------------------------------- walkthrough */

export function WalkthroughSection({ id, className, style, eyebrow, title, body, items = [], renderImage, renderHtml, renderScreen, footer }: SectionBase) {
  const ref = useRef<HTMLElement | null>(null);
  const [active, setActive] = useState(0);
  const steps = items.filter((item) => item.asset || (item.screen && renderScreen));
  const renderStep = (step: Item, isActive: boolean, eager = false) =>
    step.screen && renderScreen ? renderScreen(step.screen, isActive) : renderImage(step.asset, eager);

  useLayoutEffect(() => {
    const host = ref.current;
    if (!host) return;
    const ctx = gsap.context(() => {
      host.querySelectorAll<HTMLElement>(".dw-walk-step").forEach((step, index) => {
        ScrollTrigger.create({
          trigger: step,
          start: "top 55%",
          end: "bottom 55%",
          onEnter: () => setActive(index),
          onEnterBack: () => setActive(index)
        });
      });
      if (!reducedMotion()) {
        // The phone breathes with the scroll: a slow drift the steps ride past.
        gsap.fromTo(
          host.querySelector(".dw-walk-phone"),
          { y: 24 },
          { y: -24, ease: "none", scrollTrigger: { trigger: host, start: "top bottom", end: "bottom top", scrub: 0.6 } }
        );
      }
    }, host);
    return () => ctx.revert();
  }, []);

  return (
    <section className={`${className} dw-walk`} style={style} id={id} ref={ref}>
      <header className="dw-walk-head">
        {eyebrow ? <p className="dw-case-eyebrow">{eyebrow}</p> : null}
        {title ? <h2>{title}</h2> : null}
        {renderHtml(body, "dw-case-richtext")}
      </header>
      <div className="dw-walk-inner">
        <div className="dw-walk-stage" aria-hidden="true">
          <div className="dw-walk-phone">
            {steps.map((step, index) => (
              <div className={`dw-walk-screen${active === index ? " is-active" : ""}`} key={itemKey(step)}>
                {renderStep(step, active === index, index === 0)}
              </div>
            ))}
          </div>
          <ol className="dw-walk-dots">
            {steps.map((step, index) => (
              <li className={active === index ? "is-active" : ""} key={`dot-${itemKey(step)}`} />
            ))}
          </ol>
        </div>
        <ol className="dw-walk-steps">
          {steps.map((step, index) => (
            <li className={`dw-walk-step${active === index ? " is-active" : ""}`} key={`step-${itemKey(step)}`}>
              <span className="dw-walk-index">{String(index + 1).padStart(2, "0")}</span>
              <h3>{step.caption}</h3>
              {step.text ? <p>{step.text}</p> : null}
              <figure className="dw-walk-step-shot">{renderStep(step, active === index)}</figure>
            </li>
          ))}
        </ol>
      </div>
      {footer ? <div className="dw-walk-footer">{footer}</div> : null}
    </section>
  );
}

/* -------------------------------------------------------------------- plate */

export function PlateSection({ id, className, style, eyebrow, title, body, asset, screen, variant, renderImage, renderHtml, renderScreen }: SectionBase) {
  const ref = useRef<HTMLElement | null>(null);
  const [seen, setSeen] = useState(false);

  useLayoutEffect(() => {
    const host = ref.current;
    if (!host) return;
    const wake = ScrollTrigger.create({ trigger: host, start: "top 80%", once: true, onEnter: () => setSeen(true) });
    if (reducedMotion()) return () => wake.kill();
    const ctx = gsap.context(() => {
      // Phone drifts slower than the page; the copy arrives a beat after the plate.
      gsap.fromTo(
        host.querySelector(".dw-plate-phone"),
        { y: 90 },
        { y: -30, ease: "none", scrollTrigger: { trigger: host, start: "top bottom", end: "bottom top", scrub: 0.8 } }
      );
      gsap.from(host.querySelectorAll(".dw-plate-copy > *"), {
        y: 26,
        autoAlpha: 0,
        duration: 0.7,
        ease: "power3.out",
        stagger: 0.08,
        scrollTrigger: { trigger: host, start: "top 70%", once: true }
      });
    }, host);
    return () => {
      wake.kill();
      ctx.revert();
    };
  }, []);

  return (
    <section className={`${className} dw-plate is-${variant === "left" ? "left" : "right"}`} style={style} id={id} ref={ref}>
      <div className="dw-plate-inner">
        <div className="dw-plate-copy">
          {eyebrow ? <p className="dw-case-eyebrow">{eyebrow}</p> : null}
          {title ? <h2>{title}</h2> : null}
          {renderHtml(body, "dw-case-richtext")}
        </div>
        <div className="dw-plate-media" aria-hidden="true">
          <div className="dw-plate-phone">{screen && renderScreen ? renderScreen(screen, seen) : renderImage(asset)}</div>
        </div>
      </div>
    </section>
  );
}

/* -------------------------------------------------------------------- strip */

export function StripSection({ id, className, style, eyebrow, title, body, items = [], renderImage, renderHtml }: SectionBase) {
  const ref = useRef<HTMLElement | null>(null);
  const shots = items.filter((item) => item.asset);

  useLayoutEffect(() => {
    const host = ref.current;
    if (!host || reducedMotion()) return;
    const track = host.querySelector<HTMLElement>(".dw-strip-track");
    const viewport = host.querySelector<HTMLElement>(".dw-strip-viewport");
    if (!track || !viewport) return;
    const mm = gsap.matchMedia();
    mm.add("(min-width: 900px)", () => {
      const distance = () => Math.max(0, track.scrollWidth - viewport.clientWidth);
      const tween = gsap.to(track, {
        x: () => -distance(),
        ease: "none",
        scrollTrigger: {
          trigger: host,
          start: "top top",
          end: () => `+=${distance()}`,
          pin: true,
          scrub: 0.6,
          anticipatePin: 1,
          invalidateOnRefresh: true
        }
      });
      return () => tween.kill();
    });
    return () => mm.revert();
  }, []);

  return (
    <section className={`${className} dw-strip`} style={style} id={id} ref={ref}>
      <div className="dw-strip-viewport">
        <header className="dw-strip-head">
          {eyebrow ? <p className="dw-case-eyebrow">{eyebrow}</p> : null}
          {title ? <h2>{title}</h2> : null}
          {renderHtml(body, "dw-case-richtext")}
        </header>
        <div className="dw-strip-track">
          {shots.map((shot, index) => (
            <figure className="dw-strip-shot" key={`${shot.asset}-${index}`}>
              {renderImage(shot.asset)}
              {shot.caption ? <figcaption>{shot.caption}</figcaption> : null}
            </figure>
          ))}
        </div>
      </div>
    </section>
  );
}
