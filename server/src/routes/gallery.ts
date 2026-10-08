import express, { Router } from "express";
import fs from "node:fs/promises";
import { galleryDir } from "../config.js";

const PICTURE = /\.(jpe?g|png|webp)$/i;

/** Sales demo pictures: drop JPG, PNG or WebP files in the gallery folder; they show in name order. */
export function createGalleryRouter(): Router {
  const router = Router();

  router.get("/api/gallery", async (_req, res, next) => {
    try {
      const names = await fs.readdir(galleryDir).catch((error: unknown) => {
        if (typeof error === "object" && error !== null && "code" in error && error.code === "ENOENT") {
          return [];
        }
        throw error;
      });
      const pictures = names
        .filter((name) => PICTURE.test(name) && !name.startsWith("."))
        .sort((a, b) => a.localeCompare(b, undefined, { numeric: true }))
        .map((name) => `/gallery/${encodeURIComponent(name)}`);
      res.json({ pictures });
    } catch (error) {
      next(error);
    }
  });

  router.use("/gallery", express.static(galleryDir, { index: false, dotfiles: "ignore" }));

  return router;
}
