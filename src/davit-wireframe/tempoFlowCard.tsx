import React, { useEffect, useRef } from "react";
import gsap from "gsap";
import { TempoPhone } from "./tempoScreens";
import "./tempoFlowCard.css";

/* Tempo's Work-grid thumbnail — the Restaurants screen, exploded and assembling.

   THE MOCKUP IS THE LAST THING TO ARRIVE, NOT THE FIRST. There is no phone
   on the field at t=0 — no plate, no bezel, no shadow. The bands assemble
   into the composition first, and only then does the mockup GROW OUT OF THE
   COMPOSITION'S OWN BOUNDING BOX: the plate starts at the exact rectangle the
   landed rows occupy and expands to full device size, gaining its bezel
   margin, its corner radius and its shadow on the way. The composition makes
   the device, which is the claim the card is there to make.

   It is a grow, not a dash-drawn outline. A stroke that draws itself and then
   fades out is scaffolding: the eye reads "a box appeared and left", it costs
   most of a second of a seven-second loop, and a 1px stroke shimmers along a
   13% radius at this size. A line that BECOMES the bezel is motion; a line
   that vanishes is a trick.

   The loop takes itself apart again rather than cutting. Reversing the same
   tweens costs nothing and removes the pop at the loop boundary, where the
   settled phone would otherwise snap back to a field of loose rows.

   FOUR BANDS, NOT NINE. The screen has nine row groups, but a piece has to stay
   identifiable while it is detached: below roughly 40px tall at delivered scale
   it stops being "a search field" and becomes a grey sliver. At this card's size
   the phone renders ~218px wide, so the groups are merged until every band
   clears that bar:

     chrome  header + nav icon                 ~41px
     input   search + filter chips             ~76px
     offers  offers heading + card rail       ~140px
     list    divider + list cards              tall

   ONE VECTOR. Bands travel the same up-right diagonal and differ only in
   distance and delay. Four directions reads as "I animated each element";
   one reads as a composed move.

   TRUE SIZE, ALWAYS. No perspective, no translateZ, no scale: a band is the
   same size exploded as it is landed, so the handoff to the real screen is
   invisible. Depth is carried by a static box-shadow and the stacking order
   alone. No rotateZ, no isometric tilt, no idle float, and no animated
   filter — animating blur re-rasterises the whole subtree every frame. */

const BANDS: Array<{ key: string; sel: string[] }> = [
  /* No .tp-figma-food-status: on this screen it is an empty 17px spacer with
     no text and no children, so including it gave the chrome band a ground
     with a blank half. The live screen still has it; the band does not. */
  { key: "chrome", sel: [".tp-figma-food-header", ".tp-figma-food-navicon"] },
  { key: "input", sel: [".tp-figma-food-search", ".tp-figma-food-filters"] },
  { key: "offers", sel: [".tp-figma-food-offers-heading", ".tp-figma-food-rail"] },
  { key: "list", sel: [".tp-figma-food-divider", ".tp-figma-food-list"] }
];

