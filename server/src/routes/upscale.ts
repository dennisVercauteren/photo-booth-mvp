import { Router } from "express";
import multer from "multer";
import { config } from "../config.js";
import { enlargeImage } from "../images/enlargeImage.js";
import { validateImage } from "../images/validateImage.js";
import { saveGeneratedImage } from "../services/outputStore.js";

export function createUpscaleRouter(): Router {
  const router = Router();
  const upload = multer({
    storage: multer.memoryStorage(),
    limits: {
      fileSize: config.maxImageBytes,
      files: 1,
    },
  });

  router.post("/upscale", upload.single("image"), async (req, res, next) => {
    try {
      const image = validateImage(req.file);
      const enlarged = await enlargeImage(image.bytes, image.mimeType);
      if (enlarged.enlarged) {
        try {
          await saveGeneratedImage(enlarged.bytes, enlarged.mimeType);
        } catch (saveError) {
          const message = saveError instanceof Error ? saveError.message : "Output save failed.";
          console.error(`[output] ${message}`);
        }
      }

      res.setHeader("Cache-Control", "no-store");
      res.json({
        success: true,
        enlarged: enlarged.enlarged,
        imageBase64: enlarged.bytes.toString("base64"),
        mimeType: enlarged.mimeType,
      });
    } catch (error) {
      next(error);
    }
  });

  return router;
}
