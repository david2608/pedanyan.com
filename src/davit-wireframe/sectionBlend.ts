import { useLayoutEffect, type RefObject } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

/**
 * Background colour that travels with the reader. Every top-level section that
 * paints its own solid colour hands that colour to the article instead, and the
 * article tweens between colours as each section reaches the middle of the
 * viewport - so a case study reads as one surface that changes hue, not as a
 * stack of coloured boxes with hard edges.
 *
 * Sections that paint a gradient or an image keep their own background; so do
 * inner panels (the opening card, plates with radius) because they are not
 * top-level. Reduced motion keeps the hard edges.
 */

const SOLID = /^rgba?\((\d+),\s*(\d+),\s*(\d+)(?:,\s*([\d.]+))?\)$/;

function solidColor(value: string): string | null {
  const parts = value.match(SOLID);
  if (!parts) return null;
  const alpha = parts[4] === undefined ? 1 : parseFloat(parts[4]);
  if (alpha < 0.98) return null;
  return `rgb(${parts[1]}, ${parts[2]}, ${parts[3]})`;
}

export function useSectionBackgroundBlend(containerRef: RefObject<HTMLElement | null>) {
  useLayoutEffect(() => {
    const host = containerRef.current;
    if (!host) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    let ctx: gsap.Context | undefined;
    const restore: Array<() => void> = [];

    // After the layout and the dark-section flags have settled.
    const timer = window.setTimeout(() => {
      const sections = Array.from(
        host.querySelectorAll<HTMLElement>(":scope > section, :scope > .pin-spacer > section")
      );
      const base = solidColor(getComputedStyle(host).backgroundColor) ?? "rgb(255, 255, 255)";
      const regions = sections.map((el) => {
        const computed = getComputedStyle(el);
        const own = computed.backgroundImage === "none" ? solidColor(computed.backgroundColor) : null;
        return { el, color: own ?? base, own: own !== null };
      });
      if (!regions.some((region) => region.own)) return;

      regions.forEach((region) => {
        if (!region.own) return;
        const previous = region.el.style.getPropertyValue("background-color");
        const priority = region.el.style.getPropertyPriority("background-color");
        region.el.dataset.blendColor = region.color;
        region.el.style.setProperty("background-color", "transparent", "important");
        restore.push(() => {
          if (previous) region.el.style.setProperty("background-color", previous, priority);
          else region.el.style.removeProperty("background-color");
          delete region.el.dataset.blendColor;
        });
      });

      const hostPrevious = host.style.backgroundColor;
      restore.push(() => { host.style.backgroundColor = hostPrevious; });

      let current = "";
      const go = (color: string) => {
        if (color === current) return;
        current = color;
        gsap.to(host, { backgroundColor: color, duration: 0.75, ease: "power2.out", overwrite: true });
      };

      // Whichever region holds the middle of the viewport right now sets the start.
      const middle = window.scrollY + window.innerHeight * 0.42;
      const start = regions.find((region) => {
        const top = region.el.getBoundingClientRect().top + window.scrollY;
        return middle >= top && middle < top + region.el.offsetHeight;
      }) ?? regions[0];
      gsap.set(host, { backgroundColor: start.color });
      current = start.color;

      ctx = gsap.context(() => {
        regions.forEach((region) => {
          ScrollTrigger.create({
            trigger: region.el,
            start: "top 42%",
            end: "bottom 42%",
            onEnter: () => go(region.color),
            onEnterBack: () => go(region.color)
          });
        });
      }, host);
    }, 700);

    return () => {
      window.clearTimeout(timer);
      ctx?.revert();
      restore.reverse().forEach((fn) => fn());
    };
  }, [containerRef]);
}
