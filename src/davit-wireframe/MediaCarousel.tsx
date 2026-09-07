import { useCallback, useEffect, useRef, useState } from "react";

export type MediaCarouselItem = {
  src: string;
  caption?: string;
  alt?: string;
  width?: number;
  height?: number;
  anim?: string;
};

export function MediaCarousel({ items, ariaLabel }: { items: MediaCarouselItem[]; ariaLabel?: string }) {
  const trackRef = useRef<HTMLDivElement | null>(null);
  const [index, setIndex] = useState(0);
  const dragRef = useRef<{ startX: number; startScroll: number; dragging: boolean }>({
    startX: 0,
    startScroll: 0,
    dragging: false
  });
  // set once the reader drags or uses the arrows — after that we never reposition
  const touchedRef = useRef(false);

  const count = items.length;
  const looped = count > 1 ? [...items, ...items, ...items] : items;

  const itemOffsets = useCallback(() => {
    const track = trackRef.current;
    if (!track) return [] as number[];
    return Array.from(track.querySelectorAll<HTMLElement>(".dw-carousel-item")).map((item) => item.offsetLeft);
  }, []);

  // Start on the middle copy so both directions feel endless.
  //
  // Slides are sized from their media's natural ratio (height is fixed, width
  // is auto), so a lazy image that has not loaded yet measures zero wide. If we
  // only positioned once on mount, every offset would be 0 and both the start
  // position and the wrap thresholds would be wrong. So: place now, then place
  // again as the media resolves and whenever the track is resized — but never
  // after the reader has taken hold of it.
  useEffect(() => {
    if (count <= 1) return;
    const track = trackRef.current;
    if (!track) return;

    const place = () => {
      if (touchedRef.current) return;
      const offsets = itemOffsets();
      if (offsets.length < count * 2) return;
      track.scrollLeft = offsets[count] - 24;
    };
    place();

    const media = Array.from(track.querySelectorAll<HTMLImageElement | HTMLVideoElement>("img, video"));
    const pending = media.filter((el) =>
      el instanceof HTMLImageElement ? !el.complete : el.readyState < 1
    );
    const onSettle = () => place();
    pending.forEach((el) => {
      el.addEventListener("load", onSettle);
      el.addEventListener("loadedmetadata", onSettle);
      el.addEventListener("error", onSettle);
    });

    const observer = new ResizeObserver(() => place());
    observer.observe(track);

    return () => {
      pending.forEach((el) => {
        el.removeEventListener("load", onSettle);
        el.removeEventListener("loadedmetadata", onSettle);
        el.removeEventListener("error", onSettle);
      });
      observer.disconnect();
    };
  }, [count, itemOffsets]);

  const goTo = useCallback((next: number) => {
    touchedRef.current = true;
    const track = trackRef.current;
    const offsets = itemOffsets();
    if (!track || offsets.length === 0) return;
    const clamped = Math.max(0, Math.min(offsets.length - 1, next));
    track.scrollTo({ left: offsets[clamped] - 24, behavior: "smooth" });
  }, [itemOffsets]);

  const nearestIndex = useCallback(() => {
    const track = trackRef.current;
    const offsets = itemOffsets();
    if (!track || offsets.length === 0) return 0;
    const position = track.scrollLeft + 25;
    let nearest = 0;
    offsets.forEach((offset, i) => {
      if (Math.abs(offset - position) < Math.abs(offsets[nearest] - position)) nearest = i;
    });
    return nearest;
  }, [itemOffsets]);

  const onScroll = useCallback(() => {
    const track = trackRef.current;
    const offsets = itemOffsets();
    if (!track || offsets.length === 0) return;
    if (count > 1 && offsets.length >= count * 2) {
      const width = offsets[count] - offsets[0];
      if (track.scrollLeft < offsets[0] + 40) {
        track.scrollLeft += width;
        dragRef.current.startScroll += width;
      } else if (track.scrollLeft > offsets[0] + width * 2 - 40) {
        track.scrollLeft -= width;
        dragRef.current.startScroll -= width;
      }
    }
    setIndex(nearestIndex() % count);
  }, [count, itemOffsets, nearestIndex]);

  useEffect(() => {
    const track = trackRef.current;
    if (!track) return;
    const onPointerDown = (event: PointerEvent) => {
      touchedRef.current = true;
      dragRef.current = { startX: event.clientX, startScroll: track.scrollLeft, dragging: true };
      track.classList.add("is-dragging");
    };
    const onPointerMove = (event: PointerEvent) => {
      if (!dragRef.current.dragging) return;
      track.scrollLeft = dragRef.current.startScroll - (event.clientX - dragRef.current.startX);
    };
    const endDrag = () => {
      dragRef.current.dragging = false;
      track.classList.remove("is-dragging");
    };
    track.addEventListener("pointerdown", onPointerDown);
    window.addEventListener("pointermove", onPointerMove);
    window.addEventListener("pointerup", endDrag);
    return () => {
      track.removeEventListener("pointerdown", onPointerDown);
      window.removeEventListener("pointermove", onPointerMove);
      window.removeEventListener("pointerup", endDrag);
    };
  }, []);

  if (!count) return null;

  return (
    <div className="dw-carousel" aria-label={ariaLabel} role="group">
      <div className="dw-carousel-head">
        <span className="dw-carousel-counter">
          <b>{String(index + 1).padStart(2, "0")}</b>
          <i aria-hidden="true" />
          <span>/ {String(count).padStart(2, "0")}</span>
        </span>
        <div className="dw-carousel-arrows">
          <button type="button" aria-label="Previous item" onClick={() => goTo(nearestIndex() - 1)}>&larr;</button>
          <button type="button" aria-label="Next item" onClick={() => goTo(nearestIndex() + 1)}>&rarr;</button>
        </div>
      </div>
      <div className="dw-carousel-track" ref={trackRef} onScroll={onScroll}>
        {looped.map((item, i) => (
          <figure className="dw-carousel-item" key={`${item.src}-${i}`} aria-hidden={count > 1 && (i < count || i >= count * 2) ? true : undefined}>
            {item.src.endsWith(".mp4") || item.src.endsWith(".webm") ? (
              <video src={item.src} muted playsInline autoPlay loop preload="metadata" />
            ) : (
              <img src={item.src} alt={item.alt || item.caption || ""} loading="lazy" draggable={false} width={item.width} height={item.height} data-anim={item.anim} />
            )}
            {item.caption ? <figcaption>{item.caption}</figcaption> : null}
          </figure>
        ))}
      </div>
    </div>
  );
}
