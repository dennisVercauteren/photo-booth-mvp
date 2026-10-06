export interface SourceImage {
  bytes: Buffer;
  mimeType: "image/jpeg" | "image/png" | "image/webp";
}

export interface GenerationOptions {
  model: string;
  aspectRatio: string;
  imageSize: string;
  timeoutMs: number;
}

export interface GeneratedImage {
  bytes: Buffer;
  mimeType: string;
}

/**
 * Provider boundary for portrait transformation.
 * Gemini is the first implementation. Later providers can be added
 * without changing the HTTP route or the booth UI.
 */
export interface ImageGenerationProvider {
  readonly name: string;
  generateImage(
    sourceImage: SourceImage,
    prompt: string,
    options: GenerationOptions,
  ): Promise<GeneratedImage>;
}
