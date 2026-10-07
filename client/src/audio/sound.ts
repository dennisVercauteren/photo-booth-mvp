// Sound effects and background music, synthesised with Web Audio so the booth needs no audio files.

const MUSIC_VOLUME = 0.1;
const EFFECTS_VOLUME = 0.35;

let context: AudioContext | null = null;
let effectsBus: GainNode | null = null;
let musicBus: GainNode | null = null;

function audio(): { ctx: AudioContext; effects: GainNode; music: GainNode } | null {
  if (!context) {
    try {
      context = new AudioContext();
    } catch {
      return null;
    }
    effectsBus = context.createGain();
    effectsBus.gain.value = EFFECTS_VOLUME;
    effectsBus.connect(context.destination);
    musicBus = context.createGain();
    musicBus.gain.value = 0;
    musicBus.connect(context.destination);
  }
  if (context.state === "suspended") {
    void context.resume();
  }
  return { ctx: context, effects: effectsBus!, music: musicBus! };
}

interface ToneOptions {
  type?: OscillatorType;
  gain?: number;
  attack?: number;
  slideTo?: number;
}

function tone(out: AudioNode, frequency: number, start: number, length: number, options: ToneOptions = {}): void {
  const ctx = out.context;
  const osc = ctx.createOscillator();
  const env = ctx.createGain();
  const peak = options.gain ?? 1;
  const attack = options.attack ?? 0.008;
  osc.type = options.type ?? "triangle";
  osc.frequency.setValueAtTime(frequency, start);
  if (options.slideTo) {
    osc.frequency.exponentialRampToValueAtTime(options.slideTo, start + length);
  }
  env.gain.setValueAtTime(0.0001, start);
  env.gain.exponentialRampToValueAtTime(peak, start + attack);
  env.gain.exponentialRampToValueAtTime(0.0001, start + length);
  osc.connect(env).connect(out);
  osc.start(start);
  osc.stop(start + length + 0.02);
}

function noise(out: AudioNode, start: number, length: number, gain: number, filterFrom: number, filterTo: number): void {
  const ctx = out.context;
  const buffer = ctx.createBuffer(1, Math.ceil(ctx.sampleRate * length), ctx.sampleRate);
  const data = buffer.getChannelData(0);
  for (let i = 0; i < data.length; i += 1) {
    data[i] = Math.random() * 2 - 1;
  }
  const source = ctx.createBufferSource();
  const filter = ctx.createBiquadFilter();
  const env = ctx.createGain();
  source.buffer = buffer;
  filter.type = "bandpass";
  filter.frequency.setValueAtTime(filterFrom, start);
  filter.frequency.exponentialRampToValueAtTime(filterTo, start + length);
  env.gain.setValueAtTime(gain, start);
  env.gain.exponentialRampToValueAtTime(0.0001, start + length);
  source.connect(filter).connect(env).connect(out);
  source.start(start);
}

export function playTap(): void {
  const a = audio();
  if (!a) return;
  tone(a.effects, 660, a.ctx.currentTime, 0.09, { type: "sine", gain: 0.6, slideTo: 990 });
}

export function playSelect(): void {
  const a = audio();
  if (!a) return;
  const t = a.ctx.currentTime;
  [784, 988, 1175, 1568].forEach((f, i) => tone(a.effects, f, t + i * 0.055, 0.22, { gain: 0.45 }));
}

export function playCountdown(final: boolean): void {
  const a = audio();
  if (!a) return;
  tone(a.effects, final ? 1046 : 784, a.ctx.currentTime, final ? 0.35 : 0.18, { type: "square", gain: 0.22 });
}

export function playShutter(): void {
  const a = audio();
  if (!a) return;
  const t = a.ctx.currentTime;
  noise(a.effects, t, 0.05, 0.9, 4000, 2500);
  noise(a.effects, t + 0.07, 0.07, 0.7, 3000, 1500);
}

export function playWhoosh(): void {
  const a = audio();
  if (!a) return;
  const t = a.ctx.currentTime;
  noise(a.effects, t, 0.7, 0.5, 300, 3000);
  tone(a.effects, 220, t, 0.7, { type: "sine", gain: 0.25, slideTo: 880, attack: 0.3 });
}

