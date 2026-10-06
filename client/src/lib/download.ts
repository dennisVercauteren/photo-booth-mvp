import { buildDownloadName } from "./format";

export function downloadDataUrl(dataUrl: string, styleId: string, mimeType: string, variant?: number): void {
  const link = document.createElement("a");
  link.href = dataUrl;
  link.download = buildDownloadName(styleId, mimeType, new Date(), variant);
  link.rel = "noopener";
  document.body.appendChild(link);
  link.click();
  link.remove();
}
