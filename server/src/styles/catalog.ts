import {
  ASTRONAUT_PROMPT,
  CAGE_FIGHTER_PROMPT,
  CHRISTMAS_PROMPT,
  CLOWN_PROMPT,
  DARK_FANTASY_PROMPT,
  DRAG_QUEEN_PROMPT,
  FOOTBALL_PROMPT,
  GANGSTER_PROMPT,
  HALLOWEEN_PROMPT,
  KPOP_PROMPT,
  PIRATE_PROMPT,
  POP_BAND_PROMPT,
  ROYAL_PROMPT,
  SUMO_PROMPT,
  SUPERCAR_PROMPT,
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
  {
    id: "pop-band",
    displayName: "Pop Girl Band",
    shortDescription: "A 90s pop group on a big tour night.",
    prompt: POP_BAND_PROMPT,
    enabled: true,
  },
  {
    id: "cage-fighter",
    displayName: "Cage Fighter",
    shortDescription: "A fight-night portrait in the octagon, no blood.",
    prompt: CAGE_FIGHTER_PROMPT,
    enabled: true,
  },
  {
    id: "football",
    displayName: "Football Star",
    shortDescription: "Winning the match in a full stadium.",
    prompt: FOOTBALL_PROMPT,
    enabled: true,
  },
  {
    id: "clown",
    displayName: "Circus Clown",
    shortDescription: "A friendly clown in the big top.",
    prompt: CLOWN_PROMPT,
    enabled: true,
  },
  {
    id: "christmas",
    displayName: "Christmas",
    shortDescription: "A cosy Christmas Eve by the fireplace.",
    prompt: CHRISTMAS_PROMPT,
    enabled: true,
  },
  {
    id: "halloween",
    displayName: "Halloween",
    shortDescription: "Playful vampires and witches in a pumpkin patch.",
    prompt: HALLOWEEN_PROMPT,
    enabled: true,
  },
  {
    id: "supercar",
    displayName: "Supercar",
    shortDescription: "Posing next to an exotic sports car.",
    prompt: SUPERCAR_PROMPT,
    enabled: true,
  },
  {
    id: "astronaut",
    displayName: "Astronaut",
    shortDescription: "A space mission on the Moon.",
    prompt: ASTRONAUT_PROMPT,
    enabled: true,
  },
];
