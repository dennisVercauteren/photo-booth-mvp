import { config } from "../config.js";
import { GeminiImageProvider } from "./geminiImageProvider.js";
import type { ImageGenerationProvider } from "./types.js";

const ProviderKind = {
  Gemini: "gemini",
} as const;

type ProviderKind = (typeof ProviderKind)[keyof typeof ProviderKind];

export function createImageProvider(): ImageGenerationProvider {
  const kind = ProviderKind.Gemini;
  switch (kind) {
    case ProviderKind.Gemini:
      return new GeminiImageProvider(config.geminiApiKey);
    default: {
      const _never: never = kind;
      return _never;
    }
  }
}
