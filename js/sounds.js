const SoundsModule = (() => {
  'use strict';

  /** @type {AudioContext|null} */
  let audioCtx = null;
  /** Active sound state keyed by name */
  const activeSounds = {};

  /* ---- Lazy-init AudioContext ---- */
  function getAudioCtx() {
    if (!audioCtx) {
      audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    }
    if (audioCtx.state === 'suspended') audioCtx.resume();
    return audioCtx;
  }

  /* ---- White / Brown / Pink noise buffer generators ---- */
  function createNoiseBuffer(ctx, type, duration) {
    const sr = ctx.sampleRate;
    const len = sr * duration;
    const buf = ctx.createBuffer(1, len, sr);
    const data = buf.getChannelData(0);

    if (type === 'white') {
      for (let i = 0; i < len; i++) data[i] = Math.random() * 2 - 1;
    } else if (type === 'brown') {
      let last = 0;
      for (let i = 0; i < len; i++) {
        const w = Math.random() * 2 - 1;
        data[i] = (last + 0.02 * w) / 1.02;
        last = data[i];
        data[i] *= 3.5;
      }
    } else if (type === 'pink') {
      let b0 = 0, b1 = 0, b2 = 0, b3 = 0, b4 = 0, b5 = 0, b6 = 0;
      for (let i = 0; i < len; i++) {
        const w = Math.random() * 2 - 1;
        b0 = 0.99886 * b0 + w * 0.0555179;
        b1 = 0.99332 * b1 + w * 0.0750759;
        b2 = 0.969 * b2 + w * 0.153852;
        b3 = 0.8665 * b3 + w * 0.3104856;
        b4 = 0.55 * b4 + w * 0.5329522;
        b5 = -0.7616 * b5 - w * 0.016898;
        data[i] = b0 + b1 + b2 + b3 + b4 + b5 + b6 + w * 0.5362;
        data[i] *= 0.11;
        b6 = w * 0.115926;
      }
    }
    return buf;
  }

  /* ---- Build audio graphs for each ambient sound ---- */
  function buildRain(ctx, gainNode) {
    // Rain = pink noise → bandpass
    const buf = createNoiseBuffer(ctx, 'pink', 4);
    const src = ctx.createBufferSource();
    src.buffer = buf;
    src.loop = true;
    const bp = ctx.createBiquadFilter();
    bp.type = 'bandpass';
    bp.frequency.value = 800;
    bp.Q.value = 0.5;
    src.connect(bp).connect(gainNode).connect(ctx.destination);
    src.start();
    return { source: src, extra: [bp] };
  }

  function buildOcean(ctx, gainNode) {
    // Ocean = brown noise → low-pass with slow LFO on frequency
    const buf = createNoiseBuffer(ctx, 'brown', 4);
    const src = ctx.createBufferSource();
    src.buffer = buf;
    src.loop = true;
    const lp = ctx.createBiquadFilter();
    lp.type = 'lowpass';
    lp.frequency.value = 400;
    lp.Q.value = 1;
    // Slow LFO to simulate waves
    const lfo = ctx.createOscillator();
    const lfoGain = ctx.createGain();
    lfo.frequency.value = 0.12;
    lfoGain.gain.value = 250;
    lfo.connect(lfoGain).connect(lp.frequency);
    lfo.start();
    src.connect(lp).connect(gainNode).connect(ctx.destination);
    src.start();
    return { source: src, extra: [lp, lfo, lfoGain] };
  }

  function buildForest(ctx, gainNode) {
    // Forest = layered white noise → high bandpass (birds-ish) + brown noise (wind)
    const whiteBuf = createNoiseBuffer(ctx, 'white', 4);
    const brownBuf = createNoiseBuffer(ctx, 'brown', 4);
    const bird = ctx.createBufferSource();
    bird.buffer = whiteBuf;
    bird.loop = true;
    const bp = ctx.createBiquadFilter();
    bp.type = 'bandpass';
    bp.frequency.value = 3200;
    bp.Q.value = 3;
    const birdGain = ctx.createGain();
    birdGain.gain.value = 0.15;
    bird.connect(bp).connect(birdGain).connect(gainNode);
    bird.start();

    const wind = ctx.createBufferSource();
    wind.buffer = brownBuf;
    wind.loop = true;
    const lp = ctx.createBiquadFilter();
    lp.type = 'lowpass';
    lp.frequency.value = 300;
    const windGain = ctx.createGain();
    windGain.gain.value = 0.6;
    wind.connect(lp).connect(windGain).connect(gainNode);
    wind.start();

    gainNode.connect(ctx.destination);
    return { source: bird, extra: [bp, birdGain, wind, lp, windGain] };
  }

  function buildCafe(ctx, gainNode) {
    // Café = pink noise → mid bandpass (chatter-ish)
    const buf = createNoiseBuffer(ctx, 'pink', 4);
    const src = ctx.createBufferSource();
    src.buffer = buf;
    src.loop = true;
    const bp = ctx.createBiquadFilter();
    bp.type = 'bandpass';
    bp.frequency.value = 1200;
    bp.Q.value = 0.4;
    src.connect(bp).connect(gainNode).connect(ctx.destination);
    src.start();
    return { source: src, extra: [bp] };
  }

  const builders = { rain: buildRain, ocean: buildOcean, forest: buildForest, cafe: buildCafe };

  /* ---- Public API ---- */

  /** Toggle a sound on/off. Returns true if now playing. */
  function toggle(name) {
    if (activeSounds[name]) {
      stop(name);
      return false;
    }
    return play(name);
  }

  function play(name) {
    if (activeSounds[name]) return true;
    const ctx = getAudioCtx();
    const gain = ctx.createGain();
    const slider = document.getElementById(`sound-volume-${name}`);
    gain.gain.value = slider ? slider.value / 100 : 0.5;
    const nodes = builders[name](ctx, gain);
    activeSounds[name] = { gain, ...nodes };
    return true;
  }

  function stop(name) {
    const s = activeSounds[name];
    if (!s) return;
    try { s.source.stop(); } catch (_) { /* already stopped */ }
    if (s.extra) {
      s.extra.forEach(n => {
        try { if (n.stop) n.stop(); } catch (_) {}
        try { n.disconnect(); } catch (_) {}
      });
    }
    try { s.gain.disconnect(); } catch (_) {}
    delete activeSounds[name];
  }

  function setVolume(name, val) {
    const s = activeSounds[name];
    if (s) s.gain.gain.value = val / 100;
  }

  function isPlaying(name) {
    return !!activeSounds[name];
  }

  return { toggle, play, stop, setVolume, isPlaying };
})();
