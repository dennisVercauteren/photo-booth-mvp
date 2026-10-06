import { ApiError, GoogleGenAI } from "@google/genai";
import { AppError, ErrorCode } from "../errors.js";
import type { GeneratedImage, GenerationOptions, ImageGenerationProvider, SourceImage } from "./types.js";

/**
 * Gemini image editing via the Interactions API.
 * Docs: https://ai.google.dev/gemini-api/docs/image-generation
 * Model: gemini-3.1-flash-image (stable id, checked October 2026).
 * generateContent is the legacy API and is not used here.
 */
export class GeminiImageProvider implements ImageGenerationProvider {
  readonly name = "gemini";
  private client: GoogleGenAI | null = null;

  constructor(private readonly apiKey: string) {}

  async generateImage(
    sourceImage: SourceImage,
    prompt: string,
    options: GenerationOptions,
  ): Promise<GeneratedImage> {
    if (!this.apiKey) {
      throw new AppError(500, ErrorCode.InvalidApiKey, "GEMINI_API_KEY is not configured.");
    }

    const signal = AbortSignal.timeout(options.timeoutMs);

    try {
      const interaction = await this.getClient(options.timeoutMs).interactions.create(
        {
          model: options.model,
          input: [
            { type: "text", text: prompt },
            {
              type: "image",
              mime_type: sourceImage.mimeType,
              data: sourceImage.bytes.toString("base64"),
            },
          ],
          // This model rejects an explicit delivery mode and returns the image inline when the field is omitted.
          response_format: {
            type: "image",
            aspect_ratio: options.aspectRatio,
            image_size: options.imageSize,
          },
          store: false,
        },
        {
          timeout_ms: options.timeoutMs,
          signal,
          retries: { strategy: "none" },
        },
      );

      if (interaction.status !== "completed") {
        throw new AppError(502, ErrorCode.NoImage, summarizeInteraction(interaction.status, interaction.errors));
      }

      const image = await extractImage(interaction, signal);
      if (!image) {
        throw new AppError(502, ErrorCode.NoImage, "Gemini completed without an image.");
      }

      return image;
    } catch (error) {
      throw toAppError(error);
    }
  }

  private getClient(timeoutMs: number): GoogleGenAI {
    if (!this.client) {
      this.client = new GoogleGenAI({
        apiKey: this.apiKey,
        httpOptions: { timeout: timeoutMs },
      });
    }
    return this.client;
  }
}

interface InteractionImage {
  output_image?: {
    data?: string;
    mime_type?: string;
    uri?: string;
    type?: string;
  };
  steps?: ReadonlyArray<{
    type?: string;
    content?: ReadonlyArray<{
      type?: string;
      data?: string;
      mime_type?: string;
      uri?: string;
    }>;
  }>;
  status?: string;
  errors?: unknown;
}

async function extractImage(interaction: InteractionImage, signal: AbortSignal): Promise<GeneratedImage | null> {
  const direct = await readBlock(interaction.output_image, signal);
  if (direct) {
    return direct;
  }

  const steps = interaction.steps ?? [];
  for (let index = steps.length - 1; index >= 0; index -= 1) {
    const step = steps[index];
    if (!step || step.type !== "model_output" || !step.content) {
      continue;
    }
    for (let partIndex = step.content.length - 1; partIndex >= 0; partIndex -= 1) {
      const image = await readBlock(step.content[partIndex], signal);
      if (image) {
        return image;
      }
    }
  }

  return null;
}

async function readBlock(
  block: { data?: string; mime_type?: string; uri?: string; type?: string } | undefined,
  signal: AbortSignal,
): Promise<GeneratedImage | null> {
  if (!block || (block.type && block.type !== "image")) {
    return null;
  }

  const bytes = block.data
    ? decodeBase64(block.data)
    : block.uri
      ? await downloadImage(block.uri, signal)
      : null;
  if (!bytes || bytes.length === 0) {
    return null;
  }

  const mimeType = sniffMimeType(bytes, block.mime_type);
  if (!mimeType) {
    throw new AppError(502, ErrorCode.MalformedResponse, "Gemini returned an unrecognized image payload.");
  }

  return { bytes, mimeType };
}

