export const BASE_IDENTITY_PROMPT = `You are editing a real photograph of real people.

Every person in the generated image must remain clearly recognizable as the same individual shown in the source photograph. This applies to a single person, a pair, a small group, or a larger group of up to ten or more people.

Preserve each person's facial identity with very high priority.

For every person, preserve facial structure, face shape, eyes, eyebrows, nose, lips, jawline, skin tone, apparent age, hairstyle, hair colour, facial hair and unique recognizable characteristics.

Do not substitute any face with another person.

Do not create a generic attractive face.

Do not significantly beautify, age, de-age or change the ethnicity of any person.

Maintain realistic human anatomy for every person.

Change clothing, accessories, environment and lighting. Leave the face, hair and body alone.

The people must look like the original people genuinely present in the requested environment, even when the setting is fantastical or editorial.

Photorealistic people and natural skin texture.
Realistic facial detail and believable anatomy.
High-quality art direction and lighting.
The variation prompt decides whether the surroundings are cinematic, editorial, or surreal.
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

export const OUTPUT_REQUIREMENTS = `Return one final transformed image of the same people who are in the source.

Do not generate a collage.

Do not create before-and-after layouts.

Do not add captions.

Do not add typography.

Do not add borders.

Do not add watermarks.

Do not add branding.

Keep every original person's face, hair and body shape clearly recognizable.

If several people are present, all of them stay in the frame together.

Compose the photograph for the requested print shape, filling that frame edge to edge.
Keep every person fully in the frame.
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

export const POP_BAND_PROMPT = `Turn the people into the members of a 1990s pop girl group on a big tour night.

Replace everyone's everyday clothes completely with bold, coordinated late-1990s girl-group stage costumes: sparkly sequin or glitter tops, metallic or vinyl trousers and skirts, bright satin, faux-fur trims, platform trainers or platform boots, chunky silver jewellery.
Do not keep plain t-shirts, jeans or everyday clothes. Everyone must look dressed up for a huge pop concert.
Each person gets their own look so the group reads as a band of different characters, with one shared colour scheme.

Present everyone as a member of the band through the clothes and the pose. Do not change anyone's face, gender or body to fit the theme.

Place them on a concert stage with coloured spotlights, haze, light beams and a cheering crowd softly blurred in the background.

The mood is joyful, loud and full of energy.

Do not copy a real band or a real celebrity.
Do not add band names, posters, microphones with logos, or any text.
Do not sexualize the costumes.

Photorealistic concert photograph.
Vivid stage colour.
Natural skin.
Real fabrics.`;

export const CAGE_FIGHTER_PROMPT = `Turn the people into professional mixed martial arts fighters at a big event, posing in the octagon before the fight.

Dress them in clean fight gear: fight shorts or a rash guard in strong colours, open-finger fight gloves, hand wraps. A championship belt over the shoulder may be added for one person.
The belt is plain gold and leather with an abstract engraved pattern: no letters, no words, no initials and no logo on it.
Keep their own body shape. Do not add muscles, tattoos or a different physique.

Place them inside the cage: black chain-link fence, the canvas floor, bright overhead arena lights and a dark crowd behind.

The pose is a confident, friendly stare-down or a raised fist, as on a fight poster.

Keep it sporty and fun.
No blood, bruises, cuts or injuries.
No real promotion names, sponsor logos or text on the canvas, clothes or belt.

Photorealistic sports photograph.
Hard arena light.
Sharp detail.
Natural skin.`;

export const FOOTBALL_PROMPT = `Turn the people into professional football (soccer) players in a full stadium.

Dress everyone in a modern football kit: a short-sleeved jersey in bold colours, shorts, socks and boots. Everyone in the photo wears the same team kit.
Use an invented team look. No real club crest, no sponsor, no brand logo, no player name or number that belongs to a real player.

Place them on the pitch of a big stadium under floodlights, with the stands full of a blurred crowd, a little confetti in the air, as if they just won the match.

The pose is a celebration: arms up, a cheer, or holding a golden trophy without text.

Keep their own body shape and their own hair.

Photorealistic sports photograph.
Floodlight rim light.
Grass and fabric detail.
Natural skin.
No text.`;

export const CLOWN_PROMPT = `Turn the people into cheerful circus clowns in a classic big top.

Dress everyone in a colourful clown costume: big polka-dot or striped suits, a ruffled collar, oversized bow tie, suspenders, big shoes and a small hat that leaves the hair visible.
A red clown nose is allowed. Face paint is limited to a little colour on the cheeks, so the face stays fully recognisable.

Place them in the ring of a warm, old-fashioned circus tent, with red and white stripes, spotlights and a few balloons or juggling balls.

The mood is friendly, silly and warm.

Do not make it scary or creepy.
Do not cover the face with white make-up or a mask.
No text or posters.

Photorealistic.
Warm circus light.
Rich costume detail.
Natural skin.`;

export const CHRISTMAS_PROMPT = `Turn the photo into a cosy Christmas portrait.

Dress the people in festive clothing: Santa Claus suits, elf outfits, or warm Christmas jumpers, with a Santa hat that sits above their own hair.
Do not add a fake white beard that covers the face.

Place them in a warm living room on Christmas Eve: a decorated Christmas tree with fairy lights, a crackling fireplace with stockings, wrapped presents, and a little snow falling outside the window.

The mood is warm, happy and magical.

Photorealistic.
Golden fairy-light glow.
Soft depth of field.
Natural skin.
No text, cards or banners.`;

export const HALLOWEEN_PROMPT = `Turn the people into playful Halloween characters, such as an elegant vampire, a witch or a wizard.

Use rich, theatrical costumes: high collars, capes, velvet, a pointed hat that leaves the hair visible.
Keep the faces as they are. At most a small hint of colour around the eyes. No masks, no heavy make-up, no fangs that change the mouth.

Place them in a spooky but fun setting: a misty pumpkin patch at night with glowing jack-o'-lanterns, an old mansion behind, a full moon and a few bats.

The mood is fun, not frightening. Suitable for children.
No blood, gore or wounds.
No text.

Photorealistic.
Moonlight and warm pumpkin glow.
Cinematic atmosphere.
Natural skin.`;

export const SUPERCAR_PROMPT = `Turn the photo into a glamorous portrait of the people posing next to an exotic sports car.

Dress them in stylish, expensive clothes: tailored jackets, sunglasses pushed up on the head or held in the hand, polished shoes.

Place them beside a gleaming low supercar in a bold colour, with the doors open upwards, on a coastal road at golden hour or in front of a luxury hotel at night.
The car must be an invented design. No real car brand, badge, emblem or number plate text.

The people are the focus. The car fills the background and the side of the frame.

The mood is confident, rich and fun.

Photorealistic automotive lifestyle photograph.
Golden-hour light and reflections on the paint.
Natural skin.
No text or logos.`;

export const ASTRONAUT_PROMPT = `Turn the people into astronauts on a space mission.

Dress them in realistic white spacesuits with mission patches without text, the helmet held under the arm or with an open visor, so the whole face and their own hair are visible.

Place them on the surface of the Moon with the Earth rising in the black sky behind them, a lunar lander and footprints in the grey dust.
Alternatively, inside a space station with a big window onto the Earth.

The mood is proud and adventurous.

Mission patches are plain coloured shapes: no flags of any country, no space agency logos, no letters, names or numbers anywhere on the suits.
No text.

Photorealistic.
Hard sunlight and deep shadows, as in real space photography.
Detailed suit fabric.
Natural skin.`;
