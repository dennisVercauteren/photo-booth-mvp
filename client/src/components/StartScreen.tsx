import { useRef } from "react";
import { getVisibleStyles } from "../config/styles";

const SETTINGS_HOLD_MS = 2000;

interface StartScreenProps {
  hiddenStyles?: readonly string[];
  onStart: () => void;
  onOpenSettings?: () => void;
}

export function StartScreen({ hiddenStyles = [], onStart, onOpenSettings }: StartScreenProps) {
  const holdTimer = useRef<number | null>(null);

  function startHold(): void {
    cancelHold();
    holdTimer.current = window.setTimeout(() => {
      holdTimer.current = null;
      onOpenSettings?.();
    }, SETTINGS_HOLD_MS);
  }

  function cancelHold(): void {
    if (holdTimer.current !== null) {
      window.clearTimeout(holdTimer.current);
      holdTimer.current = null;
    }
  }

  const examples = getVisibleStyles(hiddenStyles).filter((style) => style.thumbnail).slice(0, 4);

  return (
    <main className="screen screen-center start-screen">
      <div className="polaroids" aria-hidden="true">
        {examples.map((style) => (
          <figure key={style.id} className="polaroid">
            <img src={style.thumbnail} alt="" />
            <figcaption>{style.displayName}</figcaption>
          </figure>
        ))}
      </div>
      <div className="machine-attract" aria-hidden="true"><span /><span /><span /></div>
      <p className="eyebrow">The impossible photo experience</p>
      <h1>
        <span>Meet your</span> Alter Ego
      </h1>
      <p className="lede">One photo. Three alternate realities. Anything can happen.</p>
      <p className="machine-ticker">IDENTITY SCANNER ONLINE <span>◆</span> REALITY ENGINE READY <span>◆</span> ENTER AT YOUR OWN RISK</p>
      <button type="button" className="button button-primary start-button" onClick={onStart}>
        Transform me!
      </button>
      {onOpenSettings ? (
        <button
          type="button"
          className="settings-gear"
          aria-label="Booth settings (hold for 2 seconds)"
          onPointerDown={startHold}
          onPointerUp={cancelHold}
          onPointerLeave={cancelHold}
          onPointerCancel={cancelHold}
          onContextMenu={(event) => event.preventDefault()}
        >
          ⚙
        </button>
      ) : null}
    </main>
  );
}
