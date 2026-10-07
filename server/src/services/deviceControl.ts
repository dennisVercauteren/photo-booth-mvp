import { execFile } from "node:child_process";
import { promisify } from "node:util";

const run = promisify(execFile);

// The service runs as the desktop user, so wpctl can reach that user's PipeWire.
const USER_ENV = { ...process.env, XDG_RUNTIME_DIR: process.env.XDG_RUNTIME_DIR ?? `/run/user/${process.getuid?.() ?? 1000}` };

async function cmd(file: string, args: string[], timeoutMs = 20_000): Promise<string> {
  const { stdout } = await run(file, args, { timeout: timeoutMs, env: USER_ENV, maxBuffer: 1024 * 1024 });
  return stdout;
}

/** Split one line of `nmcli -t` output, which escapes ':' and '\' with a backslash. */
function splitTerse(line: string): string[] {
  const fields: string[] = [];
  let current = "";
  for (let index = 0; index < line.length; index += 1) {
    const char = line[index];
    if (char === "\\" && index + 1 < line.length) {
      current += line[index + 1];
      index += 1;
    } else if (char === ":") {
      fields.push(current);
      current = "";
    } else {
      current += char;
    }
  }
  fields.push(current);
  return fields;
}

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

export async function getWifiStatus(rescan: boolean): Promise<WifiStatus> {
  const listing = await cmd("nmcli", [
    "-t", "-f", "IN-USE,SSID,SIGNAL,SECURITY", "dev", "wifi", "list", "--rescan", rescan ? "yes" : "auto",
  ], 30_000);

  const bySsid = new Map<string, WifiNetwork>();
  for (const line of listing.split("\n")) {
    const [inUse, ssid, signal, security] = splitTerse(line);
    if (!ssid) {
      continue;
    }
    const network = { ssid, signal: Number(signal) || 0, secure: Boolean(security && security !== "--"), inUse: inUse === "*" };
    const existing = bySsid.get(ssid);
    // Mesh and dual-band networks list one SSID several times; keep the strongest.
    if (!existing || network.inUse || (!existing.inUse && network.signal > existing.signal)) {
      bySsid.set(ssid, network);
    }
  }
  const networks = [...bySsid.values()].sort((a, b) => Number(b.inUse) - Number(a.inUse) || b.signal - a.signal);

  let ipAddress: string | null = null;
  try {
    const address = await cmd("nmcli", ["-g", "IP4.ADDRESS", "dev", "show", "wlan0"]);
    ipAddress = address.split("\n")[0]?.split("/")[0] || null;
  } catch {
    ipAddress = null;
  }

  return { connected: networks.find((network) => network.inUse)?.ssid ?? null, ipAddress, networks };
}

export async function connectWifi(ssid: string, password: string | undefined): Promise<void> {
  // A saved profile with this name already holds the password, so try that first.
  if (!password) {
    try {
      await cmd("nmcli", ["connection", "up", "id", ssid], 45_000);
      return;
    } catch {
      // Fall through to a fresh connect (works for open networks).
    }
  }
  const args = ["dev", "wifi", "connect", ssid];
  if (password) {
    args.push("password", password);
  }
  try {
    await cmd("nmcli", args, 45_000);
  } catch (error) {
    throw new Error(wifiErrorMessage(error));
  }
}

