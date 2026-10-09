import express, { Router } from "express";
import fs from "node:fs";
import fsp from "node:fs/promises";
import path from "node:path";
import { galleryDir, paths } from "../config.js";

const PICTURE = /\.(jpe?g|png|webp)$/i;
const designSources = [
  path.join(paths.clientDist, "booth-designs"),
  path.join(paths.repoRoot, "client", "public", "booth-designs"),
];
// Use built assets after a production build, and source assets during development.
function designFolder(): string {
  const source = designSources[1];
  // In development pick the source folder so newly committed images show immediately,
  // even if an older dist/ folder exists from a previous build.
  if (process.env.NODE_ENV !== "production" && fs.existsSync(source)) return source;
  return designSources.find((folder) => fs.existsSync(folder)) ?? source;
}

async function galleryNames(folder: string): Promise<string[]> {
  const names = await fsp.readdir(folder).catch((error: unknown) => {
    if (typeof error === "object" && error !== null && "code" in error && error.code === "ENOENT") return [];
    throw error;
  });
  return names.filter((name) => PICTURE.test(name) && !name.startsWith("."))
    .sort((a, b) => a.localeCompare(b, undefined, { numeric: true }));
}

/** Separate gallery collections for on-site examples and GitHub-shipped physical designs. */
export function createGalleryRouter(): Router {
  const router = Router();
  router.get("/api/gallery", async (_req, res, next) => {
    try {
      const [photos, designs] = await Promise.all([
        galleryNames(galleryDir),
        galleryNames(designFolder()),
      ]);
      res.json({
        // Keep 'pictures' for existing API clients.
        pictures: photos.map((name) => `/api/gallery/photos/${encodeURIComponent(name)}`),
        boothDesigns: designs.map((name) => `/api/gallery/booth-designs/${encodeURIComponent(name)}`),
      });
    } catch (error) { next(error); }
  });

  // Using /api/... ensures images work in both Vite dev proxy and built kiosk server.
  router.use("/api/gallery/photos", express.static(galleryDir, { index: false, dotfiles: "ignore" }));
  router.use("/api/gallery/booth-designs", express.static(designFolder(), { index: false, dotfiles: "ignore" }));
  // Backwards compatibility for links from older kiosk releases.
  router.use("/gallery", express.static(galleryDir, { index: false, dotfiles: "ignore" }));
  return router;
}
