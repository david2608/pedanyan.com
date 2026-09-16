import React, { useEffect, useId, useRef, useState } from "react";
import gsap from "gsap";
import "./icredoLogoScene.css";

/* iCredo — the mark arriving on a home screen.

   Reference: a "logo on screen" identity build. The app icon is constructed in
   the empty slot of a home-screen grid: guides first, then the mark, then the
   light that says it is real glass.

   The guides are measured off the mark, not invented. Sampling the path (4000
   points, 23x24 viewBox) gives centre 11.5/11.0 and the three circles the
   outline actually sits on — outer r 11.03 where the four blade arcs run,
   inner r 5.77 at the blade tips, core r 0.90 where they meet. The mark is
   exactly 22x22 and has four-fold symmetry, so it is cut on the wedge
   boundaries at 54.6 + 90k and each blade rotates home.

   Scene space is 400x560, sliced to fill whatever box it is given. The empty
   grid slot sits at 200/236; the icon is 92 wide, the mark 56% of it. */

const MARK_PATH =
  "M13.8482 21.6759C8.60358 22.9774 3.4834 20.2772 1.1865 15.0517L10.3071 10.9335C10.4985 10.8461 10.5942 10.6227 10.5177 10.4188C10.0391 9.12695 9.44578 7.874 8.64186 6.44623C8.51745 6.22283 8.20162 6.17427 8.01978 6.3491L0.794113 13.42C-0.488324 7.86429 2.5455 2.63882 7.51255 0.735111L11.7427 10.2633C13.3601 9.59317 14.432 9.11724 16.0685 8.28194C16.3078 8.15567 16.3652 7.83515 16.1738 7.6409L9.02468 0.288323C14.3363 -0.906349 19.4182 1.66754 21.7725 6.97072L12.1925 11.2832C12.872 12.8178 13.4462 14.0416 14.2501 15.5471C14.3745 15.7802 14.6904 15.8385 14.8722 15.6539L22.2223 8.5539C23.4377 14.0222 20.5666 19.1408 15.5039 21.2971L11.2163 11.73C9.56062 12.4876 8.41217 13.0315 6.9479 13.7891C6.70864 13.9154 6.65121 14.2359 6.84262 14.4301L13.8577 21.6759H13.8482Z";

