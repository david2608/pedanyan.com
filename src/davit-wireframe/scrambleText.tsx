import { useEffect } from "react";
import gsap from "gsap";
import { ScrambleTextPlugin } from "gsap/ScrambleTextPlugin";
import { SplitText } from "gsap/SplitText";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import "./scrambleText.css";

gsap.registerPlugin(ScrambleTextPlugin, SplitText, ScrollTrigger);

/**
 * Short labels that resolve out of noise as their card arrives.
 *
 * DELIBERATELY NOT THE HEADLINES. A card's headline is the one sentence that
 * sells the case, it runs to fifty characters, and it is set in a proportional
 * font — scrambling it would jitter the line width for the whole run and hold
 * back the only thing the reader came for. Scramble reads as precision on a
 * label and as a gimmick on a sentence, so it is confined to the name, the
 * category, the year and the filter chips.
 *
 * The real text is always in the DOM for assistive technology; only a visually
 * duplicated, aria-hidden copy is ever scrambled. Without that split a screen
 * reader landing mid-animation reads the noise out loud.
 */

type Kind = "text" | "digits";

/* Digits for the year, so a tabular-figure label cannot change width at all.
   Latin capitals for the rest: it is the character set the effect was built
   around, and every label on this page is Latin. Cyrillic or Armenian would
   need its own set — scrambling those into Latin looks like broken encoding
   rather than like decoding. */
const CHARS: Record<Kind, string> = {
  text: "upperCase",
  digits: "0123456789"
};

export function ScrambleText({
  children,
  kind = "text",
  order = 0,
  className
}: {
  children: string;
  kind?: Kind;
  /** Position in the card's own resolve sequence: name, then category, then year. */
  order?: number;
  className?: string;
}) {
  return (
    <span className={className ? `dw-scramble ${className}` : "dw-scramble"}>
      {/* The truth: holds the box, stays in the accessibility tree, stays
          selectable — it is only transparent, never hidden. */}
      <span className="dw-scramble-true">{children}</span>
      <span className="dw-scramble-play" aria-hidden="true" data-scramble={kind} data-scramble-order={order}>
        {children}
      </span>
    </span>
  );
}

/**
 * Drives every ScrambleText inside `scope`. One ScrollTrigger per card rather
 * than per label, so the labels on a card resolve as a sequence and cards do
 * not fire independently as the grid scrolls.
 */
/** One label's scramble. Shared so the reveal and the hover cannot drift apart. */
function scrambleLabel(label: HTMLElement) {
  const kind = (label.dataset.scramble as Kind) || "text";
  return {
    duration: 0.55 + label.textContent!.length * 0.008,
    ease: "none",
    /* A hover landing on a still-running reveal should replace it, not queue
       behind it and scramble a second time after the text has settled. */
    overwrite: true as const,
    scrambleText: { text: "{original}", chars: CHARS[kind], speed: 0.7 }
  };
}

/**
 * THE HEADLINE GETS A DIFFERENT EFFECT, ON PURPOSE.
 *
 * The labels scramble character by character, which suits four to eleven
 * characters and is unreadable across fifty. A headline is split into words
 * instead: each word is scrambled briefly and they resolve in a tight
 * left-to-right stagger, so the sentence assembles word by word and is
 * readable almost at once rather than hissing as one long line.
 *
 * Each word is frozen at its measured width for the duration. Scrambled
 * glyphs are not the same width as real ones, so without that a word grows
 * mid-tween, shoves its neighbours along the line, and can re-wrap the whole
 * headline. SplitText is reverted on completion, which removes the wrapper
 * spans and the frozen widths and hands normal wrapping back.
 */
function scrambleTitleInto(timeline: gsap.core.Timeline, title: HTMLElement, at: number) {
  /* `aria: "auto"` labels the heading with its own text and hides the word
     spans, so splitting a sentence into pieces does not turn it into a list of
     fragments for a screen reader. */
  const split = SplitText.create(title, { type: "words", aria: "auto" });
  const words = split.words as HTMLElement[];
  if (!words.length) {
    split.revert();
    return;
  }

  words.forEach((word) => {
    const { width } = word.getBoundingClientRect();
    word.style.display = "inline-block";
    word.style.width = `${width}px`;
  });

  timeline.to(
    words,
    {
      duration: 0.3,
      ease: "none",
      scrambleText: { text: "{original}", chars: "upperCase", speed: 1 },
      stagger: 0.05
    },
    at
  );
  /* Not onComplete of the tween: the timeline may still be running the labels,
     and reverting early would fight them. */
  timeline.eventCallback("onComplete", () => split.revert());
}

/**
 * Drives every ScrambleText inside `scope`. One ScrollTrigger per card rather
 * than per label, so the labels on a card resolve as a sequence and cards do
 * not fire independently as the grid scrolls. Hovering the card replays the
 * labels — the headline is left alone there, so crossing the grid with the
 * pointer does not set whole sentences churning.
 */
export function useScrambleReveal(
  scopeRef: React.RefObject<HTMLElement | null>,
  cardSelector: string
) {
  useEffect(() => {
    const scope = scopeRef.current;
    if (!scope) return;
    /* The text is already correct in the DOM, so honouring this is simply
       doing nothing. */
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    /* No hover replay where there is no hover: on a touch screen the event
       fires once on tap, scrambling the label of the card being opened. */
    const canHover = window.matchMedia("(hover: hover) and (pointer: fine)").matches;
    const teardown: Array<() => void> = [];

    const context = gsap.context(() => {
      gsap.utils.toArray<HTMLElement>(cardSelector).forEach((card) => {
        const labels = gsap.utils
          .toArray<HTMLElement>("[data-scramble]", card)
          .sort((a, b) => Number(a.dataset.scrambleOrder ?? 0) - Number(b.dataset.scrambleOrder ?? 0));
        const title = card.querySelector<HTMLElement>("[data-scramble-title]");
        if (!labels.length && !title) return;

        const timeline = gsap.timeline({
          scrollTrigger: {
            trigger: card,
            /* The same threshold the card's own reveal uses, so the text
               resolves as the card arrives rather than after it has settled. */
            start: "top 88%",
            once: true
          }
        });

        labels.forEach((label, i) => {
          timeline.to(label, scrambleLabel(label), i * 0.09);
        });
        /* The headline starts once the first label is already resolving, so
           the two read as one arrival rather than two events. */
        if (title) scrambleTitleInto(timeline, title, 0.14);

        if (!canHover || !labels.length) return;
        const replay = () => {
          labels.forEach((label, i) => {
            gsap.to(label, { ...scrambleLabel(label), delay: i * 0.06 });
          });
        };
        card.addEventListener("pointerenter", replay);
        teardown.push(() => card.removeEventListener("pointerenter", replay));
      });
    }, scope);

    /* NO "have I already run" REF HERE. One was tried and it silently killed
       the whole effect: StrictMode mounts, runs this, reverts it, and runs it
       again — and a ref set on the first pass makes the second pass return
       before it rebuilds anything, leaving a page with no triggers at all.
       Nothing needs guarding anyway: `once: true` already fires each label a
       single time, and the context reverts cleanly. */
    return () => {
      teardown.forEach((off) => off());
      context.revert();
    };
  }, [scopeRef, cardSelector]);
}
