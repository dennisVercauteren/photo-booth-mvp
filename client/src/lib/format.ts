export function formatDuration(durationMs: number): string {
  return `${(durationMs / 1000).toFixed(1)} sec`;
}

export function formatClockStamp(date: Date): string {
  const pad = (value: number) => String(value).padStart(2, "0");
  return [
    date.getFullYear(),
    pad(date.getMonth() + 1),
    pad(date.getDate()),
  ].join("-") + `-${pad(date.getHours())}${pad(date.getMinutes())}${pad(date.getSeconds())}`;
}

export function extensionForMime(mimeType: string): string {
  switch (mimeType) {
    case "image/jpeg":
      return "jpg";
    case "image/webp":
      return "webp";
    default:
      return "png";
  }
}

export function buildDownloadName(styleId: string, mimeType: string, date = new Date(), variant?: number): string {
  const choice = typeof variant === "number" ? `-${variant}` : "";
  return `photobooth-${styleId}${choice}-${formatClockStamp(date)}.${extensionForMime(mimeType)}`;
}
