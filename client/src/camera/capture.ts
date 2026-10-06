import { JPEG_QUALITY } from "../config/developer";
import type { CapturedPhoto } from "../types";

export async function captureVideoFrame(video: HTMLVideoElement, cameraLabel: string): Promise<CapturedPhoto> {
  const width = video.videoWidth;
  const height = video.videoHeight;
  if (!width || !height) {
    throw new Error("The camera frame is not ready.");
  }

  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const context = canvas.getContext("2d");
  if (!context) {
    throw new Error("The photo could not be captured.");
  }

  context.drawImage(video, 0, 0, width, height);
  const blob = await canvasToJpeg(canvas);
  const dataUrl = await blobToDataUrl(blob);

  return {
    blob,
    dataUrl,
    width,
    height,
    capturedAt: new Date().toISOString(),
    cameraLabel,
    source: "camera",
  };
}

export async function photoFromFile(file: File): Promise<CapturedPhoto> {
  if (!/^image\/(jpeg|png|webp)$/.test(file.type)) {
    throw new Error("Use a JPEG, PNG, or WebP image.");
  }
  const dataUrl = await blobToDataUrl(file);
  const { width, height } = await measureImage(dataUrl);
  return {
    blob: file,
    dataUrl,
    width,
    height,
    capturedAt: new Date().toISOString(),
    cameraLabel: "Test image",
    source: "test-image",
  };
}

function canvasToJpeg(canvas: HTMLCanvasElement): Promise<Blob> {
  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (blob) {
          resolve(blob);
        } else {
          reject(new Error("The photo could not be captured."));
        }
      },
      "image/jpeg",
      JPEG_QUALITY,
    );
  });
}

function blobToDataUrl(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === "string") {
        resolve(reader.result);
      } else {
        reject(new Error("The photo could not be read."));
      }
    };
    reader.onerror = () => {
      reject(new Error("The photo could not be read."));
    };
    reader.readAsDataURL(blob);
  });
}

function measureImage(dataUrl: string): Promise<{ width: number; height: number }> {
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.onload = () => {
      resolve({ width: image.naturalWidth, height: image.naturalHeight });
    };
    image.onerror = () => {
      reject(new Error("The photo could not be read."));
    };
    image.src = dataUrl;
  });
}
