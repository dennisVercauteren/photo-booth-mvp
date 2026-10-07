import express, { Router } from "express";
import { AppError, ErrorCode } from "../errors.js";
import { getSettings, MAX_IMAGE_COUNT, updateSettings } from "../services/settingsStore.js";

export function createSettingsRouter(): Router {
  const router = Router();

  router.get("/settings", async (_req, res, next) => {
    try {
      res.json({ settings: await getSettings(), limits: { maxImageCount: MAX_IMAGE_COUNT } });
    } catch (error) {
      next(error);
    }
  });

  router.put("/settings", express.json({ limit: "4kb" }), async (req, res, next) => {
    let settings;
    try {
      settings = await updateSettings(req.body);
    } catch (error) {
      next(new AppError(400, ErrorCode.Validation, error instanceof Error ? error.message : "Invalid settings."));
      return;
    }
    console.info(`[settings] imageCount=${settings.imageCount} colorFix=${settings.colorFix}`);
    res.json({ settings, limits: { maxImageCount: MAX_IMAGE_COUNT } });
  });

  return router;
}
