import fs from "node:fs/promises";
import path from "node:path";
import { paths } from "../config.js";
import { STYLE_CATALOG } from "../styles/catalog.js";
import { PORTRAIT_VARIATIONS } from "../styles/variations.js";

export const VISUAL_THEMES = ["carnival", "neon", "elegant"] as const;
export const SOUND_THEMES = ["carnival", "arcade", "lounge"] as const;
export type VisualTheme = (typeof VISUAL_THEMES)[number];
export type SoundTheme = (typeof SOUND_THEMES)[number];

/** Booth settings an operator can change from the in-app menu. Stored outside the release folder. */
export interface BoothSettings {
  imageCount: number;
  /** Colour correction for the NoIR (no infrared filter) camera, applied in the browser. */
  colorFix: boolean;
  /** Style ids left off the guest's style screen. New styles show up until someone hides them. */
  hiddenStyles: string[];
  visualTheme: VisualTheme;
  soundTheme: SoundTheme;
}

export const MAX_IMAGE_COUNT = PORTRAIT_VARIATIONS.length;

const DEFAULT_SETTINGS: BoothSettings = {
  imageCount: MAX_IMAGE_COUNT,
  colorFix: true,
  hiddenStyles: [],
  visualTheme: "carnival",
  soundTheme: "carnival",
};

let cached: BoothSettings | null = null;

export async function getSettings(): Promise<BoothSettings> {
  if (cached) {
    return cached;
  }
  try {
    const raw: unknown = JSON.parse(await fs.readFile(paths.settingsFile, "utf8"));
    cached = { ...DEFAULT_SETTINGS, ...parseSettings(raw) };
  } catch (error) {
    if (!isMissingFile(error)) {
      console.error(`[settings] ${error instanceof Error ? error.message : "Could not read settings."} Using defaults.`);
    }
    cached = { ...DEFAULT_SETTINGS };
  }
  return cached;
}

export async function updateSettings(input: unknown): Promise<BoothSettings> {
  const next = { ...(await getSettings()), ...parseSettings(input) };
  await fs.mkdir(path.dirname(paths.settingsFile), { recursive: true });
  const temp = `${paths.settingsFile}.tmp`;
  await fs.writeFile(temp, `${JSON.stringify(next, null, 2)}\n`);
  await fs.rename(temp, paths.settingsFile);
  cached = next;
  return next;
}

/** Keeps only valid fields. Throws on a field that is present but invalid. */
function parseSettings(input: unknown): Partial<BoothSettings> {
  if (typeof input !== "object" || input === null) {
    throw new Error("Settings must be an object.");
  }
  const result: Partial<BoothSettings> = {};
  if ("imageCount" in input) {
    const count = input.imageCount;
    if (typeof count !== "number" || !Number.isInteger(count) || count < 1 || count > MAX_IMAGE_COUNT) {
      throw new Error(`imageCount must be a whole number from 1 to ${MAX_IMAGE_COUNT}.`);
    }
    result.imageCount = count;
  }
  if ("colorFix" in input) {
    if (typeof input.colorFix !== "boolean") {
      throw new Error("colorFix must be true or false.");
    }
    result.colorFix = input.colorFix;
  }
  if ("hiddenStyles" in input) {
    const hidden = input.hiddenStyles;
    const known = new Set(STYLE_CATALOG.map((style) => style.id));
    if (!Array.isArray(hidden) || !hidden.every((id): id is string => typeof id === "string" && known.has(id))) {
      throw new Error("hiddenStyles must be a list of known style ids.");
    }
    const unique = [...new Set(hidden)];
    if (unique.length >= known.size) {
      throw new Error("At least one style must stay visible.");
    }
    result.hiddenStyles = unique;
  }
  if ("visualTheme" in input) {
    result.visualTheme = readChoice(input.visualTheme, VISUAL_THEMES, "visualTheme");
  }
  if ("soundTheme" in input) {
    result.soundTheme = readChoice(input.soundTheme, SOUND_THEMES, "soundTheme");
  }
  return result;
}

function readChoice<T extends string>(value: unknown, allowed: readonly T[], name: string): T {
  const match = allowed.find((option) => option === value);
  if (!match) {
    throw new Error(`${name} must be one of: ${allowed.join(", ")}.`);
  }
  return match;
}

function isMissingFile(error: unknown): boolean {
  return typeof error === "object" && error !== null && "code" in error && error.code === "ENOENT";
}
