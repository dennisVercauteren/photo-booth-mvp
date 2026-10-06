import { RESULT_ACTIONS, ResultAction } from "../config/flow";
import { DEVELOPER_MODE } from "../config/developer";
import { downloadDataUrl } from "../lib/download";
import { formatDuration } from "../lib/format";
import type { GeneratedPhoto } from "../types";

interface ResultScreenProps {
  options: GeneratedPhoto[];
  selected: GeneratedPhoto;
  selectedIndex: number;
  onSelect: (index: number) => void;
  onRestyle: () => void;
  onRetake: () => void;
  onNewSession: () => void;
}

export function ResultScreen({
  options,
  selected,
  selectedIndex,
  onSelect,
  onRestyle,
  onRetake,
  onNewSession,
}: ResultScreenProps) {
  function runAction(action: (typeof RESULT_ACTIONS)[number]["id"]): void {
    switch (action) {
      case ResultAction.Restyle:
        onRestyle();
        return;
      case ResultAction.Retake:
        onRetake();
        return;
      case ResultAction.Download:
        downloadDataUrl(selected.dataUrl, selected.metadata.styleId, selected.mimeType, selected.metadata.variant);
        return;
      case ResultAction.NewSession:
        onNewSession();
        return;
      default: {
        const _never: never = action;
        throw new Error(`Unhandled result action: ${String(_never)}`);
      }
    }
  }

  return (
    <main className="screen result-screen">
      <header className="screen-header compact-header">
        <div>
          <p className="eyebrow">Your portraits</p>
          <h1>{options.length > 1 ? "Choose your favourite" : "Your portrait"}</h1>
          {DEVELOPER_MODE ? (
            <p className="dev-timing">Portrait {selected.metadata.variant}: {formatDuration(selected.metadata.durationMs)}</p>
          ) : null}
        </div>
      </header>
      <div className="choice-stage">
        <div className="portrait-frame">
          <img src={selected.dataUrl} alt={`Portrait ${selected.metadata.variant}`} />
        </div>
        {options.length > 1 ? (
          <div className="choice-row" role="listbox" aria-label="Portrait choices">
            {options.map((option, index) => {
              const chosen = index === selectedIndex;
              return (
                <button
                  key={option.metadata.variant}
                  type="button"
                  className={chosen ? "choice choice-selected" : "choice"}
                  role="option"
                  aria-selected={chosen}
                  onClick={() => onSelect(index)}
                >
                  <img src={option.dataUrl} alt="" />
                  <span>{option.metadata.variant}</span>
                </button>
              );
            })}
          </div>
        ) : null}
      </div>
      <footer className="action-row">
        {RESULT_ACTIONS.map((action) => (
          <button
            key={action.id}
            type="button"
            className={action.id === ResultAction.Download ? "button button-primary" : "button button-secondary"}
            onClick={() => runAction(action.id)}
          >
            {action.label}
          </button>
        ))}
      </footer>
    </main>
  );
}
