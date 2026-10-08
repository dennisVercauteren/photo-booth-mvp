// Sound effects and background music, synthesised with Web Audio so the booth needs no audio files.
// Three themes (carnival, arcade, lounge) share the same events; staff pick one in the settings menu.

import type { SoundTheme } from "../types";

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

let theme: SoundTheme = "carnival";

/** Switches effects and music to another theme. Music that is playing restarts in the new style. */
export function setSoundTheme(next: SoundTheme): void {
  if (next === theme) return;
  theme = next;
  if (musicTimer !== null && context) {
    stepIndex = 0;
    nextStepTime = context.currentTime + 0.1;
  }
}

export function playTap(): void {
  const a = audio();
  if (!a) return;
  const t = a.ctx.currentTime;
  if (theme === "arcade") {
    tone(a.effects, 880, t, 0.05, { type: "square", gain: 0.25 });
  } else if (theme === "lounge") {
    tone(a.effects, 1320, t, 0.12, { type: "sine", gain: 0.25 });
  } else {
    tone(a.effects, 660, t, 0.09, { type: "sine", gain: 0.6, slideTo: 990 });
  }
}

export function playSelect(): void {
  const a = audio();
  if (!a) return;
  const t = a.ctx.currentTime;
  if (theme === "arcade") {
    [523, 659, 784, 1046, 1318].forEach((f, i) => tone(a.effects, f, t + i * 0.04, 0.06, { type: "square", gain: 0.22 }));
  } else if (theme === "lounge") {
    [587, 740, 880, 1109].forEach((f, i) => tone(a.effects, f, t + i * 0.09, 0.9, { type: "sine", gain: 0.3 }));
  } else {
    [784, 988, 1175, 1568].forEach((f, i) => tone(a.effects, f, t + i * 0.055, 0.22, { gain: 0.45 }));
  }
}

export function playCountdown(final: boolean): void {
  const a = audio();
  if (!a) return;
  const t = a.ctx.currentTime;
  if (theme === "arcade") {
    tone(a.effects, final ? 880 : 440, t, final ? 0.4 : 0.12, { type: "square", gain: 0.25 });
  } else if (theme === "lounge") {
    tone(a.effects, final ? 1175 : 880, t, final ? 0.9 : 0.5, { type: "sine", gain: 0.35 });
  } else {
    tone(a.effects, final ? 1046 : 784, t, final ? 0.35 : 0.18, { type: "square", gain: 0.22 });
  }
}

export function playShutter(): void {
  const a = audio();
  if (!a) return;
  const t = a.ctx.currentTime;
  if (theme === "arcade") {
    noise(a.effects, t, 0.08, 0.8, 6000, 800);
    tone(a.effects, 1600, t, 0.15, { type: "square", gain: 0.2, slideTo: 200 });
  } else if (theme === "lounge") {
    noise(a.effects, t, 0.04, 0.5, 2500, 1800);
    noise(a.effects, t + 0.09, 0.05, 0.35, 2000, 1200);
  } else {
    noise(a.effects, t, 0.05, 0.9, 4000, 2500);
    noise(a.effects, t + 0.07, 0.07, 0.7, 3000, 1500);
  }
}

export function playWhoosh(): void {
  const a = audio();
  if (!a) return;
  const t = a.ctx.currentTime;
  if (theme === "arcade") {
    [262, 330, 392, 523, 659, 784, 1046].forEach((f, i) => tone(a.effects, f, t + i * 0.07, 0.07, { type: "square", gain: 0.18 }));
  } else if (theme === "lounge") {
    noise(a.effects, t, 1.2, 0.25, 400, 1600);
    [440, 554, 659].forEach((f, i) => tone(a.effects, f, t + 0.2 + i * 0.15, 1.2, { type: "sine", gain: 0.15, attack: 0.2 }));
  } else {
    noise(a.effects, t, 0.7, 0.5, 300, 3000);
    tone(a.effects, 220, t, 0.7, { type: "sine", gain: 0.25, slideTo: 880, attack: 0.3 });
  }
}

