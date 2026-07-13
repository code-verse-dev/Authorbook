// ══════════════════════════════════════════════════════════
// AUDIO ENGINE — fully synthesized with WebAudio.
// Heartbeat, deep-space ambient pad, scroll whooshes,
// hatch choir chime. No audio files, everything generated.
// ══════════════════════════════════════════════════════════

class AudioEngine {
  constructor() {
    this.ctx = null;
    this.master = null;
    this.muted = false;
    this.heartTimer = null;
    this.heartRate = 1100; // ms between beats
  }

  init() {
    if (this.ctx) return;
    const AC = window.AudioContext || window.webkitAudioContext;
    this.ctx = new AC();
    this.master = this.ctx.createGain();
    this.master.gain.value = 0.85;
    this.master.connect(this.ctx.destination);

    // gentle bus compression so thumps never clip
    const comp = this.ctx.createDynamicsCompressor();
    comp.threshold.value = -18;
    comp.ratio.value = 6;
    this.bus = comp;
    comp.connect(this.master);
  }

  setMuted(m) {
    this.muted = m;
    if (this.master) {
      this.master.gain.linearRampToValueAtTime(m ? 0 : 0.85, this.ctx.currentTime + 0.3);
    }
  }

  // ── Single heartbeat: the classic "lub-DUB" ──
  beat(intensity = 1) {
    if (!this.ctx || this.muted) return;
    const t0 = this.ctx.currentTime;
    const thump = (t, freq, gain, dur) => {
      const osc = this.ctx.createOscillator();
      const g = this.ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, t);
      osc.frequency.exponentialRampToValueAtTime(freq * 0.55, t + dur);
      g.gain.setValueAtTime(0.0001, t);
      g.gain.exponentialRampToValueAtTime(gain, t + 0.012);
      g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
      osc.connect(g).connect(this.bus);
      osc.start(t);
      osc.stop(t + dur + 0.05);
    };
    thump(t0, 58, 0.55 * intensity, 0.16);          // lub
    thump(t0 + 0.19, 46, 0.75 * intensity, 0.24);   // DUB
  }

  startHeartbeat(rateMs = 1100) {
    this.heartRate = rateMs;
    if (this.heartTimer) return;
    const loop = () => {
      this.beat();
      this.onBeat?.(); // visual pulse hook
      this.heartTimer = setTimeout(loop, this.heartRate);
    };
    loop();
  }

  setHeartRate(ms) { this.heartRate = ms; }

  stopHeartbeat() {
    clearTimeout(this.heartTimer);
    this.heartTimer = null;
  }

  // ── Deep space ambient pad: detuned drones + slow LFO filter ──
  startAmbient() {
    if (!this.ctx || this.ambient) return;
    const t = this.ctx.currentTime;
    const g = this.ctx.createGain();
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(0.05, t + 6);

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.value = 320;
    filter.Q.value = 2;

    const lfo = this.ctx.createOscillator();
    const lfoGain = this.ctx.createGain();
    lfo.frequency.value = 0.06;
    lfoGain.gain.value = 140;
    lfo.connect(lfoGain).connect(filter.frequency);
    lfo.start();

    const oscs = [55, 55.7, 82.4, 110.4].map((f, i) => {
      const o = this.ctx.createOscillator();
      o.type = i < 2 ? 'sawtooth' : 'sine';
      o.frequency.value = f;
      const og = this.ctx.createGain();
      og.gain.value = i < 2 ? 0.25 : 0.5;
      o.connect(og).connect(filter);
      o.start();
      return o;
    });

    filter.connect(g).connect(this.bus);
    this.ambient = { g, oscs, lfo };
  }

  // ── Filtered-noise whoosh (scene transitions / scroll bursts) ──
  whoosh(dur = 1.4, vol = 0.16) {
    if (!this.ctx || this.muted) return;
    const t = this.ctx.currentTime;
    const len = Math.floor(this.ctx.sampleRate * dur);
    const buf = this.ctx.createBuffer(1, len, this.ctx.sampleRate);
    const data = buf.getChannelData(0);
    for (let i = 0; i < len; i++) data[i] = Math.random() * 2 - 1;

    const src = this.ctx.createBufferSource();
    src.buffer = buf;
    const filter = this.ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.Q.value = 1.2;
    filter.frequency.setValueAtTime(180, t);
    filter.frequency.exponentialRampToValueAtTime(2400, t + dur * 0.55);
    filter.frequency.exponentialRampToValueAtTime(120, t + dur);

    const g = this.ctx.createGain();
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(vol, t + dur * 0.3);
    g.gain.exponentialRampToValueAtTime(0.0001, t + dur);

    // give it width
    const pan = this.ctx.createStereoPanner();
    pan.pan.setValueAtTime(-0.7, t);
    pan.pan.linearRampToValueAtTime(0.7, t + dur);

    src.connect(filter).connect(g).connect(pan).connect(this.bus);
    src.start(t);
  }

  // ── Golden chime cluster for the hatch ──
  hatch() {
    if (!this.ctx || this.muted) return;
    const t = this.ctx.currentTime;
    // rising shimmer of harmonics — a synthetic "choir"
    [261.6, 329.6, 392, 523.2, 659.2, 784, 1046.4].forEach((f, i) => {
      const o = this.ctx.createOscillator();
      o.type = 'sine';
      o.frequency.value = f;
      const g = this.ctx.createGain();
      const at = t + i * 0.14;
      g.gain.setValueAtTime(0.0001, at);
      g.gain.exponentialRampToValueAtTime(0.12, at + 0.4);
      g.gain.exponentialRampToValueAtTime(0.0001, at + 4.5);
      const pan = this.ctx.createStereoPanner();
      pan.pan.value = (i % 2 ? 1 : -1) * (0.2 + i * 0.08);
      o.connect(g).connect(pan).connect(this.bus);
      o.start(at);
      o.stop(at + 5);
    });
    this.whoosh(2.6, 0.22);
  }

  // ── Short UI blip ──
  blip(freq = 880) {
    if (!this.ctx || this.muted) return;
    const t = this.ctx.currentTime;
    const o = this.ctx.createOscillator();
    o.type = 'triangle';
    o.frequency.value = freq;
    const g = this.ctx.createGain();
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(0.08, t + 0.01);
    g.gain.exponentialRampToValueAtTime(0.0001, t + 0.25);
    o.connect(g).connect(this.bus);
    o.start(t);
    o.stop(t + 0.3);
  }

  // ── Glitch static burst ──
  glitchNoise(dur = 0.3) {
    if (!this.ctx || this.muted) return;
    const t = this.ctx.currentTime;
    const len = Math.floor(this.ctx.sampleRate * dur);
    const buf = this.ctx.createBuffer(1, len, this.ctx.sampleRate);
    const data = buf.getChannelData(0);
    for (let i = 0; i < len; i++) data[i] = (Math.random() * 2 - 1) * (Math.random() < 0.5 ? 1 : 0.2);
    const src = this.ctx.createBufferSource();
    src.buffer = buf;
    const g = this.ctx.createGain();
    g.gain.value = 0.09;
    const hp = this.ctx.createBiquadFilter();
    hp.type = 'highpass';
    hp.frequency.value = 900;
    src.connect(hp).connect(g).connect(this.bus);
    src.start(t);
  }
}

export const audio = new AudioEngine();
