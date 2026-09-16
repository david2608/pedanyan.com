import React, { useEffect, useId, useRef } from "react";
import gsap from "gsap";
import "./securionLogoScene.css";

/* Securion's Work-grid thumbnail — the app mark, constructed.

   Reference: a "logo on screen" identity build — dark stage, a squircle app
   icon, construction geometry drawn over it, a rim light and one sweep.

   Everything here is Davit's own material rather than invented geometry:

   - The tile is his real lockup: a 300x300 squircle at radius 76.92 (the
     standard iOS ratio, 0.2564) filled #EEEEEE -> #EEEEEE at 0.87 with a 2px
     white stroke — a frosted plate, not a flat one.
   - The glyph is `construction/app-glyph.svg`, three paths exactly: the
     #002A87 disc, the #2552F1 shield, and the white keyhole.
   - The guides are the ones he actually drew in Figma and exported to
     `portfolio-assets/securion/construction/` — dashed rings and orbit arcs at
     6/6 and 0.4 opacity, the 38-degree double diagonal at 0.6, rounded
     connectors at 0.3. The case study's logo-construction section uses the
     same set.

   Two rules this scene is built on:

   1. NO BEAT RESTS INCOMPLETE. A logo shown as separate fills is what a broken
      SVG looks like. Each part instead arrives ALONG its own guide — the disc
      rides its ring, the shield swings down its orbit arc, the keyhole drops on
      the centre dot — overlapped inside ~0.75s so it reads as one gesture.
   2. NOTHING BOXES THE MARK IN. The reference frames its icon with safe-area
      bars; here the only geometry on screen is geometry the mark is actually
      built on, so the plate and the glyph carry the composition alone. */

/* Scene space is a 400 SQUARE that fits ("meet") rather than fills, because the
   Work grid gives this card a wide 791x606 slot and a portrait scene would crop
   the construction off the top. The dark ground is painted in CSS so it
   still covers whatever the square leaves over. */
const TILE = { x: 95, y: 95, s: 210, r: 53.85 };
const C = { x: 200, y: 200 };

/* app-glyph.svg, 76.2085 x 94.3816, scaled 1.3774 and centred on the tile */
const GLYPH_SCALE = 1.3774;
const GLYPH_TRANSFORM = `translate(${C.x} ${C.y}) scale(${GLYPH_SCALE}) translate(-38.104 -47.191)`;

const DISC =
  "M38.0307 82.458C59.0345 82.458 76.0615 65.4311 76.0615 44.4273C76.0615 23.4235 59.0345 6.39659 38.0307 6.39659C17.0269 6.39659 0 23.4235 0 44.4273C0 65.4311 17.0269 82.458 38.0307 82.458Z";
const SHIELD =
  "M76.1807 27.734L76.0138 49.2392C76.0138 52.5221 75.8468 55.9719 75.0956 59.5329C73.7603 65.9873 70.5054 72.8311 62.5487 79.6749C59.6276 82.2066 55.7605 84.7939 51.9212 87.1309C47.2752 89.9686 42.6847 92.4168 40.014 93.8078C39.1793 94.2251 38.2612 94.4477 37.371 94.3642C35.201 94.1973 15.198 80.6765 14.7807 80.4261L39.2906 61.063L10.5797 63.2886L4.51489 64.5127L2.51189 64.93C2.34496 64.4849 2.17809 64.0676 2.03899 63.6225C0.369751 58.7539 0.063664 54.0522 0.063664 49.6566C0.063664 49.3227 0.063664 48.961 0.063664 48.6272L0.286276 19.9998C0.286276 17.4682 2.01112 15.2982 4.43151 14.6583C4.57062 14.6305 4.73749 14.5748 4.90441 14.547C8.24288 13.9628 13.0836 12.7943 18.5642 10.4574C19.2598 10.1514 19.9553 9.84536 20.6508 9.53933C25.0742 7.50843 28.997 5.22711 32.0295 3.33532C33.6709 2.30596 35.0342 1.38788 36.1192 0.692371C37.5102 -0.253528 39.3463 -0.225696 40.7373 0.748024C41.7667 1.47136 43.1299 2.38941 44.7435 3.41877C46.7466 4.72634 49.167 6.17302 51.8934 7.64751C53.1731 8.34302 54.5362 9.03854 55.9551 9.73405C56.7062 10.0957 57.4574 10.4296 58.2085 10.7912C59.9334 11.5702 61.6028 12.2101 63.1885 12.7665C63.3555 12.8221 63.5223 12.8778 63.6614 12.9334C64.3013 13.1838 64.9134 13.4898 65.442 13.8793L53.034 23.6722L38.2057 35.4124L71.2564 28.7355L76.2085 27.734H76.1807Z";
