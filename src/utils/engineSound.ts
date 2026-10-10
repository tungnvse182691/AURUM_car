/**
 * AURUM Engine Synth — tổng hợp tiếng động cơ bằng Web Audio API, không cần file audio.
 * Mỗi loại máy có "tính cách" riêng: V8 gầm gừ, V10/V12 the thé, Điện là tiếng whine tương lai.
 */

export type EngineCharacter = "v8" | "v10" | "v12" | "electric" | "other";

export function engineCharacter(engine: string, fuel: string): EngineCharacter {
  if (fuel === "Điện") return "electric";
  const e = engine.toUpperCase();
  if (e.includes("V12")) return "v12";
  if (e.includes("V10")) return "v10";
  if (e.includes("V8")) return "v8";
  return "other";
}

const PRESETS: Record<EngineCharacter, { base: number; top: number; growl: number; bright: number }> = {
  v8: { base: 48, top: 130, growl: 0.9, bright: 0.35 },
  v10: { base: 62, top: 190, growl: 0.6, bright: 0.55 },
  v12: { base: 70, top: 230, growl: 0.45, bright: 0.7 },
  electric: { base: 300, top: 1200, growl: 0.05, bright: 1 },
  other: { base: 55, top: 150, growl: 0.7, bright: 0.45 },
};

let ctx: AudioContext | null = null;
let nodes: AudioNode[] = [];

export function stopEngineSound() {
  nodes.forEach((n) => {
    try {
      (n as OscillatorNode).stop?.();
    } catch { /* already stopped */ }
    try {
      n.disconnect();
    } catch { /* noop */ }
  });
  nodes = [];
  if (ctx) {
    ctx.close().catch(() => {});
    ctx = null;
  }
}

/** Rev the engine: idle → redline → idle, ~4.5s. Returns cleanup. */
export function playEngineSound(char: EngineCharacter): () => void {
  stopEngineSound();
  const p = PRESETS[char];
  ctx = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
  const ac = ctx;
  const t0 = ac.currentTime;
  const dur = 4.6;
  const master = ac.createGain();
  master.gain.setValueAtTime(0.0001, t0);
  master.gain.exponentialRampToValueAtTime(0.5, t0 + 0.25);
  master.gain.setValueAtTime(0.5, t0 + dur - 0.8);
  master.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
  const lp = ac.createBiquadFilter();
  lp.type = "lowpass";
  lp.frequency.value = char === "electric" ? 4000 : 900;
  master.connect(lp).connect(ac.destination);

  // RPM curve: idle → blip → redline → settle
  const rpmAt = (t: number) => {
    const x = t / dur;
    if (x < 0.12) return 0.15;
    if (x < 0.45) return 0.15 + ((x - 0.12) / 0.33) * 0.85; // rev up
    if (x < 0.62) return 1.0 - ((x - 0.45) / 0.17) * 0.25; // slight lift
    if (x < 0.85) return 0.75 + ((x - 0.62) / 0.23) * 0.25; // second push
    return 1.0 - ((x - 0.85) / 0.15) * 0.85; // settle to idle
  };

  // Firing oscillators (sawtooth stack = engine cylinders)
  const oscs: OscillatorNode[] = [];
  const gains: GainNode[] = [];
  const harmonics = [1, 1.5, 2, 2.98, 4.2];
  harmonics.forEach((_, i) => {
    const o = ac.createOscillator();
    o.type = i < 2 ? "sawtooth" : "square";
    const g = ac.createGain();
    g.gain.value = (i === 0 ? 0.5 : 0.22 / i) * (1 + p.bright * (i / harmonics.length));
    o.connect(g).connect(master);
    o.start(t0);
    oscs.push(o);
    gains.push(g);
  });

  // Exhaust growl: filtered noise
  const noiseLen = Math.ceil(ac.sampleRate * dur);
  const noiseBuf = ac.createBuffer(1, noiseLen, ac.sampleRate);
  const nd = noiseBuf.getChannelData(0);
  for (let i = 0; i < noiseLen; i++) nd[i] = Math.random() * 2 - 1;
  const noise = ac.createBufferSource();
  noise.buffer = noiseBuf;
  const noiseGain = ac.createGain();
  noiseGain.gain.value = p.growl * 0.35;
  const noiseFilter = ac.createBiquadFilter();
  noiseFilter.type = "lowpass";
  noiseFilter.frequency.value = 320;
  noise.connect(noiseFilter).connect(noiseGain).connect(master);
  noise.start(t0);

  // Animate pitch along RPM curve
  const steps = 60;
  for (let s = 0; s <= steps; s++) {
    const t = t0 + (s / steps) * dur;
    const rpm = rpmAt(s / steps);
    const f = p.base + (p.top - p.base) * rpm;
    harmonics.forEach((mult, i) => oscs[i].frequency.setValueAtTime(f * mult, t));
    noiseFilter.frequency.setValueAtTime(220 + 900 * rpm * p.growl, t);
  }

  nodes = [...oscs, ...gains, noise, noiseGain, noiseFilter, master, lp];
  const timer = setTimeout(stopEngineSound, (dur + 0.3) * 1000);
  return () => {
    clearTimeout(timer);
    stopEngineSound();
  };
}
