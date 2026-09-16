import React, { useEffect, useRef } from "react";
import gsap from "gsap";
import { LigaPhone } from "./ligaScreens";
import "./ligaFlowCard.css";

/* LIGA's Work-grid thumbnail — the Home screen, exploded and assembling.

   THE BANDS ARE DAVIT'S OWN. `HomeScreen` already staggers itself in five
   steps, and the comment at the top of it names them:

     // 1 header, 2 stories, 3 insure row, 4 the two actions, 5 the policy card

   So this card does not invent a grouping; it lifts the one the screen was
   written with. Each band clears 40px tall at the delivered size, which is the
   bar a detached piece has to pass to stay identifiable rather than reading as
   a grey sliver.

   Same rules as the Tempo card: one diagonal for every band, true size the
   whole way, and — the point of this version — NO MOCKUP until the composition
   exists. The plate grows out of the landed rows' own bounding box rather than
   waiting for them, so the composition is what makes the device. See the note
   at the top of tempoFlowCard.tsx for why that is a grow and not a dash-drawn
   outline. */

type Band = { key: string; pick: (root: HTMLElement) => HTMLElement[] };

const sec = (root: HTMLElement, i: number) => {
  const all = Array.from(root.querySelectorAll<HTMLElement>(".lg-sec"));
  return all[i] ? [all[i]] : [];
};
const q = (root: HTMLElement, sel: string) => {
  const n = root.querySelector<HTMLElement>(sel);
  return n ? [n] : [];
};

const BANDS: Band[] = [
  { key: "header", pick: (r) => [...q(r, ".lg-status"), ...q(r, ".lg-user")] },
  { key: "stories", pick: (r) => q(r, ".lg-offers") },
  { key: "insure", pick: (r) => [...sec(r, 0), ...q(r, ".lg-types")] },
  { key: "actions", pick: (r) => q(r, ".lg-actions") },
  { key: "policy", pick: (r) => [...sec(r, 1), ...q(r, ".lg-policy")] }
];

/* Hide everything outside a band without deleting it. LIGA's rows are nested
   (three of the five live inside `.lg-sheet`), so the Tempo card's
   remove-the-other-children trick does not work here: the wrapper has to stay
   for layout, it just must not paint. */
function stripTo(copy: HTMLElement, keep: HTMLElement[]) {
  const ancestors = new Set<HTMLElement>();
  keep.forEach((node) => {
    let p = node.parentElement;
    while (p && p !== copy) {
      ancestors.add(p);
      p = p.parentElement;
    }
  });
  copy.querySelectorAll<HTMLElement>("*").forEach((el) => {
    if (keep.some((k) => k === el || k.contains(el))) return;
    if (ancestors.has(el)) {
      /* An ancestor has to keep laying out but must neither paint nor clip.
         `.lg-sheet` is the reason: with its other children hidden it collapses
         to 28px, and its `overflow: hidden` then cropped three of the five
         bands out of existence. */
      el.style.background = "transparent";
      el.style.boxShadow = "none";
      el.style.border = "0";
      el.style.overflow = "visible";
      el.style.minHeight = "0";
      return;
    }
    el.style.visibility = "hidden";
  });
}

