import { getEnabledStyles, type PhotoStyle } from "../config/styles";

interface StyleScreenProps {
  restyle: boolean;
  onBack: () => void;
  onChoose: (style: PhotoStyle) => void;
}

export function StyleScreen({ restyle, onBack, onChoose }: StyleScreenProps) {
  const styles = getEnabledStyles();

  return (
    <main className="screen style-screen">
      <header className="screen-header">
        <button type="button" className="button button-secondary header-button" onClick={onBack}>
          Back
        </button>
        <div>
          <p className="eyebrow">Choose a style</p>
          <h1>Who do you want to be?</h1>
          {restyle ? <p className="header-note">Your original photo will be used again.</p> : null}
        </div>
      </header>
      <div className="style-grid">
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
            <span className="style-index">{index + 1}</span>
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