export function playTada(): void {
  const a = audio();
  if (!a) return;
  const t = a.ctx.currentTime;
  if (theme === "arcade") {
    // Level-complete jingle.
    [[523, 0], [659, 0.1], [784, 0.2], [1046, 0.3], [784, 0.45], [1046, 0.55]].forEach(([f, at]) =>
      tone(a.effects, f, t + at, 0.1, { type: "square", gain: 0.22 }),
    );
    [1046, 1318, 1568].forEach((f) => tone(a.effects, f, t + 0.7, 0.6, { type: "square", gain: 0.12 }));
  } else if (theme === "lounge") {
    // Soft vibraphone: a major seventh chord, rolled.
    [523, 659, 784, 988, 1318].forEach((f, i) => tone(a.effects, f, t + i * 0.07, 1.6, { type: "sine", gain: 0.25 }));
  } else {
    tone(a.effects, 523, t, 0.12, { type: "square", gain: 0.2 });
    tone(a.effects, 659, t + 0.1, 0.12, { type: "square", gain: 0.2 });
    [523, 659, 784, 1046].forEach((f) => tone(a.effects, f, t + 0.22, 0.9, { type: "triangle", gain: 0.3 }));
    [2093, 2637, 3136].forEach((f, i) => tone(a.effects, f, t + 0.3 + i * 0.08, 0.3, { type: "sine", gain: 0.12 }));
  }
}

export function playError(): void {
  const a = audio();
  if (!a) return;
  const t = a.ctx.currentTime;
  if (theme === "arcade") {
    [494, 466, 440, 415].forEach((f, i) => tone(a.effects, f, t + i * 0.18, 0.16, { type: "square", gain: 0.22 }));
    tone(a.effects, 392, t + 0.75, 0.6, { type: "square", gain: 0.22, slideTo: 196 });
  } else if (theme === "lounge") {
    tone(a.effects, 659, t, 0.6, { type: "sine", gain: 0.3 });
    tone(a.effects, 523, t + 0.3, 1, { type: "sine", gain: 0.3 });
  } else {
    [392, 370, 349].forEach((f, i) => tone(a.effects, f, t + i * 0.28, 0.3, { type: "triangle", gain: 0.35 }));
    tone(a.effects, 330, t + 0.84, 0.8, { type: "triangle", gain: 0.35, slideTo: 294 });
  }
}

// Background music: one loop per theme, scheduled a little ahead of time in eighth notes.
// Each bar: chord root for the bass, then 8 melody notes (0 = rest), as MIDI numbers.
type Bar = [number, number[]];

interface Song {
  bpm: number;
  bars: Bar[];
  /** Plays one eighth-note step. */
  play: (out: AudioNode, time: number, step: number, root: number, beat: number, note: number) => void;
}

