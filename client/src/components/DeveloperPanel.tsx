import { useEffect, useState } from "react";
import type { CameraDeviceOption } from "../types";
import { formatDuration } from "../lib/format";

interface DeveloperPanelProps {
  sessionId: string;
  cameraLabel: string;
  resolution: string;
  model: string;
  styleName: string;
  durationMs: number | null;
  devices: CameraDeviceOption[];
  selectedDeviceId: string;
  onSelectCamera: (deviceId: string) => void;
}

export function DeveloperPanel({
  sessionId,
  cameraLabel,
  resolution,
  model,
  styleName,
  durationMs,
  devices,
  selectedDeviceId,
  onSelectCamera,
}: DeveloperPanelProps) {
  const [open, setOpen] = useState(false);
  const [fullscreen, setFullscreen] = useState(false);

  useEffect(() => {
    const sync = () => {
      setFullscreen(document.fullscreenElement !== null);
    };
    document.addEventListener("fullscreenchange", sync);
    return () => {
      document.removeEventListener("fullscreenchange", sync);
    };
  }, []);

  async function toggleFullscreen(): Promise<void> {
    try {
      if (document.fullscreenElement) {
        await document.exitFullscreen();
      } else {
        await document.documentElement.requestFullscreen();
      }
    } catch (error) {
      console.error("[fullscreen]", error instanceof Error ? error.message : error);
    }
  }

  return (
    <aside className={open ? "dev-panel open" : "dev-panel"}>
      <button type="button" className="dev-toggle" onClick={() => setOpen((value) => !value)}>
        {open ? "Close" : "Dev"}
      </button>
      {open ? (
        <div className="dev-card">
          <p><span>Camera</span>{cameraLabel}</p>
          <p><span>Camera resolution</span>{resolution}</p>
          <p><span>AI model</span>{model}</p>
          <p><span>Generation time</span>{durationMs === null ? "—" : formatDuration(durationMs)}</p>
          <p><span>Style</span>{styleName}</p>
          <p><span>Session ID</span>{sessionId}</p>
          {devices.length > 0 ? (
            <label className="dev-field">
              Camera device
              <select
                value={devices.some((device) => device.deviceId === selectedDeviceId) ? selectedDeviceId : devices[0]?.deviceId}
                onChange={(event) => onSelectCamera(event.target.value)}
              >
                {devices.map((device) => (
                  <option key={device.deviceId} value={device.deviceId}>
                    {device.label}
                  </option>
                ))}
              </select>
            </label>
          ) : null}
          <button type="button" className="dev-button" onClick={() => { void toggleFullscreen(); }}>
            {fullscreen ? "Exit Fullscreen" : "Enter Fullscreen"}
          </button>
        </div>
      ) : null}
    </aside>
  );
}
