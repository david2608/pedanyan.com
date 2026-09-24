import { useEffect } from "react";
import { trackEvent } from "./ga";

/**
 * "Did they actually read it?"
 *
 * A page view says a case study was opened. It says nothing about whether the
 * reader got past the hero - which is the only question worth asking of a
 * portfolio. This fires once per visit, when the reader reaches the end.
 *
 * It is deliberately not GA4's built-in 90% `scroll` event: that one carries no
 * dimension of its own, so telling "Liga was read to the end 14 times" apart
 * from "Tempo was" means filtering by page path in an exploration every time.
 * A named event with the slug as a parameter is one dimension in any report.
 */

/** Below this the page is barely longer than the window, so reaching the end proves nothing. */
const MIN_SCROLLABLE_PX = 800;
const COMPLETE_AT = 0.9;

function kindOf(path: string): { kind: string; slug: string } | null {
  const project = path.match(/^\/am\/projects\/([^/]+)/);
  if (project) return { kind: "case_complete", slug: project[1] };
  const article = path.match(/^\/am\/public-work\/([^/]+)/);
  if (article) return { kind: "article_complete", slug: article[1] };
  return null;
}

export function useReadDepth(path: string) {
  useEffect(() => {
    const target = kindOf(path);
    if (!target) return;

    let fired = false;

    const check = () => {
      if (fired) return;
      const doc = document.documentElement;
      const scrollable = doc.scrollHeight - window.innerHeight;
      if (scrollable < MIN_SCROLLABLE_PX) return;
      if (window.scrollY / scrollable < COMPLETE_AT) return;
      fired = true;
      trackEvent(target.kind, { case: target.slug, path });
      window.removeEventListener("scroll", check);
    };

    window.addEventListener("scroll", check, { passive: true });
    /* Route changes are client-side, so the new page's height is not final on
       the first frame. Re-measuring on resize covers late layout - images,
       fonts and the 3D canvases all settle after mount. */
    window.addEventListener("resize", check);
    return () => {
      window.removeEventListener("scroll", check);
      window.removeEventListener("resize", check);
    };
  }, [path]);
}
