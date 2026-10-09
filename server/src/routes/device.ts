import express, { Router, type Response } from "express";
import {
  connectSpeaker,
  connectWifi,
  disconnectSpeaker,
  forgetSpeaker,
  getSpeakerStatus,
  getWifiStatus,
  isBluetoothAddress,
  minimizeKiosk,
  setVolume,
} from "../services/deviceControl.js";

/** Staff-menu controls for the booth's Wi-Fi and Bluetooth speaker. */
export function createDeviceRouter(): Router {
  const router = Router();
  const json = express.json({ limit: "4kb" });

  router.get("/device/wifi", async (req, res) => {
    await respond(res, () => getWifiStatus(req.query.rescan === "1"));
  });

  router.post("/device/wifi/connect", json, async (req, res) => {
    const ssid: unknown = req.body?.ssid;
    const password: unknown = req.body?.password;
    if (typeof ssid !== "string" || ssid.length === 0 || ssid.length > 64) {
      res.status(400).json({ error: "Choose a network." });
      return;
    }
    if (password !== undefined && (typeof password !== "string" || password.length > 128)) {
      res.status(400).json({ error: "That password is not valid." });
      return;
    }
    // Never log the password.
    console.info(`[device] wifi connect ssid=${JSON.stringify(ssid)}`);
    await respond(res, async () => {
      await connectWifi(ssid, password || undefined);
      return getWifiStatus(false);
    });
  });

  router.get("/device/speaker", async (req, res) => {
    await respond(res, () => getSpeakerStatus(req.query.scan === "1" ? 8 : 0));
  });

  router.post("/device/speaker/:action", json, async (req, res) => {
    const address: unknown = req.body?.address;
    const action = req.params.action;
    if (action === "volume") {
      const volume: unknown = req.body?.volume;
      if (typeof volume !== "number" || !Number.isFinite(volume)) {
        res.status(400).json({ error: "Invalid volume." });
        return;
      }
      await respond(res, async () => ({ volume: await setVolume(volume) }));
      return;
    }
    if (!isBluetoothAddress(address)) {
      res.status(400).json({ error: "Choose a speaker." });
      return;
    }
    const handlers: Record<string, (value: string) => Promise<void>> = {
      connect: connectSpeaker,
      disconnect: disconnectSpeaker,
      forget: forgetSpeaker,
    };
    const handler = handlers[action];
    if (!handler) {
      res.status(404).json({ error: "Unknown speaker action." });
      return;
    }
    console.info(`[device] speaker ${action} ${address}`);
    await respond(res, async () => {
      await handler(address);
      return getSpeakerStatus();
    });
  });

  router.post("/device/minimize", async (_req, res) => {
    console.info("[device] minimize kiosk window");
    await respond(res, async () => {
      await minimizeKiosk();
      return { ok: true };
    });
  });

  return router;
}

async function respond(res: Response, work: () => Promise<unknown>): Promise<void> {
  try {
    res.json(await work());
  } catch (error) {
    const message = error instanceof Error ? error.message : "Something went wrong.";
    console.error("[device]", message);
    res.status(500).json({ error: message.length < 120 ? message : "Something went wrong." });
  }
}
