import type { CSSProperties } from "react";
import { useEffect, useRef, useState } from "react";
import { OrbDock } from "./eightImagesOrb";
import { EightImagesWidget } from "./eightImagesWidget";
import "./eightImagesShop.css";

/**
 * The argument, performed.
 *
 * Everything before this section is about a viewer built to survive a page its
 * designer would never see. So the section stops describing that and does it:
 * the viewer — this site's own render of the product's toy-firetruck.glb — shrinks out of the
 * portfolio and into a merchant's product page, browser chrome and all, until
 * it is one slot in somebody else's gallery next to a price and an Add to
 * basket button.
 *
 * The widget is NEVER unmounted or re-created while this runs. It is the same
 * element throughout; only the page around it changes shape. A reload halfway
 * would undo the entire point.
 *
 * The store is invented and says so — `.example` is the reserved documentation
 * domain. Nothing here imitates a real retailer.
 */

const clamp01 = (n: number) => (n < 0 ? 0 : n > 1 ? 1 : n);

const SWATCHES = ["#b4402a", "#2f4d7a", "#3f6b4a", "#c9a227"];

export function EightImagesShop() {
  const trackRef = useRef<HTMLDivElement | null>(null);
  const pinRef = useRef<HTMLDivElement | null>(null);
  /* Only the two things that genuinely change discretely live in React: the
     caption's wording and whether the sequence has settled. Progress itself is
     written straight onto the element as custom properties.

     Routing a per-pixel scroll value through state would re-render this tree
     on every scroll event, and React's scheduler is the wrong place for a
     scrubbed animation — it batches, it can defer, and in a throttled tab it
     stops flushing altogether. A style write is synchronous and free. */
  const [phase, setPhase] = useState<"start" | "arrived">("start");
  const [settled, setSettled] = useState(false);

  useEffect(() => {
    const track = trackRef.current;
    const pin = pinRef.current;
    if (!track || !pin) return;

    /* The site header is fixed and sits above everything, so the browser frame
       has to start below it or the merchant's URL bar prints over the real
       site's nav. Measured rather than guessed, because the header's height is
       a fact of the page and not of this section. */
    const measureHeader = () => {
      const header = document.querySelector<HTMLElement>(".dw-header");
      const h = header ? Math.round(header.getBoundingClientRect().height) : 0;
      pin.style.setProperty("--top", `${h + 14}px`);
    };

    const write = (p: number) => {
      pin.style.setProperty("--p", String(p));
      /* Three overlapping acts, so nothing waits its turn: the browser draws
         itself, the viewer gives up the room, the shop fills it. */
      pin.style.setProperty("--chrome", String(clamp01((p - 0.06) / 0.28)));
      pin.style.setProperty("--shrink", String(clamp01((p - 0.22) / 0.42)));
      pin.style.setProperty("--shop", String(clamp01((p - 0.5) / 0.38)));
    };

    measureHeader();

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      write(1);
      setPhase("arrived");
      setSettled(true);
      return;
    }

    let lastPhase = "start";
    let lastSettled = false;

    /* Read on the scroll event itself. Coalescing through requestAnimationFrame
       leaves this stuck at zero in a background tab, which is how the parts
       sequence failed twice. */
    const read = () => {
      const rect = track.getBoundingClientRect();
      const travel = Math.max(1, rect.height - window.innerHeight);
      const p = clamp01(-rect.top / travel);
      write(p);

      const nextPhase = p < 0.5 ? "start" : "arrived";
      if (nextPhase !== lastPhase) { lastPhase = nextPhase; setPhase(nextPhase); }
      const nextSettled = p > 0.985;
      if (nextSettled !== lastSettled) { lastSettled = nextSettled; setSettled(nextSettled); }
    };

    read();
    window.addEventListener("scroll", read, { passive: true });
    const onResize = () => { measureHeader(); read(); };
    window.addEventListener("resize", onResize);
    return () => {
      window.removeEventListener("scroll", read);
      window.removeEventListener("resize", onResize);
    };
  }, []);

  return (
    <div className="ei-shop-track" ref={trackRef} data-settled={settled ? "true" : undefined}>
      <div className="ei-shop-pin" ref={pinRef}>
        <div className="ei-shop-browser">
          <div className="ei-shop-chrome" aria-hidden="true">
            <span className="ei-shop-dots"><i /><i /><i /></span>
            <span className="ei-shop-url">northfold-toys.example/vehicles/fire-engine</span>
          </div>

          <div className="ei-shop-page">
            <header className="ei-shop-nav" aria-hidden="true">
              <b>NORTHFOLD</b>
              <nav><span>New</span><span>Vehicles</span><span>Wooden</span><span>Sale</span></nav>
              <span className="ei-shop-bag">Basket (0)</span>
            </header>

            <p className="ei-shop-crumb" aria-hidden="true">Toys / Vehicles / Fire engine</p>

            <div className="ei-shop-grid">
              {/* The rail is the store's, so the slots below the live one carry
                  the colourways the panel offers rather than empty grey boxes
                  standing in for photographs that do not exist. */}
              <ul className="ei-shop-thumbs" aria-hidden="true">
                <li className="is-live"><span>3D</span></li>
                {SWATCHES.slice(1).map((hex) => (
                  <li key={hex} style={{ "--chip": hex } as CSSProperties} />
                ))}
              </ul>

              {/* The same element from the first frame to the last. */}
              <div className="ei-shop-stage">
                {/* The viewer lives INSIDE the resizable frame: the frame is the
                    claim, so it has to contain the thing being reframed. */}
                <EightImagesWidget>
                  <OrbDock id="player" fade={0} className="ei-shop-dock" />
                </EightImagesWidget>
              </div>

              <div className="ei-shop-info" aria-hidden="true">
                <p className="ei-shop-brand">Northfold Toys</p>
                <h4>Toy Firetruck</h4>
                <p className="ei-shop-price">£48.00</p>
                <p className="ei-shop-blurb">
                  Solid beech, water-based paint, extending ladder. Suitable from three years.
                </p>
                <div className="ei-shop-variants">
                  <span>Colour</span>
                  <ul>
                    {SWATCHES.map((hex, i) => (
                      <li key={hex} className={i === 0 ? "is-on" : undefined} style={{ background: hex }} />
                    ))}
                  </ul>
                </div>
                <button type="button" tabIndex={-1}>Add to basket</button>
                <p className="ei-shop-note">Free delivery over £40 · 30-day returns</p>
              </div>
            </div>
          </div>
        </div>

        <p className="ei-shop-caption">
          {phase === "start"
            ? "Keep scrolling — this is where it ends up"
            : "One slot in somebody else's page. That was the brief."}
        </p>
      </div>
    </div>
  );
}
