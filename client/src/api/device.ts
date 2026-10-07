import { API_BASE } from "../config/developer";

export interface WifiNetwork {
  ssid: string;
  signal: number;
  secure: boolean;
  inUse: boolean;
}

export interface WifiStatus {
  connected: string | null;
  ipAddress: string | null;
  networks: WifiNetwork[];
}

export interface SpeakerDevice {
  address: string;
  name: string;
  paired: boolean;
  connected: boolean;
}

export interface SpeakerStatus {
  devices: SpeakerDevice[];
  volume: number | null;
}

async function request<T>(path: string, body?: unknown): Promise<T> {
  const response = await fetch(`${API_BASE}/api/device/${path}`, body === undefined
    ? undefined
    : { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
  const payload: unknown = await response.json().catch(() => null);
  if (!response.ok) {
    const message = payload && typeof payload === "object" && "error" in payload && typeof payload.error === "string"
      ? payload.error
      : `Request failed (${response.status}).`;
    throw new Error(message);
  }
  return payload as T;
}

export function fetchWifi(rescan = false): Promise<WifiStatus> {
  return request(rescan ? "wifi?rescan=1" : "wifi");
}

export function connectWifi(ssid: string, password: string): Promise<WifiStatus> {
  return request("wifi/connect", { ssid, password });
}

export function fetchSpeakers(scan = false): Promise<SpeakerStatus> {
  return request(scan ? "speaker?scan=1" : "speaker");
}

export function speakerAction(action: "connect" | "disconnect" | "forget", address: string): Promise<SpeakerStatus> {
  return request(`speaker/${action}`, { address });
}

export function setSpeakerVolume(volume: number): Promise<{ volume: number | null }> {
  return request("speaker/volume", { volume });
}