export function playTada(): void {
  const a = audio();
  if (!a) return;
  const t = a.ctx.currentTime;
  tone(a.effects, 523, t, 0.12, { type: "square", gain: 0.2 });
  tone(a.effects, 659, t + 0.1, 0.12, { type: "square", gain: 0.2 });
  [523, 659, 784, 1046].forEach((f) => tone(a.effects, f, t + 0.22, 0.9, { type: "triangle", gain: 0.3 }));
  [2093, 2637, 3136].forEach((f, i) => tone(a.effects, f, t + 0.3 + i * 0.08, 0.3, { type: "sine", gain: 0.12 }));
}

export function playError(): void {
  const a = audio();
  if (!a) return;
  const t = a.ctx.currentTime;
  [392, 370, 349].forEach((f, i) => tone(a.effects, f, t + i * 0.28, 0.3, { type: "triangle", gain: 0.35 }));
  tone(a.effects, 330, t + 0.84, 0.8, { type: "triangle", gain: 0.35, slideTo: 294 });
}

// Background music: a bouncy carnival loop, scheduled a little ahead of time.
const BPM = 132;
const STEP = 60 / BPM / 2; // eighth notes
// Each bar: chord root for the bass, then 8 melody notes (0 = rest), as MIDI numbers.
const SONG: Array<[number, number[]]> = [
  [48, [72, 0, 76, 79, 76, 0, 72, 74]],
  [53, [77, 0, 76, 74, 72, 0, 69, 0]],
  [55, [71, 0, 74, 79, 77, 76, 74, 0]],
  [48, [76, 0, 72, 0, 67, 0, 72, 0]],
  [57, [76, 0, 81, 79, 76, 0, 72, 76]],
  [53, [77, 0, 81, 0, 77, 76, 74, 72]],
  [55, [74, 76, 77, 79, 77, 76, 74, 71]],
  [48, [72, 0, 67, 0, 72, 0, 0, 0]],
];

let musicTimer: number | null = null;
let nextStepTime = 0;
let stepIndex = 0;

function midi(note: number): number {
  return 440 * 2 ** ((note - 69) / 12);
}

function scheduleMusic(): void {
  const a = audio();
  if (!a) return;
  while (nextStepTime < a.ctx.currentTime + 0.25) {
    const [root, melody] = SONG[Math.floor(stepIndex / 8) % SONG.length];
    const beat = stepIndex % 8;
    const note = melody[beat];
    if (note) {
      tone(a.music, midi(note), nextStepTime, STEP * 1.6, { type: "triangle", gain: 0.5 });
    }
    // Oom-pah: bass on the beat, chord stab off the beat.
    if (beat % 2 === 0) {
      tone(a.music, midi(beat % 4 === 0 ? root - 12 : root - 5), nextStepTime, STEP * 0.9, { type: "sine", gain: 0.9 });
    } else {
      [root + 12, root + 16, root + 19].forEach((n) =>
        tone(a.music, midi(n), nextStepTime, STEP * 0.5, { type: "square", gain: 0.06 }),
      );
    }
    nextStepTime += STEP;
    stepIndex += 1;
  }
}

export function startMusic(): void {
  const a = audio();
  if (!a || musicTimer !== null) return;
  const t = a.ctx.currentTime;
  a.music.gain.cancelScheduledValues(t);
  a.music.gain.setValueAtTime(a.music.gain.value, t);
  a.music.gain.linearRampToValueAtTime(MUSIC_VOLUME, t + 1);
  nextStepTime = t + 0.05;
  stepIndex = 0;
  scheduleMusic();
  musicTimer = window.setInterval(scheduleMusic, 100);
}

export function stopMusic(): void {
  if (!context || !musicBus || musicTimer === null) return;
  const t = context.currentTime;
  musicBus.gain.cancelScheduledValues(t);
  musicBus.gain.setValueAtTime(musicBus.gain.value, t);
  musicBus.gain.linearRampToValueAtTime(0, t + 1.2);
  const timer = musicTimer;
  musicTimer = null;
  window.setTimeout(() => window.clearInterval(timer), 1200);
}