function wifiErrorMessage(error: unknown): string {
  const text = error && typeof error === "object" && "stderr" in error ? String(error.stderr) : "";
  if (/secrets were required|password|802-11-wireless-security/i.test(text)) {
    return "Wrong password, or this network needs one.";
  }
  if (/no network with ssid/i.test(text)) {
    return "That network is out of range.";
  }
  if (/not authorized|insufficient privileges/i.test(text)) {
    return "The booth is not allowed to change Wi-Fi (permission rule missing).";
  }
  return "Could not connect to that network.";
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

const MAC = /^([0-9A-F]{2}:){5}[0-9A-F]{2}$/i;

export function isBluetoothAddress(value: unknown): value is string {
  return typeof value === "string" && MAC.test(value);
}

async function listBluetoothDevices(): Promise<{ address: string; name: string }[]> {
  const output = await cmd("bluetoothctl", ["devices"]);
  return output.split("\n").flatMap((line) => {
    const match = /^Device (\S+) (.*)$/.exec(line.trim());
    return match && MAC.test(match[1]) ? [{ address: match[1], name: match[2] }] : [];
  });
}

/** Audio devices only, so keyboards and mice never show up in the speaker list. */
async function describeAudioDevice(address: string, fallbackName: string): Promise<SpeakerDevice | null> {
  const info = await cmd("bluetoothctl", ["info", address]);
  const isAudio = /Icon: audio-|UUID: Audio Sink|UUID: Advanced Audio/i.test(info);
  if (!isAudio) {
    return null;
  }
  const name = /\n\s*Name: (.+)/.exec(info)?.[1]?.trim() || fallbackName;
  return {
    address,
    name,
    paired: /Paired: yes/.test(info),
    connected: /Connected: yes/.test(info),
  };
}

export async function getSpeakerStatus(scanSeconds = 0): Promise<SpeakerStatus> {
  if (scanSeconds > 0) {
    try {
      await cmd("bluetoothctl", ["--timeout", String(scanSeconds), "scan", "on"], (scanSeconds + 10) * 1000);
    } catch {
      // bluetoothctl exits non-zero when the timeout ends the scan; the results are still cached.
    }
  }
  const known = await listBluetoothDevices();
  const described = await Promise.all(known.map((device) => describeAudioDevice(device.address, device.name).catch(() => null)));
  const devices = described
    .filter((device): device is SpeakerDevice => device !== null)
    .sort((a, b) => Number(b.connected) - Number(a.connected) || Number(b.paired) - Number(a.paired) || a.name.localeCompare(b.name));
  return { devices, volume: await getVolume() };
}

export async function connectSpeaker(address: string): Promise<void> {
  const before = await cmd("bluetoothctl", ["info", address]).catch(() => "");
  if (!/Paired: yes/.test(before)) {
    await cmd("bluetoothctl", ["--timeout", "20", "pair", address], 30_000).catch(() => undefined);
  }
  // Trusted devices reconnect by themselves after a reboot or when switched back on.
  await cmd("bluetoothctl", ["trust", address]).catch(() => undefined);
  await cmd("bluetoothctl", ["--timeout", "15", "connect", address], 25_000).catch(() => undefined);

  const after = await cmd("bluetoothctl", ["info", address]);
  if (!/Connected: yes/.test(after)) {
    throw new Error("Could not connect. Is the speaker on and in pairing mode?");
  }
  // Give PipeWire a moment to add the speaker, then make it the default output.
  await new Promise((resolve) => setTimeout(resolve, 2000));
  await makeSpeakerDefault(address).catch(() => undefined);
}

export async function disconnectSpeaker(address: string): Promise<void> {
  await cmd("bluetoothctl", ["disconnect", address]);
}

export async function forgetSpeaker(address: string): Promise<void> {
  await cmd("bluetoothctl", ["remove", address]);
}

async function makeSpeakerDefault(address: string): Promise<void> {
  const prefix = `bluez_output.${address.replace(/:/g, "_")}`;
  const nodes: unknown = JSON.parse(await cmd("pw-dump", []));
  if (!Array.isArray(nodes)) {
    return;
  }
  for (const node of nodes) {
    const name: unknown = node?.info?.props?.["node.name"];
    if (typeof name === "string" && name.startsWith(prefix) && typeof node.id === "number") {
      await cmd("wpctl", ["set-default", String(node.id)]);
      return;
    }
  }
}

async function getVolume(): Promise<number | null> {
  try {
    const output = await cmd("wpctl", ["get-volume", "@DEFAULT_AUDIO_SINK@"]);
    const match = /Volume: ([\d.]+)/.exec(output);
    return match ? Math.round(Number(match[1]) * 100) : null;
  } catch {
    return null;
  }
}

export async function setVolume(percent: number): Promise<number | null> {
  const clamped = Math.max(0, Math.min(100, Math.round(percent)));
  await cmd("wpctl", ["set-volume", "@DEFAULT_AUDIO_SINK@", `${clamped}%`]);
  return getVolume();
}
