import { useEffect, useRef, useState, type RefObject } from "react";
import type { CameraDeviceOption, CameraIssue } from "../types";

export interface LiveCamera {
  label: string;
  deviceId: string;
  width: number;
  height: number;
  devices: CameraDeviceOption[];
}

interface UseCameraResult {
  videoRef: RefObject<HTMLVideoElement | null>;
  status: "idle" | "starting" | "live" | "error";
  issue: CameraIssue | null;
  live: LiveCamera | null;
}

export function useCamera(active: boolean, deviceId: string, retryToken: number): UseCameraResult {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [status, setStatus] = useState<UseCameraResult["status"]>("idle");
  const [issue, setIssue] = useState<CameraIssue | null>(null);
  const [live, setLive] = useState<LiveCamera | null>(null);

  useEffect(() => {
    if (!active) {
      setStatus("idle");
      return;
    }

    if (!navigator.mediaDevices?.getUserMedia || !window.isSecureContext) {
      setStatus("error");
      setIssue("unsupported");
      return;
    }

    let cancelled = false;
    let stream: MediaStream | null = null;
    let frame = 0;

    function begin(): void {
      const video = videoRef.current;
      if (cancelled) {
        return;
      }
      if (!video) {
        frame = window.requestAnimationFrame(begin);
        return;
      }
      void start(video);
    }

    async function start(videoElement: HTMLVideoElement): Promise<void> {
      setStatus("starting");
      setIssue(null);
      try {
        stream = await openCamera(deviceId);
        if (cancelled) {
          stopStream(stream);
          return;
        }

        videoElement.srcObject = stream;
        await videoElement.play();
        const track = stream.getVideoTracks()[0];
        const settings = track?.getSettings();
        const devices = await listVideoDevices();
        if (cancelled) {
          return;
        }

        setLive({
          label: track?.label || "Camera",
          deviceId: settings?.deviceId || deviceId,
          width: videoElement.videoWidth || settings?.width || 0,
          height: videoElement.videoHeight || settings?.height || 0,
          devices,
        });
        setStatus("live");
      } catch (error) {
        if (cancelled) {
          return;
        }
        setStatus("error");
        setIssue(toCameraIssue(error));
        console.error("[camera]", error instanceof Error ? error.message : error);
      }
    }

    begin();

    return () => {
      cancelled = true;
      window.cancelAnimationFrame(frame);
      stopStream(stream);
      if (videoRef.current) {
        videoRef.current.srcObject = null;
      }
    };
  }, [active, deviceId, retryToken]);

  return { videoRef, status, issue, live };
}

async function openCamera(deviceId: string): Promise<MediaStream> {
  const relaxed: MediaTrackConstraints = {
    width: { ideal: 1920 },
    height: { ideal: 1080 },
  };
  try {
    return await navigator.mediaDevices.getUserMedia({
      audio: false,
      video: buildConstraints(deviceId),
    });
  } catch (error) {
    const name = error instanceof DOMException ? error.name : "";
    const canRelax = name === "OverconstrainedError"
      || name === "NotFoundError"
      || name === "NotAllowedError";
    if (!deviceId || !canRelax) {
      throw error;
    }
    return navigator.mediaDevices.getUserMedia({
      audio: false,
      video: relaxed,
    });
  }
}

function buildConstraints(deviceId: string): MediaTrackConstraints {
  const video: MediaTrackConstraints = {
    width: { ideal: 1920 },
    height: { ideal: 1080 },
  };
  if (deviceId) {
    video.deviceId = { ideal: deviceId };
    return video;
  }
  video.facingMode = "user";
  return video;
}

async function listVideoDevices(): Promise<CameraDeviceOption[]> {
  const devices = await navigator.mediaDevices.enumerateDevices();
  return devices
    .filter((device) => device.kind === "videoinput")
    .map((device, index) => ({
      deviceId: device.deviceId,
      label: device.label || `Camera ${index + 1}`,
    }));
}

function stopStream(stream: MediaStream | null): void {
  stream?.getTracks().forEach((track) => {
    track.stop();
  });
}

function toCameraIssue(error: unknown): CameraIssue {
  if (!navigator.mediaDevices?.getUserMedia) {
    return "unsupported";
  }
  if (!(error instanceof DOMException)) {
    return "unknown";
  }
  switch (error.name) {
    case "NotAllowedError":
    case "PermissionDeniedError":
    case "SecurityError":
      return "denied";
    case "NotFoundError":
    case "OverconstrainedError":
    case "DevicesNotFoundError":
      return "unavailable";
    case "NotReadableError":
    case "TrackStartError":
    case "AbortError":
      return "busy";
    default:
      return "unknown";
  }
}

export function cameraIssueMessage(issue: CameraIssue): string {
  switch (issue) {
    case "denied":
      return "Camera access is blocked. Click the camera icon in the address bar, choose Allow, then try again.";
    case "unavailable":
      return "No camera was found. Connect a webcam and try again.";
    case "busy":
      return "The camera is in use by another application. Close it, then try again.";
    case "unsupported":
      return "This page cannot use the camera. Open http://localhost:5173 in Chrome, Edge, Safari, or Firefox.";
    case "unknown":
      return "The camera is unavailable right now. Please try again.";
    default: {
      const _never: never = issue;
      return _never;
    }
  }
}
