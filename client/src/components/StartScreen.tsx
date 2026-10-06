import { getEnabledStyles } from "../config/styles";

interface StartScreenProps {
  onStart: () => void;
}

export function StartScreen({ onStart }: StartScreenProps) {
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
    </main>
  );
}
