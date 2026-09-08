import { useEffect } from "react";
import type { RefObject } from "react";

/** Regions that must never be annotated: above-the-fold heroes, fixed chrome,
 *  self-animating components, and anything already marked up by hand. */
const SKIP_WITHIN = [
  "[data-anim]",
  "[data-no-anim]",
  ".dw-case-intro",".dw-case-opening",
  ".dw-mex-intro",
  ".dw-public-article-hero",
  ".dw-portfolio-index-hero",
  ".dw-carousel",
  ".dw-chat-panel",
  ".dw-header",
  ".dw-site-footer",
  ".dw-pull-next",
  ".dw-case-prevnext"
].join(", ");

/** True when an element's content is a single run of text with no inline markup.
 *  Only these can be line-split — the splitter rebuilds the element from its
 *  textContent, which would destroy <strong> highlights, links and <em>. */
function isPlainText(el: Element) {
  return el.children.length === 0 && Boolean(el.textContent && el.textContent.trim());
}

function hasText(el: Element) {
  return Boolean(el.textContent && el.textContent.trim());
}

/**
 * Applies the motion.min.js attribute layer across a whole page.
 *
 * Headings and plain paragraphs get the line-masked reveal. Paragraphs that
 * carry inline markup — which on this site means the grey-body/black-highlight
 * pattern — animate as whole blocks instead, so the highlights survive.
 * The h1 is never touched: it is the LCP element.
 */
export function useTextMotion(containerRef: RefObject<HTMLElement | null>, enabled = true) {
  useEffect(() => {
    if (!enabled) return;
    const container = containerRef.current;
    if (!container) return;

    const skip = (el: Element) => el.closest(SKIP_WITHIN);

    // headings — the signature move
    container.querySelectorAll<HTMLElement>("h2, h3, h4").forEach((el) => {
      if (skip(el) || !hasText(el)) return;
      el.setAttribute("data-anim", isPlainText(el) ? "mask" : "fade");
    });

    // every paragraph, list item and blockquote — not just the first of each section
    container.querySelectorAll<HTMLElement>("p, li, blockquote, figcaption, dd").forEach((el) => {
      if (skip(el) || !hasText(el)) return;
      el.setAttribute("data-anim", isPlainText(el) ? "rise" : "fade");
    });

    // lists stagger their own children in DOM order
    container.querySelectorAll<HTMLElement>("ul, ol").forEach((el) => {
      if (skip(el)) return;
      if (el.querySelector("[data-anim]")) el.setAttribute("data-anim-group", "");
    });

    // images that already reserve their box get the load fade
    container.querySelectorAll<HTMLImageElement>("img[width][height]").forEach((el) => {
      if (skip(el)) return;
      el.setAttribute("data-anim", "media");
    });

    (window as unknown as { motion?: { scan?: () => void } }).motion?.scan?.();
  }, [containerRef, enabled]);
}
