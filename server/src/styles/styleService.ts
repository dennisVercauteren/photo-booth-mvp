import {
  BASE_IDENTITY_PROMPT,
  DRAG_QUEEN_WOMAN_PROMPT,
  FACE_LOCK_PROMPT,
  GROUP_CONSISTENCY_PROMPT,
  OUTPUT_REQUIREMENTS,
} from "./prompts.js";
import { STYLE_CATALOG, type StyleDefinition } from "./catalog.js";

export interface PublicStyle {
  id: string;
  displayName: string;
  shortDescription: string;
  thumbnail?: string;
  enabled: boolean;
}

function toPublicStyle(style: StyleDefinition): PublicStyle {
  return {
    id: style.id,
    displayName: style.displayName,
    shortDescription: style.shortDescription,
    ...(style.thumbnail ? { thumbnail: style.thumbnail } : {}),
    enabled: style.enabled,
  };
}

export class StyleService {
  getStyles(): PublicStyle[] {
    return STYLE_CATALOG.filter((style) => style.enabled).map(toPublicStyle);
  }

  getStyleById(id: string): StyleDefinition | undefined {
    return STYLE_CATALOG.find((style) => style.id === id && style.enabled);
  }

  buildPrompt(style: StyleDefinition, variation: string): string {
    const parts = [
      BASE_IDENTITY_PROMPT,
      style.prompt,
      GROUP_CONSISTENCY_PROMPT,
      variation,
      OUTPUT_REQUIREMENTS,
      FACE_LOCK_PROMPT,
    ];
    if (style.id === "drag-queen") {
      parts.push(DRAG_QUEEN_WOMAN_PROMPT);
    }
    return parts.join("\n\n");
  }
}

export const styleService = new StyleService();
