import cors from "cors";
import express from "express";
import fs from "node:fs";
import path from "node:path";
import { config, paths } from "./config.js";
import { errorMiddleware } from "./http/errorMiddleware.js";
import { createImageProvider } from "./providers/createProvider.js";
import { createGenerateRouter } from "./routes/generate.js";
import { createDeviceRouter } from "./routes/device.js";
import { createSettingsRouter } from "./routes/settings.js";
import { createUpscaleRouter } from "./routes/upscale.js";
import { styleService } from "./styles/styleService.js";

export function createApp() {
  const app = express();
  const provider = createImageProvider();

  app.disable("x-powered-by");
  app.use(cors({ origin: true }));
  app.use((req, res, next) => {
    res.setHeader("Cache-Control", "no-store");
    if (req.path.startsWith("/api")) {
      console.info(`[http] ${req.method} ${req.path}`);
    }
    next();
  });

  app.get("/api/health", (_req, res) => {
    res.json({ ok: true });
  });

  app.get("/api/meta", (_req, res) => {
    res.json({
      model: config.geminiModel,
      imageSize: config.imageSize,
      aspectRatio: config.aspectRatio,
    });
  });

  app.get("/api/styles", (_req, res) => {
    res.json({ styles: styleService.getStyles() });
  });

  app.use("/api", createGenerateRouter(provider));
  app.use("/api", createUpscaleRouter());
  app.use("/api", createSettingsRouter());
  app.use("/api", createDeviceRouter());

  app.use("/api", (_req, res) => {
    res.status(404).json({
      success: false,
      error: {
        code: "not_found",
        message: "Not found.",
      },
    });
  });

  // Serve the built booth UI so the kiosk needs only this one process.
  if (fs.existsSync(paths.clientDist)) {
    app.use(express.static(paths.clientDist));
    app.get("/{*path}", (_req, res) => {
      res.sendFile(path.join(paths.clientDist, "index.html"));
    });
  }

  app.use(errorMiddleware);
  return app;
}
