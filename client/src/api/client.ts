import { API_BASE } from "../config/developer";
import type { BoothMeta, GeneratedPhoto, GenerateMetadata } from "../types";

export class GenerateClientError extends Error {
  readonly code: string;

  constructor(code: string) {
    super(code);
    this.name = "GenerateClientError";
    this.code = code;
  }
}

const FRIENDLY_MESSAGES: Record<string, string> = {
  timeout: "This portrait is taking too long. Please try again.",
  plan_required: "Image generation isn't included in this API plan.\nEnable billing for the Gemini project, then try again.",
  rate_limit: "The booth is busy right now. Please wait a moment and try again.",
  image_too_large: "That photo is too large. Please retake it and try again.",
  unsupported_format: "That photo format is not supported. Please retake it and try again.",
  malformed_image: "We couldn't read that photo. Please retake it and try again.",
  unknown_style: "That style is not available. Please choose another one.",
};

const GENERIC_MESSAGE = "We couldn't create your photo.\nPlease try again.";

export function friendlyGenerateMessage(code: string | undefined): string {
  if (!code) {
    return GENERIC_MESSAGE;
  }
  return FRIENDLY_MESSAGES[code] ?? GENERIC_MESSAGE;
}

export async function fetchBoothMeta(signal?: AbortSignal): Promise<BoothMeta> {
  const response = await fetch(`${API_BASE}/api/meta`, { signal });
  if (!response.ok) {
    throw new Error("Booth metadata is unavailable.");
  }
  const body: unknown = await response.json();
  if (!isBoothMeta(body)) {
    throw new Error("Booth metadata was malformed.");
  }
  return body;
}

export async function fetchStyleIds(signal?: AbortSignal): Promise<string[]> {
  const response = await fetch(`${API_BASE}/api/styles`, { signal });
  if (!response.ok) {
    throw new Error("Style list is unavailable.");
  }
  const body: unknown = await response.json();
  if (!body || typeof body !== "object" || !("styles" in body) || !Array.isArray(body.styles)) {
    throw new Error("Style list was malformed.");
  }
  return body.styles.flatMap((style) => {
    if (!style || typeof style !== "object" || !("id" in style) || typeof style.id !== "string") {
      return [];
    }
    return [style.id];
  });
}

export async function requestPortraits(input: {
  image: Blob;
  styleId: string;
  sessionId: string;
  signal: AbortSignal;
}): Promise<GeneratedPhoto[]> {
  const form = new FormData();
  const filename = input.image.type === "image/png" ? "capture.png" : input.image.type === "image/webp" ? "capture.webp" : "capture.jpg";
  form.append("image", input.image, filename);
  form.append("styleId", input.styleId);
  form.append("sessionId", input.sessionId);

  let response: Response;
  try {
    response = await fetch(`${API_BASE}/api/generate`, {
      method: "POST",
      body: form,
      signal: input.signal,
    });
  } catch (error) {
    if (isAbortError(error)) {
      throw error;
    }
    throw new GenerateClientError("provider_unavailable");
  }

  let payload: unknown;
  try {
    payload = await response.json();
  } catch {
    throw new GenerateClientError(response.ok ? "malformed_response" : "provider_unavailable");
  }

  if (!isRecord(payload) || typeof payload.success !== "boolean") {
    throw new GenerateClientError("malformed_response");
  }

  if (!payload.success) {
    const code = readErrorCode(payload.error);
    throw new GenerateClientError(code);
  }

  if (!Array.isArray(payload.images) || payload.images.length === 0) {
    throw new GenerateClientError("no_image");
  }

  const portraits = payload.images.flatMap(readPortrait);
  if (portraits.length === 0) {
    throw new GenerateClientError("no_image");
  }

  return portraits.sort((left, right) => left.metadata.variant - right.metadata.variant);
}

export async function upscalePortrait(photo: GeneratedPhoto, signal: AbortSignal): Promise<GeneratedPhoto> {
  const blob = await fetch(photo.dataUrl).then((response) => response.blob());
  const form = new FormData();
  const extension = photo.mimeType === "image/jpeg" ? "jpg" : photo.mimeType === "image/webp" ? "webp" : "png";
  form.append("image", blob, `portrait.${extension}`);

  let response: Response;
  try {
    response = await fetch(`${API_BASE}/api/upscale`, {
      method: "POST",
      body: form,
      signal,
    });
  } catch (error) {
    if (isAbortError(error)) {
      throw error;
    }
    throw new GenerateClientError("provider_unavailable");
  }

  let payload: unknown;
  try {
    payload = await response.json();
  } catch {
    throw new GenerateClientError("malformed_response");
  }

  if (!isRecord(payload) || payload.success !== true) {
    throw new GenerateClientError(readErrorCode(isRecord(payload) ? payload.error : undefined));
  }

  if (payload.enlarged !== true) {
    return photo;
  }

  if (typeof payload.imageBase64 !== "string" || payload.imageBase64.length === 0) {
    throw new GenerateClientError("no_image");
  }

  const mimeType = typeof payload.mimeType === "string" && payload.mimeType.startsWith("image/")
    ? payload.mimeType
    : photo.mimeType;

  return {
    ...photo,
    dataUrl: `data:${mimeType};base64,${payload.imageBase64}`,
    mimeType,
  };
}

function isBoothMeta(value: unknown): value is BoothMeta {
  return isRecord(value)
    && typeof value.model === "string"
    && typeof value.imageSize === "string"
    && typeof value.aspectRatio === "string";
}

function readPortrait(value: unknown): GeneratedPhoto[] {
  if (!isRecord(value)) {
    return [];
  }
  const metadata = readMetadata(value.metadata);
  if (typeof value.imageBase64 !== "string" || value.imageBase64.length === 0 || !metadata) {
    return [];
  }
  const mimeType = typeof value.mimeType === "string" && value.mimeType.startsWith("image/")
    ? value.mimeType
    : "image/png";
  return [{
    dataUrl: `data:${mimeType};base64,${value.imageBase64}`,
    mimeType,
    metadata,
  }];
}

function readMetadata(value: unknown): GenerateMetadata | null {
  if (!isRecord(value)) {
    return null;
  }
  if (
    typeof value.styleId !== "string"
    || typeof value.model !== "string"
    || typeof value.durationMs !== "number"
    || typeof value.sourceWidth !== "number"
    || typeof value.sourceHeight !== "number"
    || typeof value.generatedAt !== "string"
    || typeof value.variant !== "number"
  ) {
    return null;
  }
  return {
    styleId: value.styleId,
    model: value.model,
    durationMs: value.durationMs,
    sourceWidth: value.sourceWidth,
    sourceHeight: value.sourceHeight,
    generatedAt: value.generatedAt,
    variant: value.variant,
  };
}

function readErrorCode(value: unknown): string {
  if (!isRecord(value) || typeof value.code !== "string") {
    return "internal_error";
  }
  return value.code;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function isAbortError(error: unknown): boolean {
  return error instanceof DOMException && error.name === "AbortError";
}
