import type { NextFunction, Request, Response } from "express";
import multer from "multer";
import { AppError, ErrorCode } from "../errors.js";

export function errorMiddleware(error: unknown, _req: Request, res: Response, _next: NextFunction): void {
  if (res.headersSent) {
    return;
  }

  if (error instanceof multer.MulterError) {
    const code = error.code === "LIMIT_FILE_SIZE" ? ErrorCode.ImageTooLarge : ErrorCode.Validation;
    const status = code === ErrorCode.ImageTooLarge ? 413 : 400;
    const appError = new AppError(status, code, error.message);
    console.error(`[api] ${appError.code}: ${appError.detail}`);
    res.status(appError.status).json({
      success: false,
      error: { code: appError.code, message: appError.publicMessage },
    });
    return;
  }

  if (error instanceof AppError) {
    console.error(`[api] ${error.code}: ${error.detail}`);
    res.status(error.status).json({
      success: false,
      error: { code: error.code, message: error.publicMessage },
    });
    return;
  }

  const detail = error instanceof Error ? error.message : "Unexpected server error.";
  console.error(`[api] ${ErrorCode.Internal}: ${detail}`);
  const fallback = new AppError(500, ErrorCode.Internal, detail);
  res.status(fallback.status).json({
    success: false,
    error: { code: fallback.code, message: fallback.publicMessage },
  });
}
