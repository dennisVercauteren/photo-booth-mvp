import sharp, { type Sharp } from "sharp";
import { config, longEdgeForSize } from "../config.js";
import { AppError, ErrorCode } from "../errors.js";
import type { SupportedMimeType } from "./validateImage.js";

export interface EnlargedImage {
  bytes: Buffer;
  mimeType: SupportedMimeType;
  enlarged: boolean;
}

/**
 * Enlarge the chosen preview and fit it to the print ratio.
 * A 5:4 file at the final size prints full-bleed on 5 by 4 inch paper.
 * Gemini is not called again.
 */
export async function enlargeImage(bytes: Buffer, mimeType: SupportedMimeType): Promise<EnlargedImage> {
  const metadata = await sharp(bytes, { failOn: "error" }).metadata();
  const width = metadata.width ?? 0;
  const height = metadata.height ?? 0;
  if (width < 1 || height < 1) {
    throw new AppError(400, ErrorCode.MalformedImage, "Could not read the portrait size.");
  }

  const outputSize = printSize(config.aspectRatio, longEdgeForSize(config.imageSize));
  if (width === outputSize.width && height === outputSize.height) {
    return { bytes, mimeType, enlarged: false };
  }

  const resized = sharp(bytes, { failOn: "error" }).resize({
    width: outputSize.width,
    height: outputSize.height,
    fit: "cover",
    position: "centre",
    kernel: "lanczos3",
  });
  const output = await encode(resized, mimeType);
  return { bytes: output, mimeType, enlarged: true };
}

function printSize(aspectRatio: string, longEdge: number): { width: number; height: number } {
  const [widthPart, heightPart] = aspectRatio.split(":").map((part) => Number(part));
  if (!Number.isInteger(widthPart) || !Number.isInteger(heightPart) || widthPart < 1 || heightPart < 1) {
    throw new AppError(500, ErrorCode.Internal, `Invalid print ratio: ${aspectRatio}`);
  }
  if (widthPart >= heightPart) {
    return {
      width: longEdge,
      height: Math.max(1, Math.round(longEdge * heightPart / widthPart)),
    };
  }
  return {
    width: Math.max(1, Math.round(longEdge * widthPart / heightPart)),
    height: longEdge,
  };
}

function encode(image: Sharp, mimeType: SupportedMimeType): Promise<Buffer> {
  switch (mimeType) {
    case "image/jpeg":
      return image.jpeg({ quality: 93 }).toBuffer();
    case "image/webp":
      return image.webp({ quality: 93 }).toBuffer();
    case "image/png":
      return image.png().toBuffer();
    default: {
      const _never: never = mimeType;
      return Promise.reject(new AppError(400, ErrorCode.UnsupportedFormat, `Unsupported image type: ${String(_never)}`));
    }
  }
}