/* iOS-style superellipse (n = 4.6), 92 wide, centred on the empty slot. */
const TILE_PATH = "M246.00 236.00L245.97 248.76L245.89 253.23L245.75 256.53L245.56 259.24L245.31 261.56L245.01 263.61L244.65 265.44L244.23 267.11L243.75 268.63L243.21 270.03L242.61 271.32L241.95 272.51L241.22 273.61L240.43 274.63L239.57 275.57L238.63 276.43L237.61 277.22L236.51 277.95L235.32 278.61L234.03 279.21L232.63 279.75L231.11 280.23L229.44 280.65L227.61 281.01L225.56 281.31L223.24 281.56L220.53 281.75L217.23 281.89L212.76 281.97L200.00 282.00L187.24 281.97L182.77 281.89L179.47 281.75L176.76 281.56L174.44 281.31L172.39 281.01L170.56 280.65L168.89 280.23L167.37 279.75L165.97 279.21L164.68 278.61L163.49 277.95L162.39 277.22L161.37 276.43L160.43 275.57L159.57 274.63L158.78 273.61L158.05 272.51L157.39 271.32L156.79 270.03L156.25 268.63L155.77 267.11L155.35 265.44L154.99 263.61L154.69 261.56L154.44 259.24L154.25 256.53L154.11 253.23L154.03 248.76L154.00 236.00L154.03 223.24L154.11 218.77L154.25 215.47L154.44 212.76L154.69 210.44L154.99 208.39L155.35 206.56L155.77 204.89L156.25 203.37L156.79 201.97L157.39 200.68L158.05 199.49L158.78 198.39L159.57 197.37L160.43 196.43L161.37 195.57L162.39 194.78L163.49 194.05L164.68 193.39L165.97 192.79L167.37 192.25L168.89 191.77L170.56 191.35L172.39 190.99L174.44 190.69L176.76 190.44L179.47 190.25L182.77 190.11L187.24 190.03L200.00 190.00L212.76 190.03L217.23 190.11L220.53 190.25L223.24 190.44L225.56 190.69L227.61 190.99L229.44 191.35L231.11 191.77L232.63 192.25L234.03 192.79L235.32 193.39L236.51 194.05L237.61 194.78L238.63 195.57L239.57 196.43L240.43 197.37L241.22 198.39L241.95 199.49L242.61 200.68L243.21 201.97L243.75 203.37L244.23 204.89L244.65 206.56L245.01 208.39L245.31 210.44L245.56 212.76L245.75 215.47L245.89 218.77L245.97 223.24Z";
/* the same shape centred on the origin, for the neighbouring apps */
const TILE_AT_ORIGIN = "M46.00 0.00L45.97 12.76L45.89 17.23L45.75 20.53L45.56 23.24L45.31 25.56L45.01 27.61L44.65 29.44L44.23 31.11L43.75 32.63L43.21 34.03L42.61 35.32L41.95 36.51L41.22 37.61L40.43 38.63L39.57 39.57L38.63 40.43L37.61 41.22L36.51 41.95L35.32 42.61L34.03 43.21L32.63 43.75L31.11 44.23L29.44 44.65L27.61 45.01L25.56 45.31L23.24 45.56L20.53 45.75L17.23 45.89L12.76 45.97L0.00 46.00L-12.76 45.97L-17.23 45.89L-20.53 45.75L-23.24 45.56L-25.56 45.31L-27.61 45.01L-29.44 44.65L-31.11 44.23L-32.63 43.75L-34.03 43.21L-35.32 42.61L-36.51 41.95L-37.61 41.22L-38.63 40.43L-39.57 39.57L-40.43 38.63L-41.22 37.61L-41.95 36.51L-42.61 35.32L-43.21 34.03L-43.75 32.63L-44.23 31.11L-44.65 29.44L-45.01 27.61L-45.31 25.56L-45.56 23.24L-45.75 20.53L-45.89 17.23L-45.97 12.76L-46.00 0.00L-45.97 -12.76L-45.89 -17.23L-45.75 -20.53L-45.56 -23.24L-45.31 -25.56L-45.01 -27.61L-44.65 -29.44L-44.23 -31.11L-43.75 -32.63L-43.21 -34.03L-42.61 -35.32L-41.95 -36.51L-41.22 -37.61L-40.43 -38.63L-39.57 -39.57L-38.63 -40.43L-37.61 -41.22L-36.51 -41.95L-35.32 -42.61L-34.03 -43.21L-32.63 -43.75L-31.11 -44.23L-29.44 -44.65L-27.61 -45.01L-25.56 -45.31L-23.24 -45.56L-20.53 -45.75L-17.23 -45.89L-12.76 -45.97L-0.00 -46.00L12.76 -45.97L17.23 -45.89L20.53 -45.75L23.24 -45.56L25.56 -45.31L27.61 -45.01L29.44 -44.65L31.11 -44.23L32.63 -43.75L34.03 -43.21L35.32 -42.61L36.51 -41.95L37.61 -41.22L38.63 -40.43L39.57 -39.57L40.43 -38.63L41.22 -37.61L41.95 -36.51L42.61 -35.32L43.21 -34.03L43.75 -32.63L44.23 -31.11L44.65 -29.44L45.01 -27.61L45.31 -25.56L45.56 -23.24L45.75 -20.53L45.89 -17.23L45.97 -12.76Z";

const WEDGES = [
  "M200 236 L269.51 333.82 A120 120 0 0 1 102.18 305.51 Z",
  "M200 236 L102.18 305.51 A120 120 0 0 1 130.49 138.18 Z",
  "M200 236 L130.49 138.18 A120 120 0 0 1 297.82 166.49 Z",
  "M200 236 L297.82 166.49 A120 120 0 0 1 269.51 333.82 Z"
];

const MARK_TRANSFORM = "translate(200 236) scale(2.3418) translate(-11.5 -11)";

/* the circles the outline sits on, plus the icon's own inscribed circle */
const RINGS = [46, 25.83, 13.51, 2.11];
/* diameters through the blade tips, at 54.6 and 144.6 degrees */
const SPOKES = [
  { x1: 177.99, y1: 205.03, x2: 222.01, y2: 266.97 },
  { x1: 230.97, y1: 213.99, x2: 169.03, y2: 258.01 }
];

/* the apps either side. Deliberately generic, softened and out of focus — the
   empty slot is the subject, and nobody else's icon artwork belongs here. */
