import { useEffect, useRef, useState } from "react";
import { playCountdown, playShutter } from "../audio/sound";
import { photoFromFile, captureVideoFrame } from "../camera/capture";
import { cameraIssueMessage, useCamera, type LiveCamera } from "../camera/useCamera";
import { COUNTDOWN_STEP_MS, COUNTDOWN_STEPS, DEVELOPER_MODE } from "../config/developer";
import type { PhotoStyle } from "../config/styles";
import type { CapturedPhoto } from "../types";
import { FramingGuide } from "./FramingGuide";

interface CameraScreenProps {
  style: PhotoStyle | undefined;
  deviceId: string;
  retryToken: number;
  onLiveChange: (live: LiveCamera | null) => void;
  onBack: () => void;
  onCaptured: (photo: CapturedPhoto) => void;
  onRetryCamera: () => void;
}

export function CameraScreen({
  style,
  deviceId,
  retryToken,
  onLiveChange,
  onBack,
  onCaptured,
  onRetryCamera,
}: CameraScreenProps) {
  const { videoRef, status, issue, live } = useCamera(true, deviceId, retryToken);
  const [count, setCount] = useState<string | null>(null);
  const [flash, setFlash] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const busyRef = useRef(false);
  const mountedRef = useRef(true);

  useEffect(() => {
    onLiveChange(live);
  }, [live, onLiveChange]);

  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
    };
  }, []);

  async function takePhoto(): Promise<void> {
    const video = videoRef.current;
    if (!video || status !== "live" || busyRef.current) {
      return;
    }

    busyRef.current = true;
    setMessage(null);

    try {
      for (const step of COUNTDOWN_STEPS) {
        if (!mountedRef.current) {
          return;
        }
        setCount(step);
        playCountdown(step === COUNTDOWN_STEPS[COUNTDOWN_STEPS.length - 1]);
        await wait(COUNTDOWN_STEP_MS);
      }
      if (!mountedRef.current) {
        return;
      }
      setCount(null);
      setFlash(true);
      playShutter();
      await wait(160);
      const photo = await captureVideoFrame(video, live?.label ?? "Camera");
      if (!mountedRef.current) {
        return;
      }
      setFlash(false);
      onCaptured(photo);
    } catch (error) {
      console.error("[capture]", error instanceof Error ? error.message : error);
      if (mountedRef.current) {
        setMessage("The photo could not be captured. Please try again.");
        setCount(null);
        setFlash(false);
      }
    } finally {
      busyRef.current = false;
    }
  }

  async function useTestImage(file: File | undefined): Promise<void> {
    if (!file) {
      return;
    }
    try {
      const photo = await photoFromFile(file);
      onCaptured(photo);
    } catch (error) {
      console.error("[test-image]", error instanceof Error ? error.message : error);
      setMessage("Use a JPEG, PNG, or WebP image.");
    }
  }

  return (
    <main className="screen camera-screen">
      <header className="screen-header">
        <button type="button" className="button button-secondary header-button" onClick={onBack} disabled={count !== null}>
          Back
        </button>
        <div>
          <p className="eyebrow">{style?.displayName ?? "Camera"}</p>
          <h1>Step into frame</h1>
        </div>
      </header>

      <div className="camera-stage">
        <div className="video-shell">
          <video ref={videoRef} className="live-preview" autoPlay muted playsInline aria-label="Live camera preview" />
          {status === "live" && !issue ? <FramingGuide /> : null}
          {status !== "live" && !issue ? <p className="camera-waiting">Starting camera...</p> : null}
        </div>
        {issue ? (
          <div className="camera-message">
            <p>{cameraIssueMessage(issue)}</p>
            <button type="button" className="button button-primary" onClick={onRetryCamera}>
              Try Again
            </button>
          </div>
        ) : null}
      </div>

      <footer className="camera-footer">
        {message ? <p className="inline-error">{message}</p> : null}
        <button
          type="button"
          className="button button-primary take-photo"
          onClick={() => {
            void takePhoto();
          }}
          disabled={status !== "live" || count !== null}
        >
          Take Photo
        </button>
        {DEVELOPER_MODE ? (
          <>
            <button
              type="button"
              className="button button-secondary dev-action"
              onClick={() => fileInputRef.current?.click()}
              disabled={count !== null}
            >
              Use Test Image
            </button>
            <input
              ref={fileInputRef}
              className="hidden-input"
              type="file"
              accept="image/jpeg,image/png,image/webp"
              onChange={(event) => {
                const file = event.target.files?.[0];
                event.target.value = "";
                void useTestImage(file);
              }}
            />
          </>
        ) : null}
      </footer>

      {count ? (
        <div className="countdown" aria-live="assertive">
          {count}
        </div>
      ) : null}
      {flash ? <div className="flash" /> : null}
    </main>
  );
}

function wait(durationMs: number): Promise<void> {
  return new Promise((resolve) => {
    window.setTimeout(resolve, durationMs);
  });
}