const KEYHOLE =
  "M41.2324 54.9165L34.6668 54.8609C34.0269 54.8609 33.5817 54.2488 33.7487 53.6368L36.169 45.7079C35.2231 45.0959 34.6111 44.0387 34.6389 42.8424C34.6389 40.9784 36.169 39.5039 38.033 39.5039C39.8969 39.5039 41.3715 41.034 41.3715 42.898C41.3715 44.0665 40.7595 45.068 39.8692 45.6801L42.1784 53.6924C42.3453 54.3045 41.9001 54.9165 41.2602 54.9165H41.2324Z";

/* the disc's own circle, in scene units — this is the ring the mark sits on */
const RING = { x: C.x - 0.1, y: C.y - 3.8, r: 38.0307 * GLYPH_SCALE };
/* his 38-degree double diagonal */
const DIAG = 38;

export function SecurionLogoScene() {
  const rootRef = useRef<HTMLDivElement | null>(null);
  const raw = useId();
  const uid = `sc${raw.replace(/[^a-zA-Z0-9]/g, "")}`;

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    let tl: gsap.core.Timeline | null = null;

    const context = gsap.context(() => {
      const q = <T extends Element>(sel: string) => Array.from(root.querySelectorAll<T>(sel));

      /* Only SOLID strokes are dash-drawn. A guide that already carries a 6/6
         dash pattern cannot be drawn this way — animating its offset just
         slides the dashes along, which reads as crawling ants — so the dashed
         guides scale in from the centre instead. */
      const drawn = q<SVGGeometryElement>("[data-draw]");
      const len = new Map<SVGGeometryElement, number>();
      drawn.forEach((el) => {
        const l = el.getTotalLength();
        len.set(el, l);
        gsap.set(el, { strokeDasharray: l });
      });
      const off = (el: SVGGeometryElement) => len.get(el) ?? 0;

      const tile = root.querySelector<SVGGeometryElement>(".sc-tile-line");
      const line = root.querySelector<SVGGeometryElement>(".sc-shield-line");
      const guides = q<SVGGeometryElement>(".sc-guide");

      tl = gsap.timeline({ repeat: -1, paused: true });

      /* ---- rest state ---- */
      tl.set(".sc-tile-face", { autoAlpha: 0, scale: 0.955, svgOrigin: `${C.x} ${C.y}` })
        .set(".sc-tile-edge", { autoAlpha: 0 })
        .set(".sc-ring", { autoAlpha: 0, rotation: -42, scale: 0.9, svgOrigin: `${RING.x} ${RING.y}` })
        .set(".sc-orbit", { autoAlpha: 0, rotation: -66, svgOrigin: `${C.x} ${C.y}` })
        .set(".sc-dot", { autoAlpha: 0, scale: 0.4, svgOrigin: `${C.x} ${C.y}` })
        .set(".sc-disc", { autoAlpha: 0, scale: 0.34, rotation: -30, svgOrigin: `${RING.x} ${RING.y}` })
        .set(".sc-shield", { autoAlpha: 1 })
        .set(".sc-flood", { scaleY: 0, svgOrigin: "38 94.4" })
        .set(".sc-keyhole", { autoAlpha: 0, scale: 0, svgOrigin: `${C.x} ${C.y}` })
        .set(guides, { autoAlpha: 0, scale: 0.86, svgOrigin: `${C.x} ${C.y}` })
        .set(".sc-sweep", { autoAlpha: 0, x: -150 });
      if (tile) tl.set(tile, { autoAlpha: 0, strokeDashoffset: off(tile) });
      if (line) tl.set(line, { autoAlpha: 0, strokeDashoffset: off(line) });

      /* ---- the tile is struck, then filled ---- */
      if (tile) {
        tl.to(tile, { autoAlpha: 1, duration: 0.12 }, 0.15)
          .to(tile, { strokeDashoffset: 0, duration: 0.82, ease: "power1.inOut" }, 0.15);
      }
      tl.to(".sc-tile-face", { autoAlpha: 1, duration: 0.32 }, 0.77)
        .to(".sc-tile-face", { scale: 1, duration: 0.76, ease: "back.out(1.7)" }, 0.77);
      if (tile) tl.to(tile, { autoAlpha: 0, duration: 0.38 }, 1.01);

      /* ---- the shield is the hero: the whole silhouette draws, then floods.

         Order matters for contrast as much as for sense. The outline is brand
         blue #2552F1, which reads hard on the frosted #EEEEEE plate but would
         disappear against the navy disc — so the disc is held back and arrives
         LAST, rotating out from behind the finished shield along its ring. Every
         beat still rides a guide, and none of them rests half-built. */
      const g0 = 1.0;
      tl.to(".sc-ring", { autoAlpha: 1, rotation: 0, scale: 1, duration: 0.52, ease: "power3.out" }, g0)
        .to(".sc-orbit", { autoAlpha: 1, rotation: 0, duration: 0.55, ease: "power3.out" }, g0 + 0.18);
      if (line) {
        tl.to(line, { autoAlpha: 1, duration: 0.14 }, g0 + 0.3)
          .to(line, { strokeDashoffset: 0, duration: 1.15, ease: "power1.inOut" }, g0 + 0.3);
      }
      tl.to(".sc-flood", { scaleY: 1, duration: 0.66, ease: "power2.out" }, g0 + 1.32);
      if (line) tl.to(line, { autoAlpha: 0, duration: 0.42 }, g0 + 1.5);
      tl.to(".sc-disc", { autoAlpha: 1, scale: 1, rotation: 0, duration: 0.56, ease: "back.out(1.8)" }, g0 + 1.72)
        .to(".sc-dot", { autoAlpha: 1, scale: 1, duration: 0.3, ease: "power2.out" }, g0 + 2.02)
        .to(".sc-keyhole", { autoAlpha: 1, scale: 1, duration: 0.34, ease: "back.out(3)" }, g0 + 2.12);

      /* ---- the rest of the construction lands over the finished mark ------ */
      const s0 = 3.65;
      tl.to(guides, { autoAlpha: 1, duration: 0.26, stagger: 0.08 }, s0)
        .to(guides, { scale: 1, duration: 0.86, ease: "power3.out", stagger: 0.09 }, s0);

      /* ---- the guides are spent, so they retract rather than sit there ---- */
      const r0 = 4.95;
      tl.to(guides, { scale: 1.09, duration: 0.75, ease: "power2.in", stagger: 0.07 }, r0)
        .to(guides, { autoAlpha: 0, duration: 0.5, stagger: 0.07 }, r0 + 0.3)
        .to(".sc-ring, .sc-orbit, .sc-dot", { autoAlpha: 0, duration: 0.5, ease: "power2.in" }, r0 + 0.25);

      /* ---- rim light, then one pass of the sweep ---- */
      const l0 = 5.75;
      tl.to(".sc-tile-edge", { autoAlpha: 1, duration: 0.55, ease: "power2.out" }, l0)
        .set(".sc-sweep", { autoAlpha: 1 }, l0 + 0.14)
        .to(".sc-sweep", { x: 285, duration: 1.1, ease: "power2.inOut" }, l0 + 0.14)
        .set(".sc-sweep", { autoAlpha: 0 }, l0 + 1.28);

      /* ---- hold on the finished mark: this is the frame that sells ---- */
      const end = l0 + 1.4;
      tl.to({}, { duration: 2.0 }, end)
        .to(".sc-tile-face, .sc-tile-edge, .sc-disc, .sc-shield, .sc-keyhole", { autoAlpha: 0, duration: 0.5, ease: "power2.in" }, end + 2.0);
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
    };
  }, []);

  return (
    <div className="sc-logo-scene" ref={rootRef}>
      <svg
        className="sc-svg"
        viewBox="0 0 400 400"
        preserveAspectRatio="xMidYMid meet"
        role="img"
        aria-label="The Securion app mark being constructed: the shield draws its own outline and floods with colour, then the disc and keyhole arrive along their guides"
      >
        <defs>
          <radialGradient id={`${uid}-glow`} cx="50%" cy="50%" r="30%">
            <stop offset="0%" stopColor="#6658ff" stopOpacity=".3" />
            <stop offset="100%" stopColor="#6658ff" stopOpacity="0" />
          </radialGradient>
          {/* his real tile fill: #EEEEEE to #EEEEEE at 0.87, running top-right to bottom-left */}
          <linearGradient id={`${uid}-face`} x1="1" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#eeeeee" />
            <stop offset="100%" stopColor="#eeeeee" stopOpacity=".87" />
          </linearGradient>
          {/* a rim light that catches two corners, not a uniform outline */}
          <linearGradient id={`${uid}-edge`} x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#ffffff" stopOpacity="1" />
            <stop offset="20%" stopColor="#ffffff" stopOpacity=".05" />
            <stop offset="80%" stopColor="#ffffff" stopOpacity=".05" />
            <stop offset="100%" stopColor="#ffffff" stopOpacity="1" />
          </linearGradient>
          <linearGradient id={`${uid}-sweep`} x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="#ffffff" stopOpacity="0" />
            <stop offset="54%" stopColor="#ffffff" stopOpacity=".8" />
            <stop offset="100%" stopColor="#ffffff" stopOpacity="0" />
          </linearGradient>
          {/* the reference dims its guides in the centre and lifts them at the
              edges — a luminance mask, 10% in the middle to 50% at the rim */}
          <radialGradient id={`${uid}-edgemask`} cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#333333" />
            <stop offset="100%" stopColor="#adadad" />
          </radialGradient>
          <mask id={`${uid}-guidemask`}>
            <rect x="-200" y="-200" width="800" height="800" fill={`url(#${uid}-edgemask)`} />
          </mask>
          {/* glyph-space wipe: grows from the shield's foot to its crown */}
          <clipPath id={`${uid}-flood`}>
            <rect className="sc-flood" x="-6" y="-6" width="90" height="107" />
          </clipPath>
          <clipPath id={`${uid}-tile`}>
            <rect x={TILE.x} y={TILE.y} width={TILE.s} height={TILE.s} rx={TILE.r} />
          </clipPath>
        </defs>

        <rect x="-200" y="-200" width="800" height="800" fill={`url(#${uid}-glow)`} />

        {/* the construction Davit actually drew: dashed rings, the 38-degree
            double diagonal, and a rounded connector */}
        <g mask={`url(#${uid}-guidemask)`}>
          <circle className="sc-guide sc-guide-ring" cx={C.x} cy={C.y} r="98" />
          <circle className="sc-guide sc-guide-ring" cx={C.x} cy={C.y} r="78" />
          <g transform={`rotate(${-DIAG} ${C.x} ${C.y})`}>
            <line className="sc-guide sc-guide-diag" x1="40" y1={C.y - 13} x2="360" y2={C.y - 13} />
            <line className="sc-guide sc-guide-diag" x1="40" y1={C.y + 13} x2="360" y2={C.y + 13} />
          </g>
          <path className="sc-guide sc-guide-link" data-draw="" d={`M40 ${TILE.y - 26} H${C.x - 20} a20 20 0 0 1 20 20 V${TILE.y + TILE.s + 46}`} />
          <path className="sc-guide sc-guide-link" data-draw="" d={`M360 ${TILE.y + TILE.s + 26} H${C.x + 20} a20 20 0 0 1 -20 -20 V${TILE.y - 46}`} />
        </g>

        {/* the tile */}
        <g className="sc-tile">
          <rect className="sc-tile-face" x={TILE.x} y={TILE.y} width={TILE.s} height={TILE.s} rx={TILE.r} fill={`url(#${uid}-face)`} />
          <rect className="sc-tile-line" data-draw="" x={TILE.x} y={TILE.y} width={TILE.s} height={TILE.s} rx={TILE.r} />

          <g clipPath={`url(#${uid}-tile)`}>
            {/* guides the mark rides in on, inside the plate */}
            <circle className="sc-ring" cx={RING.x} cy={RING.y} r={RING.r} />
            <path className="sc-orbit" d={`M ${C.x - 64} ${C.y} a 64 64 0 0 1 128 0`} />
            <circle className="sc-dot" cx={C.x} cy={C.y} r="9" />

            <g transform={GLYPH_TRANSFORM}>
              {/* the navy disc sits BEHIND and arrives last, rotating out from
                  behind the finished shield along its own ring */}
              <path className="sc-disc" d={DISC} fill="#002A87" />
              {/* the shield floods upward inside its own silhouette */}
              <g clipPath={`url(#${uid}-flood)`}>
                <path className="sc-shield" d={SHIELD} fill="#2552F1" />
              </g>
              {/* ...and the outline that drew it retires as the fill lands */}
              <path className="sc-shield-line" data-draw="" d={SHIELD} />
              <path className="sc-keyhole" d={KEYHOLE} fill="#ffffff" />
            </g>

            <g className="sc-sweep">
              <rect x="30" y="20" width="34" height="360" fill={`url(#${uid}-sweep)`} transform={`rotate(20 ${C.x} ${C.y})`} />
            </g>
          </g>

          <rect className="sc-tile-edge" x={TILE.x} y={TILE.y} width={TILE.s} height={TILE.s} rx={TILE.r} fill="none" stroke={`url(#${uid}-edge)`} />
        </g>
      </svg>
    </div>
  );
}
