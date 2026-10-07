import { useEffect, useState } from "react";
import { saveSettings } from "../api/client";
import {
  connectWifi,
  fetchSpeakers,
  fetchWifi,
  setSpeakerVolume,
  speakerAction,
  type SpeakerDevice,
  type SpeakerStatus,
  type WifiNetwork,
  type WifiStatus,
} from "../api/device";
import { playTada } from "../audio/sound";
import type { BoothSettingsResponse } from "../types";
import { TouchKeyboard } from "./TouchKeyboard";

interface SettingsMenuProps {
  current: BoothSettingsResponse;
  onSaved: (next: BoothSettingsResponse) => void;
  onClose: () => void;
}

type Tab = "photos" | "speaker" | "wifi";

const TABS: { id: Tab; label: string }[] = [
  { id: "photos", label: "Photos" },
  { id: "speaker", label: "Speaker" },
  { id: "wifi", label: "Wi-Fi" },
];

/** Operator menu. Opened by holding the gear on the start screen. */
export function SettingsMenu({ current, onSaved, onClose }: SettingsMenuProps) {
  const [tab, setTab] = useState<Tab>("photos");

  return (
    <div className="settings-backdrop" role="dialog" aria-modal="true" aria-labelledby="settings-title">
      <section className="settings-card">
        <p className="eyebrow">Staff only</p>
        <h2 id="settings-title">Booth settings</h2>
        <div className="settings-tabs" role="tablist">
          {TABS.map((item) => (
            <button
              key={item.id}
              type="button"
              role="tab"
              aria-selected={tab === item.id}
              className={tab === item.id ? "settings-tab selected" : "settings-tab"}
              onClick={() => setTab(item.id)}
            >
              {item.label}
            </button>
          ))}
        </div>
        <div className="settings-panel">
          {tab === "photos" ? <PhotosPanel current={current} onSaved={onSaved} onClose={onClose} /> : null}
          {tab === "speaker" ? <SpeakerPanel /> : null}
          {tab === "wifi" ? <WifiPanel /> : null}
        </div>
        {tab !== "photos" ? (
          <button type="button" className="button button-secondary settings-close" onClick={onClose}>
            Close
          </button>
        ) : null}
      </section>
    </div>
  );
}

function PhotosPanel({ current, onSaved, onClose }: SettingsMenuProps) {
  const [imageCount, setImageCount] = useState(current.settings.imageCount);
  const [colorFix, setColorFix] = useState(current.settings.colorFix);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const counts = Array.from({ length: current.limits.maxImageCount }, (_, index) => index + 1);

  async function save(): Promise<void> {
    setSaving(true);
    setError(null);
    try {
      onSaved(await saveSettings({ imageCount, colorFix }));
      onClose();
    } catch (saveError) {
      setError(errorText(saveError, "Could not save settings."));
      setSaving(false);
    }
  }

  return (
    <>
      <div className="settings-field">
        <p className="settings-label">Pictures per photo</p>
        <p className="settings-hint">Each picture is one Gemini image, so fewer pictures cost less.</p>
        <div className="settings-options" role="radiogroup" aria-label="Pictures per photo">
          {counts.map((count) => (
            <button
              key={count}
              type="button"
              role="radio"
              aria-checked={count === imageCount}
              className={count === imageCount ? "settings-option selected" : "settings-option"}
              onClick={() => setImageCount(count)}
            >
              {count}
            </button>
          ))}
        </div>
      </div>
      <div className="settings-field">
        <p className="settings-label">Camera colour fix</p>
        <p className="settings-hint">For the NoIR camera: turns purple clothes back to blue. Switch off with a normal camera.</p>
        <div className="settings-options" role="radiogroup" aria-label="Camera colour fix">
          {[true, false].map((value) => (
            <button
              key={String(value)}
              type="button"
              role="radio"
              aria-checked={value === colorFix}
              className={value === colorFix ? "settings-option selected" : "settings-option"}
              onClick={() => setColorFix(value)}
            >
              {value ? "On" : "Off"}
            </button>
          ))}
        </div>
      </div>
      {error ? <p className="inline-error">{error}</p> : null}
      <div className="action-row two">
        <button type="button" className="button button-primary" onClick={() => void save()} disabled={saving}>
          {saving ? "Saving..." : "Save"}
        </button>
        <button type="button" className="button button-secondary" onClick={onClose} disabled={saving}>
          Cancel
        </button>
      </div>
    </>
  );
}