function decodeBase64(data: string): Buffer {
  const payload = data.includes(",") ? data.slice(data.indexOf(",") + 1) : data;
  return Buffer.from(payload, "base64");
}

async function downloadImage(uri: string, signal: AbortSignal): Promise<Buffer | null> {
  if (!uri.startsWith("https://")) {
    return null;
  }
  const response = await fetch(uri, { signal });
  if (!response.ok) {
    throw new AppError(502, ErrorCode.MalformedResponse, `Gemini image URL returned ${response.status}.`);
  }
  return Buffer.from(await response.arrayBuffer());
}

function sniffMimeType(bytes: Buffer, declared: string | undefined): string | null {
  if (bytes.length >= 3 && bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff) {
    return "image/jpeg";
  }
  if (bytes.length >= 8 && bytes.subarray(0, 8).toString("hex") === "89504e470d0a1a0a") {
    return "image/png";
  }
  if (bytes.length >= 12 && bytes.toString("ascii", 0, 4) === "RIFF" && bytes.toString("ascii", 8, 12) === "WEBP") {
    return "image/webp";
  }
  if (declared && declared.startsWith("image/")) {
    return declared;
  }
  return null;
}

function summarizeInteraction(status: string | undefined, errors: unknown): string {
  const errorText = errors === undefined ? "" : ` ${safeJson(errors)}`;
  return `Gemini interaction status: ${status ?? "unknown"}.${errorText}`.slice(0, 500);
}

function safeJson(value: unknown): string {
  try {
    return JSON.stringify(value);
  } catch {
    return "";
  }
}

function toAppError(error: unknown): AppError {
  if (error instanceof AppError) {
    return error;
  }

  const described = describeError(error);
  console.error(
    `[gemini] ${described.name ?? "Error"} status=${described.status ?? "n/a"} ${described.message.slice(0, 500)}`,
  );

  if (isTimeout(error, described)) {
    return new AppError(504, ErrorCode.Timeout, described.message);
  }

  const status = described.status;
  const message = described.message;

  if (status === 401 || status === 403 || /api[_ ]?key|permission denied|unauthenticated/i.test(message)) {
    return new AppError(401, ErrorCode.InvalidApiKey, message);
  }
  if (status === 429 || /resource_exhausted|quota|rate limit/i.test(message)) {
    if (/free tier/i.test(message) && /limit:\s*0/i.test(message)) {
      return new AppError(402, ErrorCode.PlanRequired, message);
    }
    return new AppError(429, ErrorCode.RateLimit, message);
  }
  if (status === 404 || /unsupported model|unknown model|model is not supported|was not found/i.test(message)) {
    return new AppError(400, ErrorCode.UnsupportedModel, message);
  }
  if (/fetch failed|econnrefused|enotfound|network|socket/i.test(message)) {
    return new AppError(503, ErrorCode.ProviderUnavailable, message);
  }
  if (/no image|unrecognized image|interaction status/i.test(message)) {
    return new AppError(502, ErrorCode.NoImage, message);
  }

  return new AppError(502, ErrorCode.ProviderUnavailable, message);
}

function describeError(error: unknown): { status?: number; message: string; name?: string } {
  if (error instanceof ApiError) {
    return { status: error.status, message: error.message, name: error.name };
  }
  if (error instanceof Error) {
    const status = readStatus(error);
    return { status, message: error.message, name: error.name };
  }
  return { message: "Unknown Gemini error." };
}

function readStatus(error: Error): number | undefined {
  if (!("status" in error)) {
    return undefined;
  }
  const status = error.status;
  return typeof status === "number" ? status : undefined;
}

function isTimeout(error: unknown, described: { status?: number; name?: string; message: string }): boolean {
  if (described.status === 408 || described.status === 504) {
    return true;
  }
  if (described.name === "TimeoutError" || described.name === "AbortError" || described.name === "RequestTimeoutError") {
    return true;
  }
  if (error instanceof DOMException && (error.name === "TimeoutError" || error.name === "AbortError")) {
    return true;
  }
  return /timeout|timed out|aborted/i.test(described.message);
}
