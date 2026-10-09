// Deterministic, original sampled sound designs. Runs locally before dev/build.
// No third-party recordings or network access required. Existing WAVs are never overwritten.
import fs from "node:fs";
import path from "node:path";
const root = path.resolve("client/public/sounds/generated");
fs.mkdirSync(root, { recursive: true });
const RATE = 22050;
const clips = [
  ["select", .38],
  ["camera", .70],
  ["transition", 1.2],
  ["build", 2.05],
  ["reveal", 1.75],
];
function wav(name, duration) {
  let seed = 123456 + name.length * 3451;
  let filtered = 0;
  const sampleCount = Math.floor(RATE * duration);
  const data = Buffer.alloc(sampleCount * 2);
  for (let i = 0; i < sampleCount; i++) {
    const t = i / RATE;
    const p = t / duration;
    seed = (Math.imul(seed, 1664525) + 1013904223) | 0;
    const noise = ((seed >>> 0) / 4294967295) * 2 - 1;
    filtered += (noise - filtered) * .08;
    let sound = 0;
    if (name === "select") {
      const env = Math.exp(-t * 12);
      sound = (.5 * Math.sin(2 * Math.PI * (620*t + 250*t*t)) + .3 * noise) * env;
    } else if (name === "camera") {
      const shutter = Math.exp(-Math.max(t-.05,0) * 26);
      sound = .55 * filtered * shutter + .6 * Math.sin(2 * Math.PI * (94*t-80*t*t)) * Math.exp(-t*9);
    } else if (name === "transition") {
      const env = Math.sin(Math.PI * p) ** 1.2;
      sound = env * (.4 * filtered + .3 * Math.sin(2*Math.PI*(95*t+240*t*t))) ;
    } else if (name === "build") {
      const env = Math.min(1,p*2) * Math.max(0,1-p)**.3;
      sound = env * (.35 * filtered + .3*Math.sin(2*Math.PI*(83*t+230*t*t)) + .12*noise);
    } else {
      const env = Math.exp(-t * 3.4);
      sound = env * (.7*Math.sin(2*Math.PI*(64*t - 12*t*t)) + .3*filtered);
      [0,.24,.48,.72].forEach((at,j) => {
        if (t>at) sound += .13*Math.sin(2*Math.PI*[392,494,587,784][j]*t)*Math.exp(-(t-at)*7);
      });
    }
    data.writeInt16LE(Math.max(-32767,Math.min(32767,Math.round(sound*25000))),i*2);
  }
  const header = Buffer.alloc(44);
  header.write("RIFF",0);
  header.writeUInt32LE(36 + data.length,4);
  header.write("WAVEfmt ",8);
  header.writeUInt32LE(16,16);
  header.writeUInt16LE(1,20); // PCM
  header.writeUInt16LE(1,22); // mono
  header.writeUInt32LE(RATE,24);
  header.writeUInt32LE(RATE*2,28);
  header.writeUInt16LE(2,32);
  header.writeUInt16LE(16,34);
  header.write("data",36);
  header.writeUInt32LE(data.length,40);
  const filename = path.join(root,`${name}.wav`);
  if (!fs.existsSync(filename)) fs.writeFileSync(filename,Buffer.concat([header,data]));
}
clips.forEach(([name,duration]) => wav(name,duration));
console.info("[audio] Offline sample pack ready");
