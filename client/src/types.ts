export interface CapturedPhoto {
  blob: Blob;
  dataUrl: string;
  width: number;
  height: number;
  capturedAt: string;
  cameraLabel: string;
  source: "camera" | "test-image";
}

export interface GenerateMetadata {
  styleId: string;
  model: string;
  durationMs: number;
  sourceWidth: number;
  sourceHeight: number;
  generatedAt: string;
  variant: number;
}

export interface GeneratedPhoto {
  dataUrl: string;
  mimeType: string;
  metadata: GenerateMetadata;
}

export interface BoothMeta {
  model: string;
  imageSize: string;
  aspectRatio: string;
}

export interface CameraDeviceOption {
  deviceId: string;
  label: string;
}

export type CameraIssue = "denied" | "unavailable" | "busy" | "unsupported" | "unknown";

export interface BoothSettings {
  imageCount: number;
  /** Colour correction for the NoIR camera (see camera/colorFix.ts). */
  colorFix: boolean;
}

export interface BoothSettingsResponse {
  settings: BoothSettings;
  limits: { maxImageCount: number };
}