function SpeakerPanel() {
  const [status, setStatus] = useState<SpeakerStatus | null>(null);
  const [volume, setVolume] = useState<number | null>(null);
  const [busy, setBusy] = useState<string | null>("Loading...");
  const [error, setError] = useState<string | null>(null);

  async function run(label: string, work: () => Promise<SpeakerStatus>): Promise<void> {
    setBusy(label);
    setError(null);
    try {
      const next = await work();
      setStatus(next);
      setVolume(next.volume);
    } catch (runError) {
      setError(errorText(runError, "The speaker did not respond."));
    } finally {
      setBusy(null);
    }
  }

  useEffect(() => {
    void run("Loading...", () => fetchSpeakers());
  }, []);

  async function commitVolume(next: number): Promise<void> {
    setVolume(next);
    try {
      const result = await setSpeakerVolume(next);
      setVolume(result.volume);
      playTada();
    } catch (volumeError) {
      setError(errorText(volumeError, "Could not change the volume."));
    }
  }

  const devices = status?.devices ?? [];

  return (
    <>
      <div className="settings-field">
        <p className="settings-label">Volume {volume !== null ? `${volume}%` : ""}</p>
        <div className="settings-volume">
          <button type="button" className="settings-small" onClick={() => void commitVolume(Math.max(0, (volume ?? 50) - 10))} disabled={volume === null}>
            −
          </button>
          <input
            type="range"
            min={0}
            max={100}
            step={5}
            value={volume ?? 0}
            disabled={volume === null}
            aria-label="Volume"
            onChange={(event) => setVolume(Number(event.target.value))}
            onPointerUp={(event) => void commitVolume(Number(event.currentTarget.value))}
            onKeyUp={(event) => void commitVolume(Number(event.currentTarget.value))}
          />
          <button type="button" className="settings-small" onClick={() => void commitVolume(Math.min(100, (volume ?? 50) + 10))} disabled={volume === null}>
            +
          </button>
        </div>
        <button type="button" className="settings-link" onClick={() => playTada()}>
          Play test sound
        </button>
      </div>

      <div className="settings-field">
        <p className="settings-label">Bluetooth speaker</p>
        <p className="settings-hint">
          {busy === "Searching..." ? "Searching for 8 seconds. Put the speaker in pairing mode." : "Paired speakers reconnect by themselves when switched on."}
        </p>
        <ul className="settings-list">
          {devices.length === 0 && !busy ? <li className="settings-empty">No speakers yet. Tap Search.</li> : null}
          {devices.map((device) => (
            <SpeakerRow
              key={device.address}
              device={device}
              disabled={busy !== null}
              onAction={(action) => void run(action === "connect" ? "Connecting..." : "Working...", () => speakerAction(action, device.address))}
            />
          ))}
        </ul>
        <button type="button" className="button button-secondary settings-wide" disabled={busy !== null} onClick={() => void run("Searching...", () => fetchSpeakers(true))}>
          {busy ?? "Search for speakers"}
        </button>
      </div>
      {error ? <p className="inline-error">{error}</p> : null}
    </>
  );
}

function SpeakerRow({ device, disabled, onAction }: {
  device: SpeakerDevice;
  disabled: boolean;
  onAction: (action: "connect" | "disconnect" | "forget") => void;
}) {
  return (
    <li className={device.connected ? "settings-row active" : "settings-row"}>
      <span className="settings-row-name">
        {device.name}
        <small>{device.connected ? "Connected" : device.paired ? "Paired" : "New"}</small>
      </span>
      {device.connected ? (
        <button type="button" className="settings-small" disabled={disabled} onClick={() => onAction("disconnect")}>
          Disconnect
        </button>
      ) : (
        <button type="button" className="settings-small primary" disabled={disabled} onClick={() => onAction("connect")}>
          Connect
        </button>
      )}
      {device.paired ? (
        <button type="button" className="settings-small" disabled={disabled} onClick={() => onAction("forget")} aria-label={`Forget ${device.name}`}>
          ✕
        </button>
      ) : null}
    </li>
  );
}

