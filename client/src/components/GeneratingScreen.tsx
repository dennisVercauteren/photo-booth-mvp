import { PORTRAIT_CHOICE_COUNT } from "../config/developer";
import type { CapturedPhoto } from "../types";

interface GeneratingScreenProps {
  photo: CapturedPhoto;
  errorMessage: string | null;
  onRetry: () => void;
  onRetake: () => void;
  onNewSession: () => void;
}

export function GeneratingScreen({
  photo,
  errorMessage,
  onRetry,
  onRetake,
  onNewSession,
}: GeneratingScreenProps) {
  return (
    <main className="screen generating-screen">
      <div className="portrait-frame dimmed">
        <img src={photo.dataUrl} alt="Original photograph" />
      </div>
      <div className="generating-copy">
        {errorMessage ? (
          <>
            <h1>{errorMessage}</h1>
            <div className="action-row three">
              <button type="button" className="button button-primary" onClick={onRetry}>
                Try Again
              </button>
              <button type="button" className="button button-secondary" onClick={onRetake}>
                Retake Photo
              </button>
              <button type="button" className="button button-secondary" onClick={onNewSession}>
                New Session
              </button>
            </div>
          </>
        ) : (
          <>
            <h1>Creating {PORTRAIT_CHOICE_COUNT} portraits...</h1>
            <p className="lede">They are made at the same time.</p>
            <div className="progress" role="progressbar" aria-label="Creating portrait">
              <span />
            </div>
          </>
        )}
      </div>
    </main>
  );
}
