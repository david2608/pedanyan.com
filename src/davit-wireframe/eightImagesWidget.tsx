import { useEffect, useRef, useState } from "react";

/**
 * The resizable frame the case study's argument is made in: a container the
 * reader can drag to any size, reporting its own pixel dimensions as they do
 * it. The viewer inside it is this site's own three.js rendering of the same
 * toy-firetruck.glb the product ships — see eightImagesOrb.tsx, which docks the
 * travelling model into this frame.
 *
 * IT USED TO EMBED THE LIVE PRODUCT, loading a script from 8images.com and
 * mounting <eight-images-widget>. That is gone, and the case is better for it:
 *
 *  - It needed the client's permission, because a personal site's traffic would
 *    land in his analytics. That permission was never obtained.
 *  - The shipped widget renders 8 Images' own "Create account" and "Log in"
 *    buttons, which on a portfolio page read as an advert for the client rather
 *    than as an exhibit of the work.
 *  - It set document.title to "Toy Firetruck · Widget", overwriting the case
 *    study's own title in the tab and in bookmarks. There was a MutationObserver
 *    here purely to fight it back.
 *  - A third-party custom element is invisible to the prerenderer and to
 *    crawlers, so the page's central section was empty in the static HTML.
 *  - It cost 2,273 KB across 65 requests on a page whose whole thesis is that
 *    heavy 3D can be handled lightly.
 *
 * What the section claims changes with it, and the copy has to match: this is
 * the model rendered here, not the merchant's embed running live.
 */

const MIN_W = 320;
const MIN_H = 320;

export function EightImagesWidget() {
  const [size, setSize] = useState<{ w: number; h: number } | null>(null);
  const frameRef = useRef<HTMLDivElement | null>(null);
  const dragRef = useRef<{ x: number; y: number; w: number; h: number } | null>(null);

  /* Report the frame's own size, so the number on screen is the container the
     viewer is actually being asked to fill. */
  useEffect(() => {
    const frame = frameRef.current;
    if (!frame) return;
    const measure = () => setSize({ w: Math.round(frame.clientWidth), h: Math.round(frame.clientHeight) });
    /* Measure once up front so the readout never shows a dash on a laid-out frame. */
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(frame);
    return () => observer.disconnect();
  }, []);

  const onPointerDown = (event: React.PointerEvent<HTMLButtonElement>) => {
    const frame = frameRef.current;
    if (!frame) return;
    event.currentTarget.setPointerCapture(event.pointerId);
    dragRef.current = { x: event.clientX, y: event.clientY, w: frame.clientWidth, h: frame.clientHeight };
  };

  const onPointerMove = (event: React.PointerEvent<HTMLButtonElement>) => {
    const frame = frameRef.current;
    const start = dragRef.current;
    if (!frame || !start) return;
    const max = frame.parentElement?.clientWidth ?? start.w;
    frame.style.width = `${Math.max(MIN_W, Math.min(max, start.w + (event.clientX - start.x)))}px`;
    frame.style.height = `${Math.max(MIN_H, start.h + (event.clientY - start.y))}px`;
  };

  const onPointerUp = () => {
    dragRef.current = null;
  };

  return (
    <div className="dw-ei-widget">
      <div className="dw-ei-widget-frame" ref={frameRef}>
        <button
          type="button"
          className="dw-ei-widget-handle"
          aria-label="Drag to resize the viewer"
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={onPointerUp}
          onPointerCancel={onPointerUp}
        />
      </div>
      <p className="dw-ei-widget-readout">
        <strong>{size ? `${size.w} × ${size.h}` : "—"}</strong>
        <span>Drag the corner. This is the test the first version failed.</span>
      </p>
    </div>
  );
}
