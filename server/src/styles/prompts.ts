export const BASE_IDENTITY_PROMPT = `You are editing a real photograph of real people.

Every person in the generated image must remain clearly recognizable as the same individual shown in the source photograph. This applies to a single person, a pair, a small group, or a larger group of up to ten or more people.

Preserve each person's facial identity with very high priority.

For every person, preserve facial structure, face shape, eyes, eyebrows, nose, lips, jawline, skin tone, apparent age, hairstyle, hair colour, facial hair and unique recognizable characteristics.

Do not substitute any face with another person.

Do not create a generic attractive face.

Do not significantly beautify, age, de-age or change the ethnicity of any person.

Maintain realistic human anatomy for every person.

Change clothing, accessories, environment and lighting. Leave the face, hair and body alone.

The result must look like a professional photograph of the original people genuinely present in the requested environment.

Photorealistic.
Natural skin texture.
Realistic facial detail.
Professional photographic lighting.
High detail.
No text.
No logos.
No watermarks.`;

export const GROUP_CONSISTENCY_PROMPT = `Count every person who is visible in the source photograph, including people at the edge and people who are partly cropped.

The result must contain exactly that same number of people, in the same left-to-right order. One person stays one person. Two stay two. Three stay three. A group of ten stays a group of ten.

Do not drop, merge, duplicate, swap, or replace anyone.
Do not add people who were not in the source photograph.
Do not turn a group into one hero and discard the others.
Do not give two people the same face.

Where the style instructions say "the person" or "the subject", apply them to every person.

Keep each person's identity stable and distinct from the others.
Apply the requested clothing, setting, and lighting to each person in a way that fits that person.

If a tight portrait would crop someone out, widen the framing so the whole group remains visible.`;

export const OUTPUT_REQUIREMENTS = `Return one final transformed photographic image of the same people who are in the source.

Do not generate a collage.

Do not create before-and-after layouts.

Do not add captions.

Do not add typography.

Do not add borders.

Do not add watermarks.

Do not add branding.

Keep every original person's face, hair and body shape clearly recognizable.

If several people are present, all of them stay in the frame together.

Compose the photograph for a 5 by 4 inch landscape print: five units wide and four units tall.
Fill that frame edge to edge.
Do not use a tall portrait crop.
Do not leave empty borders above or beside the group.`;

export const FACE_LOCK_PROMPT = `Identity lock. This overrides every costume instruction above.

Treat the source face as fixed. Edit the clothes and the place around it.

For every person, match the source exactly on face shape, eyes, eyebrows, nose, lips, jaw, ears, skin tone, apparent age, moles, wrinkles, facial hair, hairline, hair length and hair colour.

Do not add a wig.
Do not restyle the hair into a new cut.
Do not add a beauty filter, heavy contour, or makeup that redraws the eyes, brows, nose, lips or jaw.
Do not hide the face with a helmet, mask, veil, eyepatch, closed visor, or a shadow across the features.
A hat or crown is allowed only when the face and the person's own hair stay clearly visible.
Do not change body size, weight or proportions.

Someone who knows each person must recognize them immediately.
If a costume idea conflicts with the face, keep the face and simplify the costume.`;

export const DRAG_QUEEN_WOMAN_PROMPT = `Drag queen exception. For this style only, present every person as a woman in a gown. The face itself stays a close copy of the source.

She must read as a woman because of the dress, a feminine silhouette in the clothing, and light feminine makeup. Not because the face was replaced.

Match the source face closely: same eyes, eyebrows, nose, lips, jaw, ears, face shape, apparent age, skin tone and moles.
Makeup may add a soft colour. It must not contour a new face, change the lip shape, change the eye shape, or apply a beauty filter.
Keep their own hair. A wig is not allowed. Style the existing hair a little more neatly if needed, without a new haircut or a new hairline.
The jawline stays the same shape, even where facial hair is softened by makeup.

Someone who knows her must recognize her at once, as the same person in a dress.
Do not replace her with a generic model or a celebrity.
Do not sexualize the image.`;

export const DRAG_QUEEN_PROMPT = `Turn the portrait into a funny drag queen: the same person, now a woman on stage, with the face kept very close to the photo.

She wears a sequined gown or another feminine stage dress, with jewellery and feathers that leave the face visible.

The setting is a cabaret spotlight, with velvet curtains and warm footlights.
The mood is warm, camp and funny.

Photorealistic.
Detailed fabrics.
Cinematic stage light.
Do not mock the person.
Do not sexualize the costume.
Do not add text, show titles or logos.`;

export const VIKING_PROMPT = `Transform the person into a powerful Viking-era Nordic warrior.

Use historically inspired Viking clothing:
heavy woven wool,
leather elements,
fur used sparingly,
simple metal clasps,
layered Nordic clothing.

The costume should look functional, weathered and believable.

Do not add a helmet. Keep the person's own hair fully visible.

Place the subject in a dramatic Nordic environment:
rocky coast,
cold fjord,
mist,
wooden longhouse or distant Viking settlement,
subtle longship elements if appropriate.

Lighting should feel cold, cinematic and atmospheric.

Use soft overcast Nordic light combined with subtle dramatic rim lighting.

The person should appear strong and composed rather than aggressively caricatured.

Maintain realistic anatomy.

Preserve the person's actual face and identity extremely closely.

Do not make the subject look like a different actor.

Avoid excessive fantasy armour.

Avoid giant weapons dominating the image.

Photorealistic,
cinematic historical drama,
high texture detail,
realistic skin,
premium costume design.`;

