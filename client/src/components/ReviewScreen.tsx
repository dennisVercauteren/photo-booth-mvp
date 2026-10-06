import type { CapturedPhoto } from "../types";
import type { PhotoStyle } from "../config/styles";

interface ReviewScreenProps {
  photo: CapturedPhoto;
  style: PhotoStyle | undefined;
  onUse: () => void;
  onRetake: () => void;
}

export function ReviewScreen({ photo, style, onUse, onRetake }: ReviewScreenProps) {
  return (
    <main className="screen review-screen">
      <header className="screen-header compact-header">
        <div>
          <p className="eyebrow">{style?.displayName ?? "Review"}</p>
          <h1>Use this photo?</h1>
        </div>
      </header>
      <div className="portrait-frame">
        <img src={photo.dataUrl} alt="Captured photograph" />
      </div>
      <footer className="action-row two">
        <button type="button" className="button button-primary" onClick={onUse}>
          Use This Photo
        </button>
        <button type="button" className="button button-secondary" onClick={onRetake}>
          Retake
        </button>
      </footer>
    </main>
  );
}
