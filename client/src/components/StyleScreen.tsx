import { getVisibleStyles, type PhotoStyle } from "../config/styles";

/** The booth screen fits 8 cards (2 x 4); with more the grid scrolls. */
const CARDS_PER_SCREEN = 8;

interface StyleScreenProps {
  restyle: boolean;
  hiddenStyles: readonly string[];
  onBack: () => void;
  onChoose: (style: PhotoStyle) => void;
}

export function StyleScreen({ restyle, hiddenStyles, onBack, onChoose }: StyleScreenProps) {
  const styles = getVisibleStyles(hiddenStyles);
  const scrolls = styles.length > CARDS_PER_SCREEN;

  return (
    <main className="screen style-screen">
      <header className="screen-header">
        <button type="button" className="button button-secondary header-button" onClick={onBack}>
          Back
        </button>
        <div>
          <p className="eyebrow">Select a reality</p>
          <h1>Choose your alter ego</h1>
          {restyle ? <p className="header-note">Your original photo will be used again.</p> : null}
        </div>
      </header>
      <div className={scrolls ? "style-grid scrolls" : "style-grid"}>
        {styles.map((style, index) => (
          <button
            key={style.id}
            type="button"
            className="style-card"
            style={{
              ["--from" as string]: style.theme.from,
              ["--to" as string]: style.theme.to,
            }}
            onClick={() => onChoose(style)}
          >
            {style.thumbnail ? <img className="style-thumb" src={style.thumbnail} alt="" /> : null}
            <span className="style-index">{String(index + 1).padStart(2, "0")}</span>
            <span className="style-copy">
              <span className="style-name">{style.displayName}</span>
              <span className="style-description">{style.shortDescription}</span>
            </span>
          </button>
        ))}
      </div>
    </main>
  );
}