const SONGS: Record<SoundTheme, Song> = {
  // A bouncy oom-pah carnival tune.
  carnival: {
    bpm: 132,
    bars: [
      [48, [72, 0, 76, 79, 76, 0, 72, 74]],
      [53, [77, 0, 76, 74, 72, 0, 69, 0]],
      [55, [71, 0, 74, 79, 77, 76, 74, 0]],
      [48, [76, 0, 72, 0, 67, 0, 72, 0]],
      [57, [76, 0, 81, 79, 76, 0, 72, 76]],
      [53, [77, 0, 81, 0, 77, 76, 74, 72]],
      [55, [74, 76, 77, 79, 77, 76, 74, 71]],
      [48, [72, 0, 67, 0, 72, 0, 0, 0]],
    ],
    play(out, time, step, root, beat, note) {
      if (note) {
        tone(out, midi(note), time, step * 1.6, { type: "triangle", gain: 0.5 });
      }
      // Oom-pah: bass on the beat, chord stab off the beat.
      if (beat % 2 === 0) {
        tone(out, midi(beat % 4 === 0 ? root - 12 : root - 5), time, step * 0.9, { type: "sine", gain: 0.9 });
      } else {
        [root + 12, root + 16, root + 19].forEach((n) => tone(out, midi(n), time, step * 0.5, { type: "square", gain: 0.06 }));
      }
    },
  },
  // An upbeat 8-bit chiptune: square lead, pulsing bass, noise hi-hat.
  arcade: {
    bpm: 150,
    bars: [
      [45, [69, 72, 76, 72, 81, 76, 72, 76]],
      [41, [77, 0, 76, 74, 72, 0, 74, 76]],
      [43, [79, 0, 76, 79, 83, 0, 79, 76]],
      [45, [81, 0, 79, 76, 72, 74, 76, 0]],
      [45, [69, 72, 76, 72, 81, 76, 72, 76]],
      [41, [77, 81, 84, 81, 77, 74, 72, 74]],
      [43, [76, 74, 72, 71, 72, 74, 76, 79]],
      [45, [81, 0, 76, 0, 69, 0, 0, 0]],
    ],
    play(out, time, step, root, beat, note) {
      if (note) {
        tone(out, midi(note), time, step * 0.8, { type: "square", gain: 0.16 });
      }
      tone(out, midi(root - (beat % 2 === 0 ? 12 : 0)), time, step * 0.7, { type: "triangle", gain: 0.7 });
      if (beat % 2 === 1) {
        noise(out, time, 0.03, 0.25, 8000, 6000);
      }
    },
  },
  // A slow bossa-style lounge loop: soft electric-piano chords, round bass, a light shaker.
  lounge: {
    bpm: 96,
    bars: [
      [50, [0, 0, 77, 0, 76, 0, 74, 0]],
      [55, [0, 72, 0, 74, 0, 0, 71, 0]],
      [48, [0, 0, 76, 0, 79, 0, 76, 0]],
      [45, [0, 0, 73, 0, 0, 76, 0, 0]],
      [50, [0, 0, 77, 0, 81, 0, 79, 0]],
      [55, [0, 77, 0, 76, 0, 74, 0, 0]],
      [48, [0, 0, 79, 76, 0, 72, 0, 0]],
      [43, [0, 0, 74, 0, 71, 0, 0, 0]],
    ],
    play(out, time, step, root, beat, note) {
      if (note) {
        tone(out, midi(note), time, step * 2.5, { type: "sine", gain: 0.35 });
      }
      if (beat === 0 || beat === 3 || beat === 6) {
        // Major or minor seventh chord, depending on the root.
        const minor = root === 50 || root === 45;
        const chord = minor ? [root + 12, root + 15, root + 19, root + 22] : [root + 12, root + 16, root + 19, root + 23];
        chord.forEach((n) => tone(out, midi(n), time, step * 2.2, { type: "sine", gain: 0.12, attack: 0.03 }));
      }
      if (beat === 0 || beat === 4) {
        tone(out, midi(root - 12), time, step * 2.5, { type: "sine", gain: 0.8 });
      } else if (beat === 3 || beat === 7) {
        tone(out, midi(root - 5), time, step * 1.2, { type: "sine", gain: 0.55 });
      }
      noise(out, time, 0.04, beat % 2 === 0 ? 0.12 : 0.07, 7000, 5000);
    },
  },
};

let musicTimer: number | null = null;
let nextStepTime = 0;
let stepIndex = 0;

function midi(note: number): number {
  return 440 * 2 ** ((note - 69) / 12);
}

function scheduleMusic(): void {
  const a = audio();
  if (!a) return;
  const song = SONGS[theme];
  const step = 60 / song.bpm / 2;
  while (nextStepTime < a.ctx.currentTime + 0.25) {
    const [root, melody] = song.bars[Math.floor(stepIndex / 8) % song.bars.length];
    const beat = stepIndex % 8;
    song.play(a.music, nextStepTime, step, root, beat, melody[beat]);
    nextStepTime += step;
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
