import {
  DARK_FANTASY_PROMPT,
  DRAG_QUEEN_PROMPT,
  GANGSTER_PROMPT,
  KPOP_PROMPT,
  PIRATE_PROMPT,
  ROYAL_PROMPT,
  SUMO_PROMPT,
  VIKING_PROMPT,
} from "./prompts.js";

export interface StyleDefinition {
  id: string;
  displayName: string;
  shortDescription: string;
  prompt: string;
  thumbnail?: string;
  enabled: boolean;
}

export const STYLE_CATALOG: readonly StyleDefinition[] = [
  {
    id: "drag-queen",
    displayName: "Funny Drag Queen",
    shortDescription: "A woman on stage, with your face kept close to the photo.",
    prompt: DRAG_QUEEN_PROMPT,
    enabled: true,
  },
  {
    id: "viking",
    displayName: "Viking Warrior",
    shortDescription: "An epic Nordic warrior portrait on a cold coast.",
    prompt: VIKING_PROMPT,
    enabled: true,
  },
  {
    id: "pirate",
    displayName: "Pirate Captain",
    shortDescription: "A premium adventure-film pirate captain.",
    prompt: PIRATE_PROMPT,
    enabled: true,
  },
  {
    id: "k-pop",
    displayName: "K-pop Style",
    shortDescription: "A polished K-pop stage portrait that still looks like you.",
    prompt: KPOP_PROMPT,
    enabled: true,
  },
  {
    id: "royal",
    displayName: "Medieval Royal Portrait",
    shortDescription: "A dignified medieval royal portrait.",
    prompt: ROYAL_PROMPT,
    enabled: true,
  },
  {
    id: "gangster-1920",
    displayName: "1920s Gangster",
    shortDescription: "Elegant Prohibition-era style, without the caricature.",
    prompt: GANGSTER_PROMPT,
    enabled: true,
  },
  {
    id: "sumo",
    displayName: "Sumo Wrestler",
    shortDescription: "A ceremonial sumo portrait in the ring.",
    prompt: SUMO_PROMPT,
    enabled: true,
  },
  {
    id: "dark-fantasy",
    displayName: "Dark Fantasy Warrior",
    shortDescription: "A dark fantasy warrior who still looks like you.",
    prompt: DARK_FANTASY_PROMPT,
    enabled: true,
  },
];
