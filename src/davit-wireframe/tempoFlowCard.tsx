import React, { useEffect, useRef } from "react";
import gsap from "gsap";
import { TempoPhone } from "./tempoScreens";
import "./tempoFlowCard.css";

/* Tempo's Work-grid thumbnail.

   The loop is a round trip between the app's two screens, not the birth of one:

     HOLD      live tracking, settled
     ASSEMBLE  the Restaurants chrome flies in from outside the phone and lands
               on top as tracking dissolves
     HOLD      Restaurants, settled — this is the frame that sells the case
     TURN      the phone turns to 3/4, the screen swaps at the peak of the turn,
               and it settles back face on showing tracking again

   Three rules earned the hard way:

   1. THE PHONE IS NEVER BLANK. The old version built one screen from nothing, so
      for a second and a half a white slab sat in the middle with UI fragments
      orbiting it. Whatever moment a visitor scrolls past, there is a screen.

   2. ONE ENTRY VECTOR. Parts used to come from four directions, which reads as
      "I animated each element" rather than one composed move. Everything now
      travels the same diagonal, and only distance and delay differ.

   3. NOTHING THAT CLIPS EVER TRANSFORMS. `.dw-tempo-secure-phone` carries
      `overflow: hidden` and the corner radius, and a 3D transform on a rounded
      clipping box is what made the corners go square mid-turn. The turntable is
      its parent, `.tp-flow-device` — which is also the only element the stage's
      `perspective` can reach, since perspective applies to direct children only.
      That is why the turn was previously invisible: it was being applied a level
      too deep and rendered as a flat squash. */

/* The chrome that flies. The offers rail, divider and list are scrollable
   content — the Food screen is 1190px tall in an 844 frame — so they stay behind
   the device's mask and reveal in place. Flying them meant an unclipped copy of
   a 1190px screen, which is what made the masking look wrong. */
const MASTHEAD = [".tp-figma-food-header", ".tp-figma-food-navicon", ".tp-figma-food-search"];
const CHIPS = ".tp-figma-food-filters";
const OFFERS = ".tp-figma-food-offers-heading";
const PARTS = [...MASTHEAD, CHIPS, OFFERS];
const CONTENT = ".tp-figma-food-rail, .tp-figma-food-divider, .tp-figma-food-list";

/* one diagonal, above-left, as multiples of the phone's width */
const VECTOR: Record<string, number> = { masthead: 0.5, chips: 0.62, offers: 0.72 };

