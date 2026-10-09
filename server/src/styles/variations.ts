/** Three visually distinct treatments. All keep the source people recognizable and in the same order.
 * The server can request 1-3 pictures; variation order starts with the most conservative.
 */
export const PORTRAIT_VARIATIONS = [
  `Choice 1 of 3 — CINEMATIC.
A spectacular, believable big-budget movie still. Keep the style's character, wardrobe and setting.
Use cinematic depth, dramatic practical lighting, dynamic framing and rich atmosphere.
Make the person look genuinely present in the scene, not pasted onto a backdrop.
Maintain the source people's faces, age, hair, body proportions and count exactly.`,
  `Choice 2 of 3 — EDITORIAL.
Create a bold, high-fashion editorial photograph from the same style concept.
Use a striking angle, deliberate colour contrast, art-directed lighting, expressive but natural poses,
and an unusually memorable composition. More visual attitude than the cinematic version.
Keep the subjects photorealistic, recognizable and anatomically accurate.
Maintain the source people's faces, age, hair, body proportions and count exactly.`,
  `Choice 3 of 3 — WILD CARD.
Make an adventurous, playful, visually surprising interpretation of the selected style.
Think surreal production design: an exaggerated but coherent environment, impossible scale,
a surprising visual gag, theatrical light, or unusually exuberant costume detail.
The surroundings can be fantastical; the actual people must still be photographic, human,
and unmistakably the people in the source. Keep the tone celebratory, never humiliating.
No extra people, no missing people and no face swapping.
Maintain the source people's faces, age, hair, body proportions and count exactly.`,
] as const;

/**
 * Specific visual storyboards make the Wild Card meaningfully different from the
 * first two photographs. Keep recognizability, body proportions, and group count.
 * The style's traditional setting can be reimagined for choice 3.
 */
const WILD_CARD_SCENES: Record<string, string> = {
  "drag-queen": "An enormous glittering floating cabaret stage above a city, monumental feathers and mirrored disco architecture, full-body star entrance.",
  viking: "A surreal Nordic fjord made of giant crystalline waves and floating runestones; heroic voyage with an enormous longship behind the subject.",
  pirate: "A grand pirate ship sailing across a sea of golden clouds with oversized glowing treasure islands in the distance; daring adventure, joyful surprise.",
  "k-pop": "A gravity-defying K-pop concert in a futuristic kaleidoscope arena, with floating luminous platforms and playful holographic stage scenery.",
  royal: "A regal throne room suspended in the clouds, with enormous floating castle staircases and spectacular sculptural architecture; majestic and surreal.",
  "gangster-1920": "An Art Deco metropolis where the streets bend upward like a dream; sharply dressed subjects step off a luminous vintage train.",
  sumo: "A giant ceremonial sumo ring floating above a sea of clouds with epic paper lanterns and cheering paper mascots, dignified and playful.",
  "dark-fantasy": "A mythical landscape with floating mountains, luminous dragon-scale architecture and impossibly huge moonlight; cinematic wonder, not horror.",
  "pop-band": "An extravagantly colourful stadium shaped like a giant record player, with enormous glitter balloons and ecstatic light sculptures.",
  "cage-fighter": "A heroic fighter entrance in an absurdly huge illuminated sci-fi arena, with holographic energy arcs and theatrical scale; no violence.",
  football: "A fantastical football stadium orbiting a planet, with larger-than-life goalposts and celebratory confetti galaxies; no visible text.",
  clown: "A friendly surreal circus where enormous bubbles carry tents through a candy-coloured sky; joyful theatrical portrait.",
  christmas: "A cozy magical Christmas village inside a giant transparent snow globe floating above a winter forest, with sparkling snowfall.",
  halloween: "A whimsical haunted mansion on floating islands with oversized playful pumpkins and purple lightning, funny rather than frightening.",
  supercar: "The subject stands beside a spectacular concept supercar on a floating highway over a neon city, dramatic impossible perspective.",
  astronaut: "An astronaut in a surreal cosmic garden of giant glowing planets, colourful nebula flowers and floating orbital walkways.",
};

export function variationForStyle(styleId: string, index: number): string {
  const variation = PORTRAIT_VARIATIONS[index] ?? PORTRAIT_VARIATIONS[0];
  if (index !== 2) return variation;
  const scene = WILD_CARD_SCENES[styleId] ?? "A celebratory, impossible world with a striking visual twist.";
  return [
    variation,
    "WILD CARD ART DIRECTION: For this third variation, reinterpret the original setting freely, even if the base style specifies a historically accurate or strictly realistic backdrop.",
    "Make a deliberately unique scene: " + scene,
    "Prioritize originality and coherent composition over formal studio photography. Make it clearly different from the cinematic and editorial outputs.",
    "Do not obscure or stylize the person's actual face. Keep every person from the source in left-to-right order, recognizable and in frame.",
  ].join("\n\n");
}