export function TempoFlowCard() {
  const rootRef = useRef<HTMLDivElement | null>(null);
  const cleanupRef = useRef<(() => void) | null>(null);

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    let tl: gsap.core.Timeline | null = null;

    const context = gsap.context(() => {
      const ghost = root.querySelector<HTMLElement>(".tp-flow-ghost");
      const main = root.querySelector<HTMLElement>(".tp-flow-screen-main");
      if (!ghost || !main) return;

      /* Each band is a STRIPPED COPY OF THE WHOLE SCREEN keeping only that
         band's rows. Cloning the screen root rather than lifting the rows
         matters: the screens size everything in `cqw` against `.tp-figma-food`,
         so a row lifted into a plain wrapper resolves its units against the card
         and renders about three times too big. */
      void ghost.offsetWidth;
      const screen = main.querySelector<HTMLElement>(".tp-figma-food");
      const ghostBox = ghost.getBoundingClientRect();
      const screenBox = screen ? screen.getBoundingClientRect() : ghostBox;
      /* THE LEGIBILITY FLOOR. A band has to stay identifiable while it is
         detached; below roughly 150px of screen width the rows inside it fall
         under 40px tall and read as grey slivers rather than as UI — which is
         exactly what made the first version of this card look like debris. On a
         phone the card is too small for that, so there is no explosion: the
         settled screen is the default DOM state and simply stays. */
      if (screenBox.width < 150) return;

      /* The card's scroll-reveal can still be scaling everything while this
         builds, so getBoundingClientRect returns SCALED pixels. The clone is
         pinned in the ghost's own unscaled CSS-pixel space, and its box drives
         the `cqw`/`em` the screens are written in — so a scaled width makes
         every row inside render ~10% small and jump at the handoff. Take the
         box from offsetWidth/Height and divide the offsets back out. */
      const gr = ghost.getBoundingClientRect();
      const uiScale = ghost.offsetWidth ? gr.width / ghost.offsetWidth : 1;
      const px = (v: number) => (uiScale ? v / uiScale : v);

      const made: HTMLElement[] = [];

      if (screen) {
        BANDS.forEach((band) => {
          const copy = screen.cloneNode(true) as HTMLElement;
          copy.classList.add("tp-flow-band");
          copy.dataset.band = band.key;
          const keep = band.sel
            .map((s) => copy.querySelector<HTMLElement>(s))
            .filter((n): n is HTMLElement => Boolean(n));
          if (!keep.length) return;
          Array.from(copy.children).forEach((child) => {
            if (!keep.includes(child as HTMLElement)) child.remove();
          });
          /* Pin to the real screen's exact box, measured against the ghost.
             `inset: 0` left the copies a few px off and that difference is
             precisely what read as a jump at the handoff. */
          copy.style.position = "absolute";
          copy.style.left = `${px(screenBox.left - ghostBox.left)}px`;
          copy.style.top = `${px(screenBox.top - ghostBox.top)}px`;
          copy.style.width = `${screen.offsetWidth}px`;
          copy.style.height = `${screen.offsetHeight}px`;
          /* The screens are written in `em`, and that base comes from a
             container query the clone sits outside of — LIGA's real screen
             computes to 7px here while a detached clone falls back to the 15px
             design value, so every row inside rendered ~10% small and jumped at
             the handoff. Pin the computed base so the clone measures identically
             to the screen it came from. */
          copy.style.fontSize = getComputedStyle(screen).fontSize;
          copy.style.right = "auto";
          copy.style.bottom = "auto";
          ghost.appendChild(copy);
          made.push(copy);
        });
      }
      cleanupRef.current = () => made.forEach((c) => c.remove());
      if (!made.length) return;

      /* Each band is a screen-sized clone with one strip painted, so nudging the
         whole clone leaves every group roughly where it already sits INSIDE the
         screen — which is why they read as faint overlapping ghosts rather than
         as separate layers. Measure the strip's own box and move THAT to a slot
         on the flat field, so the groups are genuinely laid out beside the
         mockup and then travel into it. */
      const stage = root.querySelector<HTMLElement>(".tp-flow-stage");
      const stageBox = (stage ?? ghost).getBoundingClientRect();
      const content = made.map((copy) => {
        const box = copy.getBoundingClientRect();
        const strip = BANDS
          .find((b) => b.key === copy.dataset.band)!
          .sel.map((sl) => copy.querySelector<HTMLElement>(sl))
          .filter((n): n is HTMLElement => Boolean(n))
          .map((n) => n.getBoundingClientRect());
        /* The clone is clipped to the screen box in CSS, so a rail that scrolls
           sideways or a list that runs past the fold paints far less than its
           layout box reports. Clamp to what is actually visible, or the slot
           stack is spaced for heights no one can see. */
        const left = Math.max(Math.min(...strip.map((r) => r.left)) - box.left, 0);
        const right = Math.min(Math.max(...strip.map((r) => r.right)) - box.left, box.width);
        const top = Math.max(Math.min(...strip.map((r) => r.top)) - box.top, 0);
        const bottom = Math.min(Math.max(...strip.map((r) => r.bottom)) - box.top, box.height);
        return { left, top, w: right - left, h: bottom - top };
      });

      /* ONE GROUND PER BAND, at the band's own content box. Painting the rows
         themselves white made a band read as two or three loose slabs — and
         the chrome band's status bar is empty, so it read as a stray white bar
         with nothing in it. A single rounded card behind the whole strip is
         what makes a band look like a component group rather than debris.
         `z-index: -1` puts it behind the rows inside the clone's own stacking
         context, which GSAP's transform guarantees. */
      made.forEach((copy, i) => {
        const c = content[i];
        const pad = px(6);
        const ground = document.createElement("i");
        ground.className = "tp-flow-band-ground";
        ground.style.left = `${px(c.left) - pad}px`;
        ground.style.top = `${px(c.top) - pad}px`;
        ground.style.width = `${px(c.w) + pad * 2}px`;
        ground.style.height = `${px(c.h) + pad * 2}px`;
        copy.insertBefore(ground, copy.firstChild);
      });

      /* THE EXPLODED LAYOUT IS A CENTRED VERTICAL FAN, not a pile in one corner.
         It used to be a column down the left, which made sense while a mockup
         held the right half — with the mockup gone until the end, that left the
         card two-thirds empty and the bands reading as debris swept to one side.

         Each band keeps its OWN horizontal position within the screen and gets
         only a small alternating offset, so the collect is almost pure vertical
         compression: the rows visibly stack up into a screen rather than flying
         in from somewhere. The stack is centred on the stage and spread to fill
         its height, so the card is balanced before anything moves. */
      const padY = stageBox.height * 0.045;
      const avail = stageBox.height - padY * 2;
      const totalH = content.reduce((a, c) => a + c.h, 0);
      const gaps = Math.max(content.length - 1, 1);
      const minGap = stageBox.height * 0.012;
      let gap = (avail - totalH) / gaps;
      let squeeze = 1;
      if (gap < minGap) {
        gap = minGap;
        squeeze = avail / (totalH + minGap * gaps);
      }
      const tops: number[] = [];
      let run = 0;
      content.forEach((c) => {
        tops.push(run);
        run += c.h * squeeze + gap;
      });
      const stackH = run - gap;
      const top0 = stageBox.top + (stageBox.height - stackH) / 2;
      const fan = stageBox.width * 0.03;
      const slot = (i: number) => ({
        vx: screenBox.left + content[i].left + (i % 2 ? fan : -fan),
        vy: top0 + tops[i]
      });

      /* ---- the mockup's two boxes -----------------------------------------
         The plate is a sibling of the clipping phone shell, so its shadow is
         not cut off, and it is the ONLY thing that paints the device. It grows
         between two rectangles, both measured in the device's own unscaled
         space: the composition's union box (where the landed rows actually
         are) and the full device box. */
      const device = root.querySelector<HTMLElement>(".tp-flow-device");
      const plate = root.querySelector<HTMLElement>(".tp-flow-screen-plate");
      const dvBox = (device ?? ghost).getBoundingClientRect();
      const union = content.reduce(
        (a, c) => ({
          l: Math.min(a.l, c.left),
          t: Math.min(a.t, c.top),
          r: Math.max(a.r, c.left + c.w),
          b: Math.max(a.b, c.top + c.h)
        }),
        { l: Infinity, t: Infinity, r: -Infinity, b: -Infinity }
      );
      /* CLAMP TO THE SCREEN. getBoundingClientRect reports the LAYOUT box, not
         the painted one, so a horizontally scrolling rail and a list that runs
         past the fold both measure far wider and taller than the screen that
         clips them — the raw union came out 281x499 against a 179x384 device,
         and the mockup would have grown INWARDS from outside the card. */
      union.l = Math.max(union.l, 0);
      union.t = Math.max(union.t, 0);
      union.r = Math.min(union.r, screenBox.width);
      union.b = Math.min(union.b, screenBox.height);

      const grown = {
        left: 0,
        top: 0,
        width: device ? device.offsetWidth : px(dvBox.width),
        height: device ? device.offsetHeight : px(dvBox.height)
      };
      /* The plate STARTS HIDDEN BEHIND THE COMPOSITION, inset inside it, and
         grows outward past its edge. That is the whole reading: the frame is
         not drawn onto the field, it emerges from under the rows the bands
         just made. Seeding it at the composition's exact box instead would
         make the first visible frame a full-size mockup appearing, which is
         the same as not animating it at all. */
      const compW = union.r - union.l;
      const compH = union.b - union.t;
      const seed = {
        left: px(screenBox.left + union.l + compW * 0.1 - dvBox.left),
        top: px(screenBox.top + union.t + compH * 0.1 - dvBox.top),
        width: px(compW * 0.8),
        height: px(compH * 0.8)
      };
      /* The radius travels as a CSS variable rather than as a border-radius
         string, because the grown value is a percentage of a box that is
         itself changing and GSAP cannot interpolate `13% / 6%` sensibly. */
      const seedR = 7;
      const grownR = grown.width * 0.135;

      gsap.set([...made, main], { willChange: "transform", force3D: true });

      const timeline = gsap.timeline({ repeat: -1, paused: true });
      tl = timeline;

      /* ---- t=0 : the bands on a bare field. No mockup anywhere. ----------- */
      timeline.set(ghost, { autoAlpha: 1 })
        .set(main, { autoAlpha: 0 })
        .set(plate, { ...seed, autoAlpha: 0, "--tp-plate-r": `${seedR}px` });
      made.forEach((copy, i) => {
        const c = content[i];
        const s = slot(i);
        timeline.set(copy, {
          autoAlpha: 1,
          x: px(s.vx - (screenBox.left + c.left)),
          y: px(s.vy - (screenBox.top + c.top))
        }, 0);
      });
      timeline.to({}, { duration: 0.6 });

      /* ---- beat 1: the bands collect, top of the screen first ------------- */
      const start = 0.6;
      const step = 0.22;
      made.forEach((copy, i) => {
        timeline.to(copy, { x: 0, y: 0, duration: 0.72, ease: "power3.out" }, start + i * step);
      });
      const landed = start + (made.length - 1) * step + 0.72;

      /* ---- beat 2: the mockup grows out of the composition ---------------- */
      timeline.to(plate, {
        ...grown,
        "--tp-plate-r": `${grownR}px`,
        autoAlpha: 1,
        duration: 0.55,
        ease: "power2.out"
      }, landed + 0.1)

        /* ---- handoff: the clones already sit exactly over the real rows, so
                revealing the live screen and retiring the ghost is invisible -- */
        .to(main, { autoAlpha: 1, duration: 0.2 }, landed + 0.5)
        .to(ghost, { autoAlpha: 0, duration: 0.2 }, landed + 0.5)

        /* ---- beat 3: the settled screen is the frame that sells the case --- */
        .to({}, { duration: 2.6 }, landed + 0.7);

      /* ---- and back apart, so the loop does not cut ------------------------ */
      const out = landed + 3.3;
      timeline.set(ghost, { autoAlpha: 1 }, out)
        .to(main, { autoAlpha: 0, duration: 0.2 }, out)
        .to(plate, {
          ...seed,
          "--tp-plate-r": `${seedR}px`,
          autoAlpha: 0,
          duration: 0.45,
          ease: "power2.in"
        }, out + 0.1);
      made.forEach((copy, i) => {
        const c = content[i];
        const sl = slot(i);
        timeline.to(copy, {
          x: px(sl.vx - (screenBox.left + c.left)),
          y: px(sl.vy - (screenBox.top + c.top)),
          duration: 0.5,
          ease: "power2.inOut"
        }, out + 0.35 + i * 0.09);
      });
      timeline.to({}, { duration: 0.35 });
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
    <div className="tp-flow-card" ref={rootRef} role="img" aria-label="Tempo: the restaurants screen assembling from its parts">
      <div className="tp-flow-inner dw-case-study dw-case-tempo dw-case-draft-tempo-v3">
        <div className="tp-flow-stage">
          <div className="tp-flow-device">
            {/* The whole mockup, and the only thing that paints it. It sits
                OUTSIDE the clipping shell so its shadow survives, and it is
                invisible until the composition has formed. */}
            <i className="tp-flow-screen-plate" aria-hidden="true" />
            <div className="dw-tempo-secure-phone">
              <div className="tp-flow-screen tp-flow-screen-main"><TempoPhone screen="discover" /></div>
            </div>
            {/* unclipped duplicate: only the flying bands are painted */}
            <div className="tp-flow-ghost" aria-hidden="true" />
          </div>
        </div>
      </div>
    </div>
  );
}
