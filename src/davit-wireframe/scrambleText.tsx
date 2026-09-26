import { useEffect } from "react";
import gsap from "gsap";
import { ScrambleTextPlugin } from "gsap/ScrambleTextPlugin";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import "./scrambleText.css";

gsap.registerPlugin(ScrambleTextPlugin, ScrollTrigger);

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

    const context = gsap.context(() => {
      gsap.utils.toArray<HTMLElement>(cardSelector).forEach((card) => {
        const labels = gsap.utils
          .toArray<HTMLElement>("[data-scramble]", card)
          .sort((a, b) => Number(a.dataset.scrambleOrder ?? 0) - Number(b.dataset.scrambleOrder ?? 0));
        if (!labels.length) return;

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
          const kind = (label.dataset.scramble as Kind) || "text";
          timeline.to(
            label,
            {
              duration: 0.55 + label.textContent!.length * 0.008,
              ease: "none",
              scrambleText: {
                text: "{original}",
                chars: CHARS[kind],
                speed: 0.7
              }
            },
            i * 0.09
          );
        });
      });
    }, scope);

    /* NO "have I already run" REF HERE. One was tried and it silently killed
       the whole effect: StrictMode mounts, runs this, reverts it, and runs it
       again — and a ref set on the first pass makes the second pass return
       before it rebuilds anything, leaving a page with no triggers at all.
       Nothing needs guarding anyway: `once: true` already fires each label a
       single time, and the context reverts cleanly. */
    return () => context.revert();
  }, [scopeRef, cardSelector]);
}
