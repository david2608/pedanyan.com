import { useCallback, useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import "./experienceDetail.css";

/**
 * Long-form detail for each role.
 *
 * Deliberately kept in code rather than in notionContent.generated.json: that
 * file is overwritten by the Notion sync, and this content would be lost on the
 * next run. `summary` is the single line shown in the timeline; `body` is what
 * opens in the dialog.
 */
export type ExperienceDetail = { summary: string; body: string[] };

export const experienceDetails: Record<string, ExperienceDetail> = {
  "Freedx": {
    summary: "Crypto exchanges ask people to trust software with money that can move against them in a minute.",
    body: [
      "The design problem is that the reassurance a first-time user needs and the speed a daily trader needs live on the same screens, pulling in opposite directions.",
      "I lead design across product, brand and strategy so those two answers stay consistent instead of being settled screen by screen."
    ]
  },
  "Lynon": {
    summary: "The job was to get design out of the request queue.",
    body: [
      "A team that only receives tickets can only improve decisions that were already made somewhere else.",
      "So most of the work was not design work — it was being in the room early enough that the brief was still a question."
    ]
  },
  "T-Bank / Tinkoff": {
    summary: "At that scale a rounding error becomes a support queue.",
    body: [
      "Millions of people used what shipped, which changes how you argue for things.",
      "You stop defending taste and start bringing evidence, because a preference applied to millions of people is a business decision, not a style one."
    ]
  },
  "Delux": {
    summary: "The first time I was accountable for other people's work rather than my own.",
    body: [
      "The uncomfortable part is that your instinct is to fix it yourself.",
      "The job is the opposite — making critique specific enough that someone else can act on it, and then letting their solution be different from yours."
    ]
  },
  "CloudChipr": {
    summary: "I joined as the only designer and left with a team of four.",
    body: [
      "There was no design system, so I built one from zero while the product was still deciding what it was.",
      "The hard part was never the components; it was keeping them stable while the cloud-cost features underneath them kept changing shape."
    ]
  },
  "Webb Fontaine": {
    summary: "Enterprise platforms whose users have no choice but to use them.",
    body: [
      "That removes the feedback loop you normally rely on — nobody churns, they just quietly suffer.",
      "The friction has to be gone looking for, in the field, rather than waited for in a metric."
    ]
  },
  "Material Exchange": {
    summary: "Fashion sourcing still ran on physical swatches flown between continents. We digitised it.",
    body: [
      "The research was the real work: a tour of a Goodwill Outlet warehouse, repeated interviews with material managers, and personas that kept getting rewritten as new user types surfaced.",
      "The system we shipped cut material management from 61 minutes to 23."
    ]
  },
  "The Bank of London": {
    summary: "Regulated fintech is where you learn that “we can’t ship that” is often a legal sentence rather than a design opinion.",
    body: [
      "Most of the craft went into finding the version that satisfied compliance and still made sense to a person reading it for the first time."
    ]
  },
  "Uphold": {
    summary: "Multi-asset trading, where one mistaken tap moves real money.",
    body: [
      "The question was never how to make it beautiful.",
      "It was how to make someone certain about what is about to happen one screen before it happens — and how to say that without turning every action into a warning."
    ]
  },
  "Liga Insurance": {
    summary: "My first product role. I designed interfaces and assumed that was the job.",
    body: [
      "What that period was actually worth was finding out how much of the work happens before anyone opens a design tool — and how rarely the brief you are handed is the problem you need to solve."
    ]
  }
};

export function experienceSummary(company: string, fallback: string) {
  return experienceDetails[company]?.summary ?? fallback;
}

/** Full dialog copy: the timeline sentence, then the rest of the story. */
export function experienceBody(company: string, fallback: string) {
  const detail = experienceDetails[company];
  if (!detail) return [fallback];
  return [detail.summary, ...detail.body];
}

export function hasExperienceDetail(company: string) {
  return Boolean(experienceDetails[company]?.body.length);
}

export type ExperienceModalPayload = {
  company: string;
  role?: string;
  type?: string;
  body: string[];
};

export function ExperienceDetailModal({
  entry,
  onClose
}: {
  entry: ExperienceModalPayload | null;
  onClose: () => void;
}) {
  const panelRef = useRef<HTMLDivElement | null>(null);
  const returnFocusRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (!entry) return;
    returnFocusRef.current = document.activeElement as HTMLElement | null;
    const frame = requestAnimationFrame(() => panelRef.current?.focus());
    return () => cancelAnimationFrame(frame);
  }, [entry]);

  const close = useCallback(() => {
    onClose();
    const target = returnFocusRef.current;
    if (target && document.contains(target)) target.focus();
  }, [onClose]);

  useEffect(() => {
    if (!entry) return;
    const previousOverflow = document.body.style.overflow;
    const previousPad = document.body.style.paddingRight;
    const gap = window.innerWidth - document.documentElement.clientWidth;
    document.body.style.overflow = "hidden";
    if (gap > 0) document.body.style.paddingRight = `${gap}px`;
    return () => {
      document.body.style.overflow = previousOverflow;
      document.body.style.paddingRight = previousPad;
    };
  }, [entry]);

  useEffect(() => {
    if (!entry) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") close();
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [entry, close]);

  if (!entry) return null;

  // The timeline lives inside a pinned, GSAP-transformed container, which would
  // become the containing block for a fixed-position dialog. Portal out of it —
  // but into `.dw-page`, so the dialog keeps the theme variables and the custom
  // cursor rather than landing bare on <body>.
  const host =
    (typeof document !== "undefined" && document.querySelector(".dw-page")) ||
    (typeof document !== "undefined" ? document.body : null);
  if (!host) return null;

  return createPortal(
    <div className="dw-xp-layer">
      <button className="dw-xp-scrim" type="button" aria-label="Close" onClick={close} />
      <div
        className="dw-xp-panel"
        ref={panelRef}
        tabIndex={-1}
        role="dialog"
        aria-modal="true"
        aria-labelledby="dw-xp-title"
      >
        <button
          className="dw-xp-close"
          type="button"
          onClick={close}
          aria-label="Close"
          data-cursor-label="close"
        >
          &times;
        </button>
        <p className="dw-xp-kicker">{[entry.role, entry.type].filter(Boolean).join(" · ")}</p>
        <h2 className="dw-xp-title" id="dw-xp-title">{entry.company}</h2>
        <div className="dw-xp-body">
          {entry.body.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}
        </div>
      </div>
    </div>,
    host
  );
}