export const PIRATE_PROMPT = `Transform the person into a charismatic 17th- or early-18th-century pirate captain.

Dress the subject in layered maritime clothing such as:
long weathered coat,
linen shirt,
leather belts,
waistcoat,
subtle period accessories.

A tricorn hat may be added only if the face and the person's own hair stay visible.

Avoid cartoon pirate costumes.

Do not add an eye patch.

Place the person aboard a realistic wooden sailing ship.

Background elements may include:
wooden deck,
rigging,
sails,
ocean,
dramatic clouds,
warm sunset or storm light.

The atmosphere should resemble a high-budget historical adventure film.

The subject should remain the visual focus.

Preserve the original person's face and identity extremely accurately.

Do not alter age, ethnicity or important facial features.

Natural cinematic portrait.
Detailed clothing textures.
Realistic weather.
Subtle sea atmosphere.
No text.
No logos.
No cartoon styling.`;

export const KPOP_PROMPT = `Transform the person into a polished K-pop style performer in a high-end music photograph.

Style the wardrobe as contemporary idol fashion: tailored stage clothes, layered stylish separates, refined accessories and a clean, expensive finish.

Keep their real hair and real face. Do not give them an idol haircut, a wig, or makeup that changes their features.

Place the subject in a premium music-video setting:
a clean colour-lit studio,
a glossy stage,
or a stylish city night with controlled neon.

Use crisp, flattering light with soft colour gels. Keep natural skin tones believable.

Do not copy a real celebrity.
Do not add microphones with logos, light sticks with branding, posters, or any text.
Do not turn the photograph into an illustration or a plastic doll.

Photorealistic.
Sharp facial detail.
Fashion-editorial finish.
Cinematic colour.
Real fabric and skin.`;

export const ROYAL_PROMPT = `Transform the person into a powerful medieval European royal or high-ranking noble.

Create luxurious historically inspired clothing using:
velvet,
embroidered fabrics,
rich wool,
subtle gold details,
high-quality period tailoring.

A small crown or circlet may sit above their own hair.

Do not replace the hair, and do not let headwear cover the face.

Set the portrait inside a grand medieval stone castle or royal hall.

Possible elements:
stone arches,
large windows,
candles,
tapestries,
dark carved furniture.

Use dramatic classical portrait lighting inspired by fine-art photography and old master paintings while maintaining photographic realism.

The person should look dignified and authoritative.

Preserve the person's exact facial identity and apparent age.

Do not turn the subject into an idealized fantasy character.

Do not create excessive fantasy armour.

Premium historical portrait photography.
Rich but realistic colour palette.
Fine fabric texture.
Subtle cinematic depth of field.`;

export const GANGSTER_PROMPT = `Transform the person into a sophisticated 1920s or early-1930s gangster-era character.

Use authentic period-inspired fashion such as:
tailored three-piece suit,
waistcoat,
period shirt,
tie,
long overcoat,
fedora only if the face stays evenly lit and their own hair remains visible.

The wardrobe must look expensive and realistic.

Place the person in a cinematic Prohibition-era environment such as:
elegant speakeasy,
vintage city street,
old luxury hotel,
dark wood bar interior.

Use warm tungsten lighting, subtle cigarette-smoke-like atmosphere without depicting active smoking, deep shadows and vintage cinematic mood.

Do not place firearms prominently in the image.

Do not create a parody gangster.

Preserve the person's actual facial identity with very high accuracy.

The result should resemble a high-budget historical crime drama publicity portrait.

Photorealistic.
Period-correct styling.
Elegant.
Moody.
Detailed fabric textures.
Natural skin.`;

export const SUMO_PROMPT = `Transform the person into a ceremonial sumo wrestler photographed in a traditional dohyo.

Dress the subject in authentic sumo attire: a mawashi, and a formal kesho-mawashi with an ornamental apron if it fits the portrait.

Keep their own hair and their own body shape. Do not add a topknot, and do not turn them into a different wrestler's physique.

Use a strong, grounded sumo stance on the clay ring. Salt, the tawara bales, wooden roof, and the warm interior of a sumo arena may appear in the background.

Keep the treatment respectful and specific.
Do not caricature the person.
Do not change their ethnicity or replace their face with a famous wrestler.
Do not add banners, calligraphy, or other text.

Photorealistic sports portrait.
Natural skin.
Believable fabric and clay.
Clear arena light.
The original person is still unmistakable.`;

export const DARK_FANTASY_PROMPT = `Transform the person into a dark medieval fantasy warrior.

Create premium fantasy clothing and armour inspired by realistic medieval materials.

Use:
aged steel,
dark leather,
layered cloth,
subtle engraved metal,
weathered materials.

Avoid oversized impossible armour.

Avoid enormous fantasy weapons.

Place the subject in a dark atmospheric medieval fantasy environment such as:
ancient castle ruins,
misty mountains,
dark forest,
stormy battlefield landscape.

Use cinematic dramatic lighting with soft fog and controlled contrast.

Keep the person's face fully visible.

Do not add masks, closed helmets, or face paint.

Do not transform the face into a monster, elf or supernatural creature.

Keep the person's own hair.

The original human identity must remain extremely recognizable.

The image should resemble a premium live-action fantasy television or film production.

Photorealistic.
Real materials.
Cinematic atmosphere.
Detailed face and skin.
No text or logos.`;