export function TempoFlowCard() {
  const rootRef = useRef<HTMLDivElement | null>(null);
  const cleanupRef = useRef<(() => void) | null>(null);

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    let tl: gsap.core.Timeline | null = null;

    const context = gsap.context(() => {
      /* The TURNTABLE is the wrapper, never the phone — see rule 3 above. */
      const device = root.querySelector<HTMLElement>(".tp-flow-device");
      const ghost = root.querySelector<HTMLElement>(".tp-flow-ghost");
      const main = root.querySelector<HTMLElement>(".tp-flow-screen-main");
      const track = root.querySelector<HTMLElement>(".tp-flow-screen-track");
      if (!device || !ghost || !main || !track) return;

      /* Each flying chunk gets its own STRIPPED COPY OF THE WHOLE SCREEN.
         The screens size everything in `cqw` against `.tp-figma-food`, so a
         chunk lifted into a plain wrapper resolves its units against the card
         instead and renders roughly 3x too big. Cloning the screen root keeps
         the container and the chunk's own absolute position intact; everything
         except that one chunk is removed so each copy stays cheap. */
      void ghost.offsetWidth;
      const ghostScreen = main.querySelector<HTMLElement>(".tp-figma-food");
      const ghostBox = ghost.getBoundingClientRect();
      const screenBox = ghostScreen ? ghostScreen.getBoundingClientRect() : ghostBox;
      const flyers = new Map<string, HTMLElement>();
      if (ghostScreen) {
        PARTS.forEach((selector) => {
          const copy = ghostScreen.cloneNode(true) as HTMLElement;
          copy.classList.add("tp-flow-fly");
          const keep = copy.querySelector<HTMLElement>(selector);
          if (!keep) return;
          Array.from(copy.children).forEach((child) => {
            if (child !== keep) child.remove();
          });
          /* Pin each copy to the real screen's exact box, measured against the
             ghost. `inset: 0` left them ~5px off and ~4px wide, and that
             difference is exactly what read as a jump at the handoff. */
          copy.style.position = "absolute";
          copy.style.left = `${screenBox.left - ghostBox.left}px`;
          copy.style.top = `${screenBox.top - ghostBox.top}px`;
          copy.style.width = `${screenBox.width}px`;
          copy.style.height = `${screenBox.height}px`;
          copy.style.right = "auto";
          copy.style.bottom = "auto";
          ghost.appendChild(copy);
          flyers.set(selector, copy);
        });
      }
      cleanupRef.current = () => flyers.forEach((copy) => copy.remove());

      const w = device.getBoundingClientRect().width || 248;
      const g = (selector: string) => {
        const copy = flyers.get(selector);
        return copy ? [copy] : [];
      };
      const masthead = MASTHEAD.flatMap(g);
      const chips = g(CHIPS);
      const offers = g(OFFERS);
      const away = (k: keyof typeof VECTOR) => ({ x: -w * VECTOR[k], y: -w * VECTOR[k] * 0.88 });

      const mainChrome = main.querySelectorAll(PARTS.join(", "));
      const mainContent = main.querySelectorAll(CONTENT);
      const sheet = track.querySelectorAll(".tp-figma-tracking-sheet");

      gsap.set([...flyers.values(), device, main, track], { willChange: "transform", force3D: true });

      tl = gsap.timeline({ repeat: -1, paused: true, defaults: { ease: "power3.out", force3D: true } });

      /* ---------- the loop opens on a settled screen, never on nothing ------- */
      tl.set(device, { rotateY: 0, rotateX: 0, scale: 1 })
        .set(track, { autoAlpha: 1 })
        .set(sheet, { yPercent: 0, autoAlpha: 1 })
        .set(main, { autoAlpha: 0 })
        .set(ghost, { autoAlpha: 1 })
        .set(mainChrome, { autoAlpha: 0 })
        .set(mainContent, { autoAlpha: 0, y: 20 })
        .set(masthead, { autoAlpha: 0, scale: 1.02, ...away("masthead") })
        .set(chips, { autoAlpha: 0, scale: 1.02, ...away("chips") })
        .set(offers, { autoAlpha: 0, scale: 1.02, ...away("offers") })
        .to({}, { duration: 2.4 })

        /* ---------- ASSEMBLE : chrome arrives, tracking dissolves under it ---- */
        .addLabel("in")
        .to(main, { autoAlpha: 1, duration: 0.45 }, "in")
        .to(track, { autoAlpha: 0, duration: 0.45 }, "in")
        .to(mainContent, { autoAlpha: 1, y: 0, duration: 0.55, stagger: 0.07 }, "in+=0.08")
        /* opacity resolves over the first stretch of travel, not the whole of it:
           a part at full opacity for a long flight is what reads as debris */
        .to(masthead, { autoAlpha: 1, duration: 0.24 }, "in+=0.14")
        .to(chips, { autoAlpha: 1, duration: 0.22 }, "in+=0.21")
        .to(offers, { autoAlpha: 1, duration: 0.2 }, "in+=0.28")
        /* the masthead is the heaviest thing on screen, so it travels slowest */
        .to(masthead, { x: 0, y: 0, scale: 1, duration: 0.62 }, "in+=0.14")
        .to(chips, { x: 0, y: 0, scale: 1, duration: 0.52 }, "in+=0.21")
        .to(offers, { x: 0, y: 0, scale: 1, duration: 0.46 }, "in+=0.28")
        /* handoff: the copies are now exactly over the real nodes, so revealing
           the real chrome and retiring the ghost is invisible */
        .to(mainChrome, { autoAlpha: 1, duration: 0.18 }, "in+=0.84")
        .to(ghost, { autoAlpha: 0, duration: 0.18 }, "in+=0.84")

        /* ---------- the frame that sells the case ---------------------------- */
        .to({}, { duration: 2.5 })

        /* ---------- TURN : the rotation IS the transition -------------------- */
        .addLabel("turn")
        .to(device, { rotateY: -11, rotateX: 2, duration: 0.72, ease: "power2.inOut" }, "turn")
        .to(main, { autoAlpha: 0, duration: 0.3 }, "turn+=0.5")
        .set(sheet, { yPercent: 10 }, "turn+=0.5")
        .to(track, { autoAlpha: 1, duration: 0.34 }, "turn+=0.56")
        .to(sheet, { yPercent: 0, duration: 0.55, ease: "power2.out" }, "turn+=0.6")
        .to(device, { rotateY: 0, rotateX: 0, duration: 0.78, ease: "power2.inOut" }, "turn+=0.82");
    }, root);

    const io = new IntersectionObserver(
      ([entry]) => {
        if (!tl) return;
        if (entry.isIntersecting) tl.play();
        else tl.pause();
      },
      { threshold: 0, rootMargin: "140px" }
    );
    io.observe(root);

    return () => {
      io.disconnect();
      context.revert();
      cleanupRef.current?.();
      cleanupRef.current = null;
    };
  }, []);

  return (
    <div className="tp-flow-card" ref={rootRef} role="img" aria-label="Tempo app: the restaurants screen assembles, then the phone turns to show live delivery tracking">
      <div className="tp-flow-inner dw-case-study dw-case-tempo dw-case-draft-tempo-v3">
        <div className="tp-flow-stage">
          <div className="tp-flow-device">
            <div className="dw-tempo-secure-phone">
              <div className="tp-flow-screen tp-flow-screen-main"><TempoPhone screen="discover" /></div>
              <div className="tp-flow-screen tp-flow-screen-track"><TempoPhone screen="handoff" /></div>
            </div>
            {/* unclipped duplicate: only the flying chunks are painted */}
            <div className="tp-flow-ghost" aria-hidden="true" />
          </div>
        </div>
      </div>
    </div>
  );
}
