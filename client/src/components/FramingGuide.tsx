/** Fine dashed head-and-shoulders outline over the portrait preview. */
export function FramingGuide() {
  return (
    <div className="guide" aria-hidden="true">
      <p className="guide-caption">LOOK AT THE CAMERA</p>
      <svg className="guide-silhouette" viewBox="0 0 400 500" preserveAspectRatio="xMidYMid meet">
        <ellipse cx="200" cy="200" rx="88" ry="116" />
        <path d="M168 310 L166 346 C120 360 62 384 46 500" />
        <path d="M232 310 L234 346 C280 360 338 384 354 500" />
      </svg>
    </div>
  );
}
