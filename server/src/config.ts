import dotenv from "dotenv";
import path from "node:path";
import { fileURLToPath } from "node:url";

const serverRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const repoRoot = path.resolve(serverRoot, "..");

dotenv.config({ path: path.join(serverRoot, ".env") });

const ASPECT_RATIOS = new Set([
  "1:1",
  "3:2",
  "2:3",
  "3:4",
  "4:3",
  "4:5",
  "5:4",
  "9:16",
  "16:9",
  "21:9",
  "9:21",
  "1:4",
  "4:1",
  "1:8",
  "8:1",
]);

const IMAGE_SIZES = new Set(["512", "1K", "2K", "4K"]);

const IMAGE_LONG_EDGE: Record<string, number> = {
  "512": 512,
  "1K": 1024,
  "2K": 2048,
  "4K": 4096,
};

function readString(name: string, fallback: string): string {
  const value = process.env[name]?.trim();
  return value ? value : fallback;
}

function readBoolean(name: string, fallback: boolean): boolean {
  const value = process.env[name]?.trim().toLowerCase();
  if (!value) {
    return fallback;
  }
  if (value === "true") {
    return true;
  }
  if (value === "false") {
    return false;
  }
  throw new Error(`${name} must be true or false.`);
}

function readPort(name: string, fallback: number): number {
  const raw = process.env[name]?.trim();
  if (!raw) {
    return fallback;
  }
  const port = Number(raw);
  if (!Number.isInteger(port) || port < 1 || port > 65535) {
    throw new Error(`${name} must be a valid TCP port.`);
  }
  return port;
}

function readPositiveInt(name: string, fallback: number): number {
  const raw = process.env[name]?.trim();
  if (!raw) {
    return fallback;
  }
  const value = Number(raw);
  if (!Number.isInteger(value) || value < 1) {
    throw new Error(`${name} must be a positive integer.`);
  }
  return value;
}

function readChoice(name: string, fallback: string, allowed: Set<string>): string {
  const value = readString(name, fallback);
  if (!allowed.has(value)) {
    throw new Error(`${name} must be one of: ${Array.from(allowed).join(", ")}.`);
  }
  return value;
}

export const paths = {
  serverRoot,
  repoRoot,
  outputs: path.join(repoRoot, "outputs"),
  clientDist: path.join(repoRoot, "client", "dist"),
  logs: path.join(serverRoot, "logs"),
  // Keep this outside the release folder so operator settings survive updates.
  settingsFile: path.resolve(serverRoot, readString("BOOTH_SETTINGS_FILE", "settings.json")),
};

/** Sales demo pictures, shown from the staff menu. Defaults to a "gallery" folder next to the settings file. */
export const galleryDir = path.resolve(serverRoot, readString("BOOTH_GALLERY_DIR", path.join(path.dirname(paths.settingsFile), "gallery")));

const imageSize = readChoice("GEMINI_IMAGE_SIZE", "1K", IMAGE_SIZES);
const requestedPreviewSize = readChoice("GEMINI_PREVIEW_SIZE", "1K", IMAGE_SIZES);

export function longEdgeForSize(size: string): number {
  const edge = IMAGE_LONG_EDGE[size];
  if (!edge) {
    throw new Error(`Unknown image size: ${size}`);
  }
  return edge;
}

export const config = {
  port: readPort("PORT", 3001),
  geminiApiKey: process.env.GEMINI_API_KEY?.trim() ?? "",
  geminiModel: readString("GEMINI_IMAGE_MODEL", "gemini-3.1-flash-image"),
  saveOutputImages: readBoolean("SAVE_OUTPUT_IMAGES", true),
  saveSourceImages: readBoolean("SAVE_SOURCE_IMAGES", false),
  timeoutMs: readPositiveInt("GEMINI_TIMEOUT_MS", 120_000),
  aspectRatio: readChoice("GEMINI_IMAGE_ASPECT_RATIO", "5:4", ASPECT_RATIOS),
  imageSize,
  previewImageSize: longEdgeForSize(requestedPreviewSize) > longEdgeForSize(imageSize)
    ? imageSize
    : requestedPreviewSize,
  maxImageBytes: 7 * 1024 * 1024,
};
