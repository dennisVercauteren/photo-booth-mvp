interface StartScreenProps {
  onStart: () => void;
}

export function StartScreen({ onStart }: StartScreenProps) {
  return (
    <main className="screen screen-center start-screen">
      <p className="eyebrow">Self-service portrait studio</p>
      <h1>AI PHOTOBOOTH</h1>
      <p className="lede">Transform yourself into another world.</p>
      <button type="button" className="button button-primary start-button" onClick={onStart}>
        Start
      </button>
    </main>
  );
}
