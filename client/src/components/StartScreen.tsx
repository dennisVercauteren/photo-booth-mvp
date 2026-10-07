import { useRef } from "react";
import { getEnabledStyles } from "../config/styles";

const SETTINGS_HOLD_MS = 2000;

interface StartScreenProps {
  onStart: () => void;
  onOpenSettings?: () => void;
}

export function StartScreen({ onStart, onOpenSettings }: StartScreenProps) {
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

  const examples = getEnabledStyles().filter((style) => style.thumbnail).slice(0, 4);

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
      <p className="eyebrow">Step right up!</p>
      <h1>
        <span>Magic</span> Photobooth
      </h1>
      <p className="lede">Snap a photo and become a pirate, a pop star, a viking...</p>
      <button type="button" className="button button-primary start-button" onClick={onStart}>
        Let's go!
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
