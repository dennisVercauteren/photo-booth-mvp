import { JPEG_QUALITY } from "../config/developer";
import type { CapturedPhoto } from "../types";

/** Width / height of the photo the guest sees and we send: a 4x5 portrait. */
export const CAPTURE_ASPECT = 4 / 5;

/**
 * Captures the current frame. With `corrected` (a canvas the colour fix just drew the same
 * frame on) the photo is taken from that canvas, so it matches the preview.
 */
export async function captureVideoFrame(
  video: HTMLVideoElement,
  cameraLabel: string,
  corrected?: HTMLCanvasElement | null,
): Promise<CapturedPhoto> {
  const sourceWidth = video.videoWidth;
  const sourceHeight = video.videoHeight;
  if (!sourceWidth || !sourceHeight) {
    throw new Error("The camera frame is not ready.");
  }

  // Crop the centre of the camera frame to the portrait shape shown on screen.
  const width = Math.round(Math.min(sourceWidth, sourceHeight * CAPTURE_ASPECT));
  const height = Math.round(width / CAPTURE_ASPECT);
  const left = Math.round((sourceWidth - width) / 2);
  const top = Math.round((sourceHeight - height) / 2);

  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const context = canvas.getContext("2d");
  if (!context) {
    throw new Error("The photo could not be captured.");
  }

  context.drawImage(corrected ?? video, left, top, width, height, 0, 0, width, height);
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
