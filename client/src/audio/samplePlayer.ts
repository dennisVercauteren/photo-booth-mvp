/**
 * Offline-ready sample mixer for the Transformation Machine.
 * Generated WAVs are provided by scripts/generate-samples.mjs before dev/build.
 * Swap in licensed field/studio recordings by setting VITE_SOUND_PACK=custom
 * and adding matching filenames under client/public/sounds/custom/.
 */
type Clip = "select" | "camera" | "transition" | "build" | "reveal";
const PACK = import.meta.env.VITE_SOUND_PACK === "custom" ? "custom" : "generated";
const CLIPS: Clip[] = ["select", "camera", "transition", "build", "reveal"];
let cache = new Map<Clip, Promise<AudioBuffer | null>>();
let warmed = false;

function load(ctx: AudioContext, clip: Clip): Promise<AudioBuffer | null> {
  const existing = cache.get(clip);
  if (existing) return existing;
  const promise = fetch(`/sounds/${PACK}/${clip}.wav`)
    .then((response) => response.ok ? response.arrayBuffer() : null)
    .then((bytes) => bytes ? ctx.decodeAudioData(bytes) : null)
    .catch(() => null);
  cache.set(clip, promise);
  return promise;
}

export function warmSoundSamples(ctx: AudioContext): void {
  if (warmed) return;
  warmed = true;
  CLIPS.forEach((clip) => { void load(ctx, clip); });
}

export function playSoundSample(ctx: AudioContext, bus: AudioNode, clip: Clip, volume: number): void {
  const started = performance.now();
  void load(ctx, clip).then((buffer) => {
    // Never play a late sample out of sync with a photo-booth animation.
    if (!buffer || performance.now() - started > 250) return;
    const source = ctx.createBufferSource();
    const gain = ctx.createGain();
    source.buffer = buffer;
    gain.gain.value = volume;
    source.connect(gain).connect(bus);
    source.start();
  });
}
