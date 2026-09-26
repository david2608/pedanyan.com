import { createElement, useEffect, useRef, useState } from "react";

/**
 * The shipped 8 Images viewer, embedded the same way a merchant embeds it, which
 * makes this page one of the arbitrary containers it was built to survive.
 *
 * It never auto-loads. 2,273 KB across 65 requests is not something to spend on a
 * reader who is scrolling past, and a page whose argument is "heavy 3D, handled
 * lightly" would refute itself by doing otherwise. The frame is resizable so the
 * claim can be tested rather than read.
 */

const WIDGET_SRC = "https://8images.com/v1/widget.js";
const PRODUCT_ID = "107";
const MIN_W = 320;
const MIN_H = 320;

export function EightImagesWidget() {
  /* Loads on approach — never on a click, and not at mount either.

     It used to wait for a button, which made the reader take the section's word
     for it. Mounting it immediately is the other extreme: 2,273 KB and a second
     WebGL context arriving while this page's own model is still decoding. So it
     waits until the section is a screen and a half away and then loads without
     being asked. */
  const [loaded, setLoaded] = useState(false);
  const [size, setSize] = useState<{ w: number; h: number } | null>(null);
  const frameRef = useRef<HTMLDivElement | null>(null);
  const dragRef = useRef<{ x: number; y: number; w: number; h: number } | null>(null);

  useEffect(() => {
    if (loaded) return;
    const host = frameRef.current;
    if (!host) return;
    const near = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) {
          setLoaded(true);
          near.disconnect();
        }
      },
      { rootMargin: "150% 0px" }
    );
    near.observe(host);
    return () => near.disconnect();
  }, [loaded]);

  useEffect(() => {
    if (!loaded) return;

    /* The widget sets document.title to the product it is showing ("Toy
       Firetruck · Widget"), which would quietly overwrite the case study's own
       title in the tab, in bookmarks and in anything reading the page after
       hydration. Hold our title and put it back whenever it is changed. */
    const ours = document.title;
    const head = document.querySelector("head");
    let titleGuard: MutationObserver | null = null;
    if (head) {
      titleGuard = new MutationObserver(() => {
        if (document.title !== ours) document.title = ours;
      });
      titleGuard.observe(head, { subtree: true, childList: true, characterData: true });
    }

    if (!document.querySelector("script[data-eight-images-widget]")) {
      const script = document.createElement("script");
      script.async = true;
      script.src = WIDGET_SRC;
      script.setAttribute("data-eight-images-widget", "true");
      document.body.appendChild(script);
    }

    return () => {
      titleGuard?.disconnect();
      if (document.title !== ours) document.title = ours;
    };
  }, [loaded]);

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
        {loaded ? (
          createElement("eight-images-widget", { "product-id": PRODUCT_ID })
        ) : null}
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
