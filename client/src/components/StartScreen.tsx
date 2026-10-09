import { useEffect, useRef, useState } from "react";
import { getVisibleStyles } from "../config/styles";

const SETTINGS_HOLD_MS = 2000;
const SAMPLE_INTERVAL_MS = 6500;

interface StartScreenProps {
  hiddenStyles?: readonly string[];
  onStart: () => void;
  onOpenSettings?: () => void;
}

/** Attract mode only uses enabled, operator-visible style images. */
export function StartScreen({ hiddenStyles = [], onStart, onOpenSettings }: StartScreenProps) {
  const holdTimer = useRef<number | null>(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const examples = getVisibleStyles(hiddenStyles).filter((style) => style.thumbnail);
  const keys = examples.map((style) => style.id).join("|");

  useEffect(() => setActiveIndex(0), [keys]);
  useEffect(() => {
    if (examples.length < 2) return;
    const timer = window.setInterval(() => {
      setActiveIndex((current) => (current + 1) % examples.length);
    }, SAMPLE_INTERVAL_MS);
    return () => window.clearInterval(timer);
  }, [keys, examples.length]);

  function cancelHold(): void {
    if (holdTimer.current !== null) {
      window.clearTimeout(holdTimer.current);
      holdTimer.current = null;
    }
  }

  function startHold(): void {
    cancelHold();
    holdTimer.current = window.setTimeout(() => {
      holdTimer.current = null;
      onOpenSettings?.();
    }, SETTINGS_HOLD_MS);
  }

  const sample = examples[activeIndex % Math.max(1, examples.length)];

  return (
    <main className="screen screen-center start-screen">
      {sample?.thumbnail ? (
        <div className="attract-backdrop" aria-hidden="true">
          <img key={sample.id + "-ambient"} className="attract-ambient" src={sample.thumbnail} alt="" />
          <img key={sample.id + "-feature"} className="attract-feature" src={sample.thumbnail} alt="" />
          <div className="attract-shade" />
        </div>
      ) : null}
      <div className="machine-attract" aria-hidden="true"><span /><span /><span /></div>
      <div className="attract-content">
        <p className="eyebrow">The impossible photo experience</p>
        <h1><span>Meet your</span> Alter Ego</h1>
        <p className="lede">One photo. A whole new reality. Anything can happen.</p>
        <button type="button" className="button button-primary start-button" onClick={onStart}>
          Transform me!
        </button>
        <div className="attract-now-showing" aria-live="off">
          <span className="attract-live-dot" aria-hidden="true" />
          <span>DISCOVER YOUR NEXT SELF</span>
          {sample ? <strong>{sample.displayName}</strong> : null}
          {examples.length > 1 ? <small>{String(activeIndex + 1).padStart(2, "0")} / {String(examples.length).padStart(2, "0")}</small> : null}
        </div>
      </div>
      {onOpenSettings ? (
        <button
          type="button" className="settings-gear"
          aria-label="Booth settings (hold for 2 seconds)"
          onPointerDown={startHold} onPointerUp={cancelHold}
          onPointerLeave={cancelHold} onPointerCancel={cancelHold}
          onContextMenu={(event) => event.preventDefault()}
        >⚙</button>
      ) : null}
    </main>
  );
}
