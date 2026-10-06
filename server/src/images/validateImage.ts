import { AppError, ErrorCode } from "../errors.js";
import { config } from "../config.js";
import { readImageSize, type ImageSize } from "./dimensions.js";

const MIME_BY_TYPE = {
  "image/jpeg": "image/jpeg",
  "image/png": "image/png",
  "image/webp": "image/webp",
} as const;

export type SupportedMimeType = keyof typeof MIME_BY_TYPE;

export interface ValidatedImage {
  bytes: Buffer;
  mimeType: SupportedMimeType;
  size: ImageSize;
}

export function validateImage(file: Express.Multer.File | undefined): ValidatedImage {
  if (!file || !file.buffer || file.buffer.length === 0) {
    throw new AppError(400, ErrorCode.Validation, "Missing image upload.");
  }

  if (file.size > config.maxImageBytes || file.buffer.length > config.maxImageBytes) {
    throw new AppError(413, ErrorCode.ImageTooLarge, `Image is larger than ${config.maxImageBytes} bytes.`);
  }

  const mimeType = normalizeMimeType(file.mimetype, file.buffer);
  let size: ImageSize;
  try {
    size = readImageSize(file.buffer, mimeType);
  } catch (error) {
    const detail = error instanceof Error ? error.message : "Unreadable image.";
    throw new AppError(400, ErrorCode.MalformedImage, detail);
  }

  if (size.width < 64 || size.height < 64 || size.width > 8000 || size.height > 8000) {
    throw new AppError(
      400,
      ErrorCode.Validation,
      `Unsupported dimensions ${size.width}x${size.height}.`,
    );
  }

  return {
    bytes: file.buffer,
    mimeType,
    size,
  };
}

function normalizeMimeType(declared: string, buffer: Buffer): SupportedMimeType {
  const sniffed = sniffMimeType(buffer);
  if (!sniffed) {
    throw new AppError(400, ErrorCode.UnsupportedFormat, `Unsupported image type: ${declared || "unknown"}.`);
  }

  const normalizedDeclared = declared === "image/jpg" ? "image/jpeg" : declared;
  if (normalizedDeclared && normalizedDeclared !== sniffed && normalizedDeclared in MIME_BY_TYPE) {
    throw new AppError(400, ErrorCode.UnsupportedFormat, "Declared image type does not match the file contents.");
  }

  return sniffed;
}

function sniffMimeType(buffer: Buffer): SupportedMimeType | undefined {
  if (buffer.length >= 3 && buffer[0] === 0xff && buffer[1] === 0xd8 && buffer[2] === 0xff) {
    return "image/jpeg";
  }
  if (buffer.length >= 8 && buffer.subarray(0, 8).toString("hex") === "89504e470d0a1a0a") {
    return "image/png";
  }
  if (buffer.length >= 12 && buffer.toString("ascii", 0, 4) === "RIFF" && buffer.toString("ascii", 8, 12) === "WEBP") {
    return "image/webp";
  }
  return undefined;
}
