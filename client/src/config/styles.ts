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
    shortDescription: "Sequins, feathers and all the sparkle.",
    enabled: true,
    thumbnail: "/examples/drag-queen.jpg",
    theme: { from: "#ff3d9a", to: "#ffc93c", ink: "#2a0a18" },
  },
  {
    id: "viking",
    displayName: "Viking Warrior",
    shortDescription: "Brave Norse heroes on a misty fjord.",
    enabled: true,
    thumbnail: "/examples/viking.jpg",
    theme: { from: "#2bb3ff", to: "#7cf2c5", ink: "#07141c" },
  },
  {
    id: "pirate",
    displayName: "Pirate Captain",
    shortDescription: "Ahoy! Set sail on your very own ship.",
    enabled: true,
    thumbnail: "/examples/pirate.jpg",
    theme: { from: "#ff8a1f", to: "#ffd23f", ink: "#071416" },
  },
  {
    id: "k-pop",
    displayName: "K-pop Star",
    shortDescription: "Lights, stage, superstar vibes.",
    enabled: true,
    thumbnail: "/examples/k-pop.jpg",
    theme: { from: "#a855f7", to: "#ff5fa2", ink: "#140818" },
  },
  {
    id: "royal",
    displayName: "Royal Portrait",
    shortDescription: "Kings, queens and castle life.",
    enabled: true,
    thumbnail: "/examples/royal.jpg",
    theme: { from: "#e85d04", to: "#ffb703", ink: "#1a0c12" },
  },
  {
    id: "gangster-1920",
    displayName: "1920s Gangster",
    shortDescription: "Sharp suits in a roaring-twenties club.",
    enabled: true,
    thumbnail: "/examples/gangster-1920.jpg",
    theme: { from: "#14b8a6", to: "#facc15", ink: "#120e0b" },
  },
  {
    id: "sumo",
    displayName: "Sumo Wrestler",
    shortDescription: "Step into the ring like a champ.",
    enabled: true,
    thumbnail: "/examples/sumo.jpg",
    theme: { from: "#ef4444", to: "#ffb86b", ink: "#1c0c0c" },
  },
  {
    id: "dark-fantasy",
    displayName: "Fantasy Warrior",
    shortDescription: "Armour up for an epic quest.",
    enabled: true,
    thumbnail: "/examples/dark-fantasy.jpg",
    theme: { from: "#6366f1", to: "#22d3ee", ink: "#0c0912" },
  },
  {
    id: "pop-band",
    displayName: "Pop Girl Band",
    shortDescription: "Glitter, platforms and a screaming crowd.",
    enabled: true,
    thumbnail: "/examples/pop-band.jpg",
    theme: { from: "#ff4fd8", to: "#ffd84f", ink: "#2a0626" },
  },
  {
    id: "cage-fighter",
    displayName: "Cage Fighter",
    shortDescription: "Fight night in the octagon.",
    enabled: true,
    thumbnail: "/examples/cage-fighter.jpg",
    theme: { from: "#ef233c", to: "#3a3a4a", ink: "#160608" },
  },
  {
    id: "football",
    displayName: "Football Star",
    shortDescription: "Win the final in a packed stadium.",
    enabled: true,
    thumbnail: "/examples/football.jpg",
    theme: { from: "#16a34a", to: "#a3e635", ink: "#06150b" },
  },
  {
    id: "clown",
    displayName: "Circus Clown",
    shortDescription: "Big shoes, red nose, big laughs.",
    enabled: true,
    thumbnail: "/examples/clown.jpg",
    theme: { from: "#ff5f1f", to: "#ffd23f", ink: "#1f0b04" },
  },
  {
    id: "christmas",
    displayName: "Christmas",
    shortDescription: "Cosy by the tree and the fireplace.",
    enabled: true,
    thumbnail: "/examples/christmas.jpg",
    theme: { from: "#dc2626", to: "#22c55e", ink: "#1a0606" },
  },
  {
    id: "halloween",
    displayName: "Halloween",
    shortDescription: "Spooky fun in the pumpkin patch.",
    enabled: true,
    thumbnail: "/examples/halloween.jpg",
    theme: { from: "#f97316", to: "#7c3aed", ink: "#160a1f" },
  },
  {
    id: "supercar",
    displayName: "Supercar",
    shortDescription: "Pose with an exotic sports car.",
    enabled: true,
    thumbnail: "/examples/supercar.jpg",
    theme: { from: "#0ea5e9", to: "#f43f5e", ink: "#06121a" },
  },
  {
    id: "astronaut",
    displayName: "Astronaut",
    shortDescription: "One small step... on the Moon!",
    enabled: true,
    thumbnail: "/examples/astronaut.jpg",
    theme: { from: "#64748b", to: "#38bdf8", ink: "#0b1220" },
  },
];

export function getEnabledStyles(): PhotoStyle[] {
  return PHOTO_STYLES.filter((style) => style.enabled);
}

/** Styles the guest sees: enabled, minus the ones staff hid in the settings menu. */
export function getVisibleStyles(hidden: readonly string[]): PhotoStyle[] {
  const visible = getEnabledStyles().filter((style) => !hidden.includes(style.id));
  return visible.length > 0 ? visible : getEnabledStyles();
}

export function getStyleById(id: string): PhotoStyle | undefined {
  return PHOTO_STYLES.find((style) => style.id === id);
}
