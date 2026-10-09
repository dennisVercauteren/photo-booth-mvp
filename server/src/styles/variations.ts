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
