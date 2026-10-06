import fs from "node:fs/promises";
import path from "node:path";
import { paths } from "../config.js";

export interface GenerationLogEntry {
  timestamp: string;
  style: string;
  model: string;
  durationMs: number;
  success: boolean;
  sourceWidth?: number;
  sourceHeight?: number;
  sessionId?: string;
  errorCode?: string;
  variant?: number;
}

const logPath = path.join(paths.logs, "generations.jsonl");

let writeChain: Promise<void> = Promise.resolve();

export function logGeneration(entry: GenerationLogEntry): Promise<void> {
  writeChain = writeChain.then(() => appendEntry(entry)).catch((error: unknown) => {
    const message = error instanceof Error ? error.message : "Unknown log failure.";
    console.error(`[generate-log] ${message}`);
  });
  return writeChain;
}

async function appendEntry(entry: GenerationLogEntry): Promise<void> {
  await fs.mkdir(paths.logs, { recursive: true });
  await fs.appendFile(logPath, `${JSON.stringify(entry)}\n`, "utf8");
  const resolution =
    entry.sourceWidth && entry.sourceHeight ? `${entry.sourceWidth}x${entry.sourceHeight}` : "unknown";
  console.info(
    `[generate] style=${entry.style} variant=${entry.variant ?? "-"} model=${entry.model} durationMs=${entry.durationMs} success=${entry.success} source=${resolution}`,
  );
}
