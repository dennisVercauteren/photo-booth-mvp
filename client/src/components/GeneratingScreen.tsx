import { useEffect, useState } from "react";
import type { CapturedPhoto } from "../types";

// Theatrical messages, not a fake estimate of progress from the provider.
const STAGES = [
  "Scanning your alternate identity...",
  "Recalibrating reality...",
  "Installing questionable fashion choices...",
  "Your parallel universe is almost ready...",
  "Reality is putting up a fight...",
] as const;

interface GeneratingScreenProps {
  photo: CapturedPhoto;
  imageCount: number;
  errorMessage: string | null;
  onRetry: () => void;
  onRetake: () => void;
  onNewSession: () => void;
}

export function GeneratingScreen({
  photo, imageCount, errorMessage, onRetry, onRetake, onNewSession,
}: GeneratingScreenProps) {
  const [stage, setStage] = useState(0);
  useEffect(() => {
    if (errorMessage) return;
    const timer = window.setInterval(() => setStage((value) => (value + 1) % STAGES.length), 3800);
    return () => window.clearInterval(timer);
  }, [errorMessage]);

  return (
    <main className="screen generating-screen">
      <div className="portrait-frame dimmed transformation-stage">
        <img src={photo.dataUrl} alt="Original photograph" />
        {!errorMessage ? (
          <div className="machine-orbit" aria-hidden="true">
            <span className="orbit orbit-outer" />
            <span className="orbit orbit-middle" />
            <span className="orbit orbit-inner" />
            <span className="orbit-symbol">✦</span>
          </div>
        ) : null}
      </div>
      <div className="generating-copy">
        {errorMessage ? (
          <>
            <p className="machine-label">TRANSFORMATION INTERRUPTED</p>
            <h1>{errorMessage}</h1>
            <div className="action-row three">
              <button type="button" className="button button-primary" onClick={onRetry}>Try Again</button>
              <button type="button" className="button button-secondary" onClick={onRetake}>Retake Photo</button>
              <button type="button" className="button button-secondary" onClick={onNewSession}>New Session</button>
            </div>
          </>
        ) : (
          <>
            <p className="machine-label">REALITY ENGINE / {imageCount} {imageCount === 1 ? "DESTINATION" : "DESTINATIONS"}</p>
            <h1>Rewriting reality...</h1>
            <p className="lede stage-message" aria-live="polite">{STAGES[stage]}</p>
            <div className="progress" role="progressbar" aria-label="Generating portraits, duration unknown"><span /></div>
            <p className="machine-fineprint">Real transformations take time. Hang on to your eyebrows.</p>
          </>
        )}
      </div>
    </main>
  );
}
