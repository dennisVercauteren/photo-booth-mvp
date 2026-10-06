export interface PhotoStyle {
  id: string;
  displayName: string;
  shortDescription: string;
  thumbnail?: string;
  enabled: boolean;
  theme: {
    from: string;
    to: string;
    ink: string;
  };
}

/**
 * Public style cards. Full transformation prompts stay on the server.
 * Ids must match server/src/styles/catalog.ts.
 */
export const PHOTO_STYLES: readonly PhotoStyle[] = [
  {
    id: "drag-queen",
    displayName: "Funny Drag Queen",
    shortDescription: "A woman on stage, with your face kept close to the photo.",
    enabled: true,
    theme: { from: "#9d174d", to: "#f6c453", ink: "#2a0a18" },
  },
  {
    id: "viking",
    displayName: "Viking Warrior",
    shortDescription: "An epic Nordic warrior portrait on a cold coast.",
    enabled: true,
    theme: { from: "#1d3a4c", to: "#8eb4c9", ink: "#07141c" },
  },
  {
    id: "pirate",
    displayName: "Pirate Captain",
    shortDescription: "A premium adventure-film pirate captain.",
    enabled: true,
    theme: { from: "#12343a", to: "#d08a45", ink: "#071416" },
  },
  {
    id: "k-pop",
    displayName: "K-pop Style",
    shortDescription: "A polished K-pop stage portrait that still looks like you.",
    enabled: true,
    theme: { from: "#312e81", to: "#fb7185", ink: "#140818" },
  },
  {
    id: "royal",
    displayName: "Medieval Royal Portrait",
    shortDescription: "A dignified medieval royal portrait.",
    enabled: true,
    theme: { from: "#4a1d32", to: "#d4b36a", ink: "#1a0c12" },
  },
  {
    id: "gangster-1920",
    displayName: "1920s Gangster",
    shortDescription: "Elegant Prohibition-era style, without the caricature.",
    enabled: true,
    theme: { from: "#2c241c", to: "#c47a4a", ink: "#120e0b" },
  },
  {
    id: "sumo",
    displayName: "Sumo Wrestler",
    shortDescription: "A ceremonial sumo portrait in the ring.",
    enabled: true,
    theme: { from: "#7f1d1d", to: "#f3e6c8", ink: "#1c0c0c" },
  },
  {
    id: "dark-fantasy",
    displayName: "Dark Fantasy Warrior",
    shortDescription: "A dark fantasy warrior who still looks like you.",
    enabled: true,
    theme: { from: "#1a1424", to: "#7d5ea7", ink: "#0c0912" },
  },
];

export function getEnabledStyles(): PhotoStyle[] {
  return PHOTO_STYLES.filter((style) => style.enabled);
}

export function getStyleById(id: string): PhotoStyle | undefined {
  return PHOTO_STYLES.find((style) => style.id === id);
}
