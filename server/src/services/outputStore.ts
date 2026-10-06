import { randomUUID } from "node:crypto";
import fs from "node:fs/promises";
import path from "node:path";
import { config, paths } from "../config.js";

export async function saveGeneratedImage(bytes: Buffer, mimeType: string): Promise<void> {
  if (!config.saveOutputImages) {
    return;
  }
  const filePath = await createOutputPath(extensionForMime(mimeType));
  await fs.writeFile(filePath, bytes);
  console.info(`[output] saved ${path.relative(paths.repoRoot, filePath)}`);
}

export async function saveSourceImage(bytes: Buffer, mimeType: string): Promise<void> {
  if (!config.saveSourceImages) {
    return;
  }
  const filePath = await createOutputPath(`-source${extensionForMime(mimeType)}`);
  await fs.writeFile(filePath, bytes);
  console.info("[output] saved a source image because SAVE_SOURCE_IMAGES=true");
}

async function createOutputPath(extension: string): Promise<string> {
  const day = localDay();
  const directory = path.join(paths.outputs, day);
  await fs.mkdir(directory, { recursive: true });
  return path.join(directory, `${randomUUID()}${extension}`);
}

function localDay(date = new Date()): string {
  const pad = (value: number) => String(value).padStart(2, "0");
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
}

function extensionForMime(mimeType: string): string {
  switch (mimeType) {
    case "image/jpeg":
      return ".jpg";
    case "image/webp":
      return ".webp";
    case "image/png":
      return ".png";
    default:
      return ".img";
  }
}