function WifiPanel() {
  const [status, setStatus] = useState<WifiStatus | null>(null);
  const [busy, setBusy] = useState<string | null>("Loading...");
  const [error, setError] = useState<string | null>(null);
  const [chosen, setChosen] = useState<WifiNetwork | null>(null);
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  async function run(label: string, work: () => Promise<WifiStatus>): Promise<boolean> {
    setBusy(label);
    setError(null);
    try {
      setStatus(await work());
      return true;
    } catch (runError) {
      setError(errorText(runError, "Wi-Fi did not respond."));
      return false;
    } finally {
      setBusy(null);
    }
  }

  useEffect(() => {
    void run("Loading...", () => fetchWifi());
  }, []);

  async function join(network: WifiNetwork, secret: string): Promise<void> {
    if (await run(`Connecting to ${network.ssid}...`, () => connectWifi(network.ssid, secret))) {
      setChosen(null);
      setPassword("");
    }
  }

  if (chosen) {
    return (
      <>
        <div className="settings-field">
          <p className="settings-label">{chosen.ssid}</p>
          <p className="settings-hint">Type the password. Leave it empty if the booth joined this network before.</p>
          <div className="settings-password">
            <span className={password ? "" : "placeholder"}>{password ? (showPassword ? password : "•".repeat(password.length)) : "Password"}</span>
            <button type="button" className="settings-small" onClick={() => setShowPassword(!showPassword)}>
              {showPassword ? "Hide" : "Show"}
            </button>
          </div>
          <TouchKeyboard value={password} onChange={setPassword} />
        </div>
        {error ? <p className="inline-error">{error}</p> : null}
        <div className="action-row two">
          <button type="button" className="button button-primary" disabled={busy !== null} onClick={() => void join(chosen, password)}>
            {busy ? "Connecting..." : "Connect"}
          </button>
          <button type="button" className="button button-secondary" disabled={busy !== null} onClick={() => { setChosen(null); setPassword(""); setError(null); }}>
            Back
          </button>
        </div>
      </>
    );
  }

  return (
    <>
      <div className="settings-field">
        <p className="settings-label">Wi-Fi</p>
        <p className="settings-hint">
          {busy ?? (status?.connected ? `Connected to ${status.connected}${status.ipAddress ? ` (${status.ipAddress})` : ""}` : "Not connected")}
        </p>
        <ul className="settings-list">
          {(status?.networks ?? []).map((network) => (
            <li key={network.ssid} className={network.inUse ? "settings-row active" : "settings-row"}>
              <span className="settings-row-name">
                {network.ssid}
                <small>
                  {signalBars(network.signal)} {network.secure ? "🔒" : "open"} {network.inUse ? "· connected" : ""}
                </small>
              </span>
              {network.inUse ? null : (
                <button
                  type="button"
                  className="settings-small primary"
                  disabled={busy !== null}
                  onClick={() => (network.secure ? setChosen(network) : void join(network, ""))}
                >
                  Join
                </button>
              )}
            </li>
          ))}
        </ul>
        <button type="button" className="button button-secondary settings-wide" disabled={busy !== null} onClick={() => void run("Scanning...", () => fetchWifi(true))}>
          {busy ?? "Scan again"}
        </button>
      </div>
      {error ? <p className="inline-error">{error}</p> : null}
    </>
  );
}

function signalBars(signal: number): string {
  return signal >= 75 ? "▂▄▆█" : signal >= 50 ? "▂▄▆" : signal >= 25 ? "▂▄" : "▂";
}

function errorText(error: unknown, fallback: string): string {
  return error instanceof Error ? error.message : fallback;
}