const NEIGHBOURS = [
  { x: 80, y: 96, a: "#ffd66b", b: "#f5883c" },
  { x: 200, y: 96, a: "#8fd3ff", b: "#2f7ce0" },
  { x: 320, y: 96, a: "#ffa9b8", b: "#e0455f" },
  { x: 80, y: 236, a: "#b9edc8", b: "#3aa76d" },
  { x: 320, y: 236, a: "#d9d3ff", b: "#6f5ae0" }
];

const PLATE_SRC = "/portfolio-assets/icredo/home-screen.png";

export function IcredoLogoScene({ variant = "card" }: { variant?: "card" | "section" }) {
  const rootRef = useRef<HTMLDivElement | null>(null);
  const raw = useId();
  const uid = `ic${raw.replace(/[^a-zA-Z0-9]/g, "")}`;
  const guides = variant === "section";
  /* if a real home-screen plate is dropped in, it takes over from the coded one */
  const [plate, setPlate] = useState(false);

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    let tl: gsap.core.Timeline | null = null;

    const context = gsap.context(() => {
      const q = <T extends Element>(sel: string) => Array.from(root.querySelectorAll<T>(sel));

      const drawn = q<SVGGeometryElement>("[data-draw]");
      const len = new Map<SVGGeometryElement, number>();
      drawn.forEach((el) => {
        const l = el.getTotalLength();
        len.set(el, l);
        gsap.set(el, { strokeDasharray: l });
      });
      const off = (el: SVGGeometryElement) => len.get(el) ?? 0;

      const rings = q<SVGGeometryElement>(".ic-id-ring");
      const spokes = q<SVGGeometryElement>(".ic-id-spoke");
      const tile = root.querySelector<SVGGeometryElement>(".ic-id-tile-line");

      tl = gsap.timeline({ repeat: -1, paused: true });

      /* ---- rest state: an empty slot ---- */
      if (guides) {
        tl.set(".ic-id-grid line", { autoAlpha: 0, scaleX: 0, scaleY: 0, transformOrigin: "50% 50%" })
          .set(rings, { autoAlpha: 0, strokeDashoffset: (i, t) => off(t as SVGGeometryElement) })
          .set(spokes, { autoAlpha: 0, strokeDashoffset: (i, t) => off(t as SVGGeometryElement) })
          .set(".ic-id-box", { autoAlpha: 0, scale: 0.86, svgOrigin: "200 236" });
      }
      tl.set(".ic-id-tile-face", { autoAlpha: 0, scale: 0.94, svgOrigin: "200 236" })
        .set(".ic-id-tile-edge", { autoAlpha: 0 })
        .set(".ic-id-blade", { autoAlpha: 0, rotation: -32, scale: 0.78, svgOrigin: "200 236" })
        .set(".ic-id-sweep", { autoAlpha: 0, x: -140 })
        .set(".ic-id-label", { autoAlpha: 0, y: 7 })
        .set(".ic-id-caption", { autoAlpha: 0, y: 12 });
      if (tile) tl.set(tile, { autoAlpha: 0, strokeDashoffset: off(tile) });

      /* ---- the slot is ruled ---- */
      if (guides) {
        tl.to(".ic-id-grid line", { autoAlpha: 1, scaleX: 1, scaleY: 1, duration: 0.7, ease: "power3.out", stagger: 0.06 }, 0.1)
          .to(rings, { autoAlpha: 1, duration: 0.18 }, 0.45)
          .to(rings, { strokeDashoffset: 0, duration: 1.0, ease: "power1.inOut", stagger: 0.16 }, 0.45)
          .to(spokes, { autoAlpha: 1, duration: 0.14 }, 0.9)
          .to(spokes, { strokeDashoffset: 0, duration: 0.6, ease: "power2.out", stagger: 0.12 }, 0.9)
          .to(".ic-id-box", { autoAlpha: 1, scale: 1, duration: 0.55, ease: "back.out(2.2)" }, 1.2);
      }

      /* ---- the tile is struck, then filled ---- */
      const t0 = guides ? 1.45 : 0.3;
      if (tile) {
        tl.to(tile, { autoAlpha: 1, duration: 0.12 }, t0)
          .to(tile, { strokeDashoffset: 0, duration: 0.88, ease: "power1.inOut" }, t0);
      }
      tl.to(".ic-id-tile-face", { autoAlpha: 1, duration: 0.3, ease: "power1.out" }, t0 + 0.7)
        .to(".ic-id-tile-face", { scale: 1, duration: 0.8, ease: "back.out(1.7)" }, t0 + 0.7);
      if (tile) tl.to(tile, { autoAlpha: 0, duration: 0.4 }, t0 + 0.95);

      /* ---- four blades, 90 degrees apart, rotating home ---- */
      const t1 = t0 + 1.0;
      tl.to(".ic-id-blade", { autoAlpha: 1, duration: 0.2, stagger: 0.13 }, t1)
        .to(".ic-id-blade", { rotation: 0, scale: 1, duration: 0.84, ease: "back.out(1.5)", stagger: 0.13 }, t1);

      /* ---- the guides are spent, so they retract as the blades land ---- */
      if (guides) {
        tl.to(spokes, { strokeDashoffset: (i, t) => off(t as SVGGeometryElement), duration: 0.52, ease: "power2.in", stagger: 0.1 }, t1 + 0.3)
          .to(".ic-id-box", { autoAlpha: 0, scale: 1.08, duration: 0.5, ease: "power2.in" }, t1 + 0.4)
          .to(rings, { strokeDashoffset: (i, t) => -off(t as SVGGeometryElement), duration: 0.85, ease: "power2.inOut", stagger: 0.1 }, t1 + 0.5)
          .to(rings, { autoAlpha: 0, duration: 0.45 }, t1 + 0.9)
          .to(".ic-id-grid line", { autoAlpha: 0, duration: 0.65, ease: "power2.in", stagger: -0.05 }, t1 + 0.7);
      }

      /* ---- edge light, one pass of the sweep, then the app has a name ---- */
      const t2 = t1 + 1.2;
      tl.to(".ic-id-tile-edge", { autoAlpha: 1, duration: 0.55, ease: "power2.out" }, t2)
        .set(".ic-id-sweep", { autoAlpha: 1 }, t2 + 0.12)
        .to(".ic-id-sweep", { x: 165, duration: 1.1, ease: "power2.inOut" }, t2 + 0.12)
        .set(".ic-id-sweep", { autoAlpha: 0 }, t2 + 1.25)
        .to(".ic-id-label", { autoAlpha: 1, y: 0, duration: 0.5, ease: "power2.out" }, t2 + 0.5);
      if (guides) tl.to(".ic-id-caption", { autoAlpha: 1, y: 0, duration: 0.6, ease: "power2.out" }, t2 + 0.8);

      /* ---- hold, then clear the slot and build it again ---- */
      const hold = guides ? 2.1 : 1.5;
      const t3 = t2 + 1.4;
      tl.to({}, { duration: hold }, t3)
        .to(".ic-id-tile-face, .ic-id-tile-edge, .ic-id-blade, .ic-id-label, .ic-id-caption", { autoAlpha: 0, duration: 0.5, ease: "power2.in" }, t3 + hold);
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
  }, [guides]);

  return (
    <div className={`ic-logo-scene ic-logo-scene-${variant}${plate ? " ic-has-plate" : ""}`} ref={rootRef}>
      <img className="ic-id-plate" src={PLATE_SRC} alt="" aria-hidden="true" onLoad={() => setPlate(true)} onError={() => setPlate(false)} />

      <svg
        className="ic-id-svg"
        viewBox={guides ? "0 0 400 560" : "60 56 280 392"}
        preserveAspectRatio="xMidYMid slice"
        role="img"
        aria-label="The iCredo app mark being built in an empty home-screen slot: three circles, then four blades ninety degrees apart rotating into the icon"
      >
        <defs>
          <linearGradient id={`${uid}-wall`} x1="0" y1="0" x2=".35" y2="1">
            <stop offset="0%" stopColor="#dff4ef" />
            <stop offset="48%" stopColor="#a9e4dd" />
            <stop offset="100%" stopColor="#74cfc9" />
          </linearGradient>
          <linearGradient id={`${uid}-band`} x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#ffffff" stopOpacity=".55" />
            <stop offset="100%" stopColor="#ffffff" stopOpacity="0" />
          </linearGradient>
          <linearGradient id={`${uid}-face`} x1="0" y1="0" x2=".2" y2="1">
            <stop offset="0%" stopColor="#ffffff" />
            <stop offset="100%" stopColor="#f0e6e9" />
          </linearGradient>
          <linearGradient id={`${uid}-edge`} x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#ffffff" stopOpacity=".95" />
            <stop offset="50%" stopColor="#ffffff" stopOpacity=".05" />
            <stop offset="100%" stopColor="#ffffff" stopOpacity=".95" />
          </linearGradient>
          <linearGradient id={`${uid}-sweep`} x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="#ffffff" stopOpacity="0" />
            <stop offset="48%" stopColor="#ffffff" stopOpacity=".6" />
            <stop offset="56%" stopColor="#ffffff" stopOpacity=".6" />
            <stop offset="100%" stopColor="#ffffff" stopOpacity="0" />
          </linearGradient>
          {NEIGHBOURS.map((n, i) => (
            <linearGradient id={`${uid}-n${i}`} key={i} x1="0" y1="0" x2=".3" y2="1">
              <stop offset="0%" stopColor={n.a} />
              <stop offset="100%" stopColor={n.b} />
            </linearGradient>
          ))}
          <clipPath id={`${uid}-tile`}>
            <path d={TILE_PATH} />
          </clipPath>
          {WEDGES.map((d, i) => (
            <clipPath id={`${uid}-w${i}`} key={i}>
              <path d={d} />
            </clipPath>
          ))}
        </defs>

        {/* the home screen, coded. Hidden the moment a real plate loads. */}
        <g className="ic-id-home">
          <rect x="0" y="0" width="400" height="560" fill={`url(#${uid}-wall)`} />
          <path d="M-60 250L210 -60L360 -60L-60 420Z" fill={`url(#${uid}-band)`} />
          <g className="ic-id-neighbours">
            {NEIGHBOURS.map((n, i) => (
              <g key={i} transform={`translate(${n.x} ${n.y})`}>
                <path d={TILE_AT_ORIGIN} fill={`url(#${uid}-n${i})`} />
                <rect x="-23" y="59" width="46" height="8" rx="4" fill="#ffffff" opacity=".82" />
              </g>
            ))}
          </g>
        </g>

        {guides ? (
          <>
            <g className="ic-id-grid">
              <line x1="200" y1="0" x2="200" y2="560" />
              <line x1="0" y1="236" x2="400" y2="236" />
              <line x1="0" y1="190" x2="400" y2="190" />
              <line x1="0" y1="282" x2="400" y2="282" />
              <line x1="154" y1="0" x2="154" y2="560" />
              <line x1="246" y1="0" x2="246" y2="560" />
              <line x1="154" y1="190" x2="246" y2="282" />
              <line x1="246" y1="190" x2="154" y2="282" />
            </g>
            <g className="ic-id-guides">
              {RINGS.map((r) => (
                <circle className="ic-id-ring" data-draw="" key={r} cx="200" cy="236" r={r} />
              ))}
              {SPOKES.map((s, i) => (
                <line className="ic-id-spoke" data-draw="" key={i} {...s} />
              ))}
              <rect className="ic-id-box" x="174.24" y="210.24" width="51.52" height="51.52" />
            </g>
          </>
        ) : null}

        <g className="ic-id-tile">
          <path className="ic-id-tile-face" d={TILE_PATH} fill={`url(#${uid}-face)`} />
          <path className="ic-id-tile-line" data-draw="" d={TILE_PATH} />
          <g clipPath={`url(#${uid}-tile)`}>
            {WEDGES.map((_, i) => (
              <g className="ic-id-blade" key={i}>
                <g clipPath={`url(#${uid}-w${i})`}>
                  <path className="ic-id-mark" d={MARK_PATH} transform={MARK_TRANSFORM} />
                </g>
              </g>
            ))}
            <g className="ic-id-sweep">
              <rect x="120" y="150" width="26" height="172" fill={`url(#${uid}-sweep)`} transform="rotate(18 200 236)" />
            </g>
          </g>
          <path className="ic-id-tile-edge" d={TILE_PATH} fill="none" stroke={`url(#${uid}-edge)`} />
        </g>

        <text className="ic-id-label" x="200" y="305">iCredo</text>
      </svg>

      {guides ? (
        <div className="ic-id-caption">
          <span>App mark</span>
          <p>Four blades, 90&#176; apart. Every edge lands on one of three circles.</p>
        </div>
      ) : null}
    </div>
  );
}
