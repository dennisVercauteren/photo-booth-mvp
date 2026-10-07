import { Router } from "express";
import multer from "multer";
import { config } from "../config.js";
import { AppError, ErrorCode } from "../errors.js";
import { validateImage } from "../images/validateImage.js";
import type { ImageGenerationProvider, SourceImage } from "../providers/types.js";
import { logGeneration } from "../services/generationLog.js";
import { saveGeneratedImage, saveSourceImage } from "../services/outputStore.js";
import { getSettings } from "../services/settingsStore.js";
import { styleService } from "../styles/styleService.js";
import { PORTRAIT_VARIATIONS } from "../styles/variations.js";

export function createGenerateRouter(provider: ImageGenerationProvider): Router {
  const router = Router();
  const upload = multer({
    storage: multer.memoryStorage(),
    limits: {
      fileSize: config.maxImageBytes,
      files: 1,
    },
  });

  router.post("/generate", upload.single("image"), async (req, res, next) => {
    const styleId = readStyleId(req.body);

    try {
      if (!styleId) {
        throw new AppError(400, ErrorCode.UnknownStyle, "Missing or invalid styleId.");
      }

      const style = styleService.getStyleById(styleId);
      if (!style) {
        throw new AppError(400, ErrorCode.UnknownStyle, `Unknown style: ${styleId}`);
      }

      const image = validateImage(req.file);
      const sessionId = readSessionId(req.body);
      const source = { bytes: image.bytes, mimeType: image.mimeType };
      const { imageCount } = await getSettings();

      const settled = await Promise.allSettled(
        PORTRAIT_VARIATIONS.slice(0, imageCount).map((variation, index) =>
          renderVariation({
            provider,
            styleId: style.id,
            prompt: styleService.buildPrompt(style, variation),
            source,
            sourceWidth: image.size.width,
            sourceHeight: image.size.height,
            sessionId,
            variant: index + 1,
          }),
        ),
      );

      const images = settled.flatMap((result) => (result.status === "fulfilled" ? [result.value] : []));
      if (images.length === 0) {
        const failures = settled.flatMap((result) => (result.status === "rejected" ? [result.reason] : []));
        throw pickFailure(failures);
      }

      try {
        await saveSourceImage(image.bytes, image.mimeType);
      } catch (saveError) {
        const message = saveError instanceof Error ? saveError.message : "Output save failed.";
        console.error(`[output] ${message}`);
      }

      res.setHeader("Cache-Control", "no-store");
      res.json({
        success: true,
        images,
      });
    } catch (error) {
      next(error);
    }
  });

  return router;
}

function readStyleId(body: unknown): string | undefined {
  if (!isRecord(body) || typeof body.styleId !== "string") {
    return undefined;
  }
  const styleId = body.styleId.trim();
  if (!/^[a-z0-9-]{1,64}$/.test(styleId)) {
    return undefined;
  }
  return styleId;
}

function readSessionId(body: unknown): string | undefined {
  if (!isRecord(body) || typeof body.sessionId !== "string") {
    return undefined;
  }
  const sessionId = body.sessionId.trim();
  if (!/^[a-zA-Z0-9-]{8,80}$/.test(sessionId)) {
    return undefined;
  }
  return sessionId;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

interface PortraitResponse {
  imageBase64: string;
  mimeType: string;
  metadata: {
    styleId: string;
    model: string;
    durationMs: number;
    sourceWidth: number;
    sourceHeight: number;
    generatedAt: string;
    variant: number;
  };
}

async function renderVariation(input: {
  provider: ImageGenerationProvider;
  styleId: string;
  prompt: string;
  source: SourceImage;
  sourceWidth: number;
  sourceHeight: number;
  sessionId: string | undefined;
  variant: number;
}): Promise<PortraitResponse> {
  const started = performance.now();
  try {
    const generated = await input.provider.generateImage(input.source, input.prompt, {
      model: config.geminiModel,
      aspectRatio: config.aspectRatio,
      imageSize: config.previewImageSize,
      timeoutMs: config.timeoutMs,
    });
    const durationMs = Math.round(performance.now() - started);
    const generatedAt = new Date().toISOString();

    await logGeneration({
      timestamp: generatedAt,
      style: input.styleId,
      model: config.geminiModel,
      durationMs,
      success: true,
      sourceWidth: input.sourceWidth,
      sourceHeight: input.sourceHeight,
      variant: input.variant,
      ...(input.sessionId ? { sessionId: input.sessionId } : {}),
    });

    try {
      await saveGeneratedImage(generated.bytes, generated.mimeType);
    } catch (saveError) {
      const message = saveError instanceof Error ? saveError.message : "Output save failed.";
      console.error(`[output] ${message}`);
    }

    return {
      imageBase64: generated.bytes.toString("base64"),
      mimeType: generated.mimeType,
      metadata: {
        styleId: input.styleId,
        model: config.geminiModel,
        durationMs,
        sourceWidth: input.sourceWidth,
        sourceHeight: input.sourceHeight,
        generatedAt,
        variant: input.variant,
      },
    };
  } catch (error) {
    const durationMs = Math.round(performance.now() - started);
    const code = error instanceof AppError ? error.code : ErrorCode.ProviderUnavailable;
    await logGeneration({
      timestamp: new Date().toISOString(),
      style: input.styleId,
      model: config.geminiModel,
      durationMs,
      success: false,
      sourceWidth: input.sourceWidth,
      sourceHeight: input.sourceHeight,
      errorCode: code,
      variant: input.variant,
      ...(input.sessionId ? { sessionId: input.sessionId } : {}),
    });
    throw error;
  }
}

function pickFailure(failures: unknown[]): AppError {
  const appErrors = failures.filter((failure): failure is AppError => failure instanceof AppError);
  const preferred = appErrors.find((failure) =>
    failure.code === ErrorCode.InvalidApiKey
    || failure.code === ErrorCode.PlanRequired
    || failure.code === ErrorCode.RateLimit
  );
  return preferred ?? appErrors[0] ?? new AppError(502, ErrorCode.ProviderUnavailable, "All portrait variations failed.");
}
