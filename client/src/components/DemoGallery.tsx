import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";

const AUTO_ADVANCE_MS = 6000;
const SWIPE_PX = 40;

interface DemoGalleryProps {
  pictures: string[];
  onClose: () => void;
}

/** Full-screen sales slideshow. Swipe or tap the left/right half to browse; it also moves on by itself. */
export function DemoGallery({ pictures, onClose }: DemoGalleryProps) {
  const [index, setIndex] = useState(0);
  const swipeStart = useRef<number | null>(null);
  const count = pictures.length;

  function go(step: number): void {
    setIndex((current) => (current + step + count) % count);
  }

  // Restart the timer after every change, so a picture someone just swiped to stays a full interval.
  useEffect(() => {
    if (count < 2) return;
    const timer = window.setTimeout(() => go(1), AUTO_ADVANCE_MS);
    return () => window.clearTimeout(timer);
  }, [index, count]);

  function onPointerUp(event: React.PointerEvent<HTMLDivElement>): void {
    const start = swipeStart.current;
    swipeStart.current = null;
    if (start === null) return;
    const moved = event.clientX - start;
    if (Math.abs(moved) >= SWIPE_PX) {
      go(moved < 0 ? 1 : -1);
      return;
    }
    const { left, width } = event.currentTarget.getBoundingClientRect();
    go(event.clientX - left < width / 2 ? -1 : 1);
  }

  return createPortal(
    <div className="demo-gallery" role="dialog" aria-modal="true" aria-label="Demo pictures">
      <div
        className="demo-stage"
        onPointerDown={(event) => {
          swipeStart.current = event.clientX;
        }}
        onPointerUp={onPointerUp}
        onPointerCancel={() => {
          swipeStart.current = null;
        }}
      >
        {pictures.map((url, position) => (
          <img key={url} src={url} alt="" className={position === index ? "demo-picture shown" : "demo-picture"} draggable={false} />
        ))}
      </div>
      <div className="demo-dots" aria-hidden="true">
        {pictures.map((url, position) => (
          <span key={url} className={position === index ? "active" : ""} />
        ))}
      </div>
      <p className="demo-count">
        {index + 1} / {count}
      </p>
      <button type="button" className="demo-close" aria-label="Close demo" onClick={onClose}>
        ✕
      </button>
    </div>,
    document.body,
  );
}