export function LigaFlowCard() {
  const rootRef = useRef<HTMLDivElement | null>(null);
  const cleanupRef = useRef<(() => void) | null>(null);

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    let tl: gsap.core.Timeline | null = null;

    const context = gsap.context(() => {
      const ghost = root.querySelector<HTMLElement>(".lg-flow-ghost");
      const main = root.querySelector<HTMLElement>(".lg-flow-screen-main");
      if (!ghost || !main) return;

      void ghost.offsetWidth;
      /* `.lg-phone-screen` is the element that carries `container-type` and the
         font-size the screens are sized in, so it is the clone root — lifting
         `.lg-screen` alone would resolve every `em` against the card. */
      const screen = main.querySelector<HTMLElement>(".lg-phone-screen");
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
      const content: Array<{ left: number; top: number; w: number; h: number }> = [];

      if (screen) {
        BANDS.forEach((band) => {
          const copy = screen.cloneNode(true) as HTMLElement;
          copy.classList.add("lg-flow-band");
          copy.dataset.band = band.key;
          const keep = band.pick(copy);
          if (!keep.length) return;
          stripTo(copy, keep);
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
          /* the strip's OWN box inside the clone — moving the whole clone would
             leave each group roughly where it already sits inside the screen,
             which reads as overlapping ghosts rather than as separate layers */
          const box = copy.getBoundingClientRect();
          const rs = keep.map((n) => n.getBoundingClientRect());
          /* clamped to the clone's own box: it is clipped to the screen in
             CSS, so an unclamped rect describes a slice nobody can see */
          const cl = Math.max(Math.min(...rs.map((r) => r.left)) - box.left, 0);
          const ct = Math.max(Math.min(...rs.map((r) => r.top)) - box.top, 0);
          const cr = Math.min(Math.max(...rs.map((r) => r.right)) - box.left, box.width);
          const cb = Math.min(Math.max(...rs.map((r) => r.bottom)) - box.top, box.height);
          content.push({ left: cl, top: ct, w: cr - cl, h: cb - ct });
          /* one ground per band, at the band's own content box — see the note
             on the Tempo card */
          const pad = px(6);
          const ground = document.createElement("i");
          ground.className = "lg-flow-band-ground";
          ground.style.left = `${px(cl) - pad}px`;
          ground.style.top = `${px(ct) - pad}px`;
          ground.style.width = `${px(cr - cl) + pad * 2}px`;
          ground.style.height = `${px(cb - ct) + pad * 2}px`;
          copy.insertBefore(ground, copy.firstChild);
          made.push(copy);
        });
      }
      cleanupRef.current = () => made.forEach((c) => c.remove());
      if (!made.length) return;

      gsap.set([...made, main], { willChange: "transform", force3D: true });

      /* The device no longer drifts. It used to slide right-to-centre as the
         bands landed, to fill the space the fan had been using — but with no
         mockup on screen until the composition exists, there is nothing to
         balance against, and the drift was a fourth beat competing with the
         grow. It is centred in CSS and stays put. */
      const device = root.querySelector<HTMLElement>(".lg-flow-device");
      const stage = device?.parentElement;
      const stageBox = (stage ?? ghost).getBoundingClientRect();

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
      /* ---- the mockup's two boxes: the composition's union, and the device -
         Both measured in the device's own unscaled space. The plate is already
         a sibling of the live screen here, so its shadow was never clipped. */
      const plate = root.querySelector<HTMLElement>(".lg-flow-screen-plate");
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
      const seedR = 7;
      const grownR = grown.width * 0.084;

      const timeline = gsap.timeline({ repeat: -1, paused: true });
      tl = timeline;

      /* ---- t=0 : the bands on a bare field. No mockup anywhere. ----------- */
      timeline.set(ghost, { autoAlpha: 1 })
        .set(main, { autoAlpha: 0 })
        .set(plate, { ...seed, autoAlpha: 0, "--lg-plate-r": `${seedR}px` });
      made.forEach((copy, i) => {
        const c = content[i];
        const sl = slot(i);
        timeline.set(copy, {
          autoAlpha: 1,
          x: px(sl.vx - (screenBox.left + c.left)),
          y: px(sl.vy - (screenBox.top + c.top))
        }, 0);
      });
      timeline.to({}, { duration: 0.6 });

      /* ---- beat 1: the bands collect, top of the screen first ------------- */
      const start = 0.6;
      const step = 0.2;
      made.forEach((copy, i) => {
        timeline.to(copy, { x: 0, y: 0, duration: 0.72, ease: "power3.out" }, start + i * step);
      });
      const landed = start + (made.length - 1) * step + 0.72;

      /* ---- beat 2: the mockup grows out of the composition ---------------- */
      timeline.to(plate, {
        ...grown,
        "--lg-plate-r": `${grownR}px`,
        autoAlpha: 1,
        duration: 0.55,
        ease: "power2.out"
      }, landed + 0.1)
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
          "--lg-plate-r": `${seedR}px`,
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
    <div className="lg-flow-card" ref={rootRef} role="img" aria-label="LIGA: the home screen assembling from its five parts — header, stories, insurance types, the two actions and the policy card">
      <div className="lg-flow-inner dw-case-study dw-case-liga">
        <div className="lg-flow-stage">
          <div className="lg-flow-device">
            <i className="lg-flow-screen-plate" aria-hidden="true" />
            <div className="lg-flow-screen-main"><LigaPhone screen="home" /></div>
            <div className="lg-flow-ghost" aria-hidden="true" />
          </div>
        </div>
      </div>
    </div>
  );
}
