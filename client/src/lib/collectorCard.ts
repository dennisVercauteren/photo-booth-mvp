/**
 * Builds a shareable, print-friendly collector-card treatment locally.
 * Gemini's original image is never modified on the server, and Save Photo
 * remains available for guests who prefer the clean portrait.
 */
const LABELS = ["CINEMATIC", "EDITORIAL", "WILD CARD"] as const;

export async function downloadCollectorCard(dataUrl: string, styleName: string, variant: number): Promise<void> {
  const image = new Image();
  image.decoding = "async";
  await new Promise<void>((resolve, reject) => {
    image.onload = () => resolve();
    image.onerror = () => reject(new Error("Could not open the portrait."));
    image.src = dataUrl;
  });
  if (image.naturalWidth === 0 || image.naturalHeight === 0) {
    throw new Error("The portrait has no dimensions.");
  }

  // Follow the generated image aspect ratio: never crop anyone in a group.
  const width = 1600;
  const height = Math.round(width * image.naturalHeight / image.naturalWidth);
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Canvas is not available.");
  ctx.drawImage(image, 0, 0, width, height);

  const edge = Math.round(width * .025);
  const unit = width / 1600;
  const ribbonHeight = Math.min(Math.round(height * .28), Math.round(260 * unit));
  const bottom = height - ribbonHeight;
  const fade = ctx.createLinearGradient(0, bottom - 110 * unit, 0, height);
  fade.addColorStop(0, "rgba(8, 8, 30, 0)");
  fade.addColorStop(.44, "rgba(8, 8, 30, .83)");
  fade.addColorStop(1, "rgba(8, 8, 30, .96)");
  ctx.fillStyle = fade;
  ctx.fillRect(0, Math.max(0, bottom - 110 * unit), width, height - bottom + 110 * unit);

  ctx.lineWidth = 6 * unit;
  ctx.strokeStyle = "#a1ffdb";
  ctx.strokeRect(edge, edge, width - edge * 2, height - edge * 2);

  const tag = LABELS[variant - 1] ?? "ALTER EGO";
  ctx.textBaseline = "middle";
  ctx.fillStyle = "#a1ffdb";
  ctx.font = `800 ${Math.round(25 * unit)}px system-ui, sans-serif`;
  ctx.fillText("THE TRANSFORMATION MACHINE", edge + 32 * unit, edge + 38 * unit, width - edge * 3);
  ctx.font = `800 ${Math.round(32 * unit)}px system-ui, sans-serif`;
  ctx.fillText(`#${String(variant).padStart(2, "0")}  /  ${tag}`, edge + 32 * unit, bottom + 82 * unit);

  ctx.fillStyle = "#ffffff";
  ctx.font = `900 ${Math.round(72 * unit)}px system-ui, sans-serif`;
  ctx.fillText(styleName.toUpperCase(), edge + 32 * unit, bottom + 155 * unit, width - (edge + 32 * unit) * 2);
  ctx.fillStyle = "#cfc9e9";
  ctx.font = `600 ${Math.round(24 * unit)}px system-ui, sans-serif`;
  ctx.fillText("ONE PHOTO. INFINITE POSSIBILITIES.", edge + 32 * unit, bottom + 207 * unit);

  const blob = await new Promise<Blob>((resolve, reject) => {
    canvas.toBlob((result) => result ? resolve(result) : reject(new Error("Could not render collector card.")), "image/png");
  });
  const objectUrl = URL.createObjectURL(blob);
  try {
    const a = document.createElement("a");
    a.href = objectUrl;
    a.download = `alter-ego-${variant}-card.png`;
    document.body.appendChild(a);
    a.click();
    a.remove();
  } finally {
    // Delay revocation to allow the download to start in kiosk browsers.
    window.setTimeout(() => URL.revokeObjectURL(objectUrl), 30_000);
  }
}
