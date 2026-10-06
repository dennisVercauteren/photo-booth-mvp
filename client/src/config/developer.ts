export const DEVELOPER_MODE = import.meta.env.VITE_DEVELOPER_MODE === "true";

export const API_BASE = (import.meta.env.VITE_API_BASE ?? "").replace(/\/$/, "");

export const CAMERA_STORAGE_KEY = "photobooth.cameraDeviceId";

export const JPEG_QUALITY = 0.93;

export const COUNTDOWN_STEPS = ["3", "2", "1"] as const;

export const COUNTDOWN_STEP_MS = 900;

export const CLIENT_GENERATE_TIMEOUT_MS = 130_000;

export const PORTRAIT_CHOICE_COUNT = 3;
