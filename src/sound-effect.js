import { AmbientLoop } from './ambient-loop.js';

// Shares the cached decoder/fallback loader, but only creates short one-shot voices.
export class SoundEffect {
  constructor(context, output, options = {}) {
    this.context = context; this.output = output;
    this.asset = new AmbientLoop(context, output, options); this.voices = new Set();
  }
  async prepare() { await this.asset.prepare(); }
  play({ level = 1, pan = 0 } = {}) {
    if (this.asset.disposed || !this.asset.buffer || this.context.state !== 'running' || this.voices.size >= 2) return false;
    const source = this.context.createBufferSource(), gain = this.context.createGain();
    const panner = this.context.createStereoPanner?.();
    source.buffer = this.asset.buffer;
    gain.gain.value = Math.max(0, Math.min(1, level));
    source.connect(gain);
    if (panner) { panner.pan.value = Math.max(-1, Math.min(1, pan)); gain.connect(panner); panner.connect(this.output); }
    else gain.connect(this.output);
    const voice = { source, gain, panner };
    source.onended = () => { source.disconnect(); gain.disconnect(); panner?.disconnect(); this.voices.delete(voice); };
    this.voices.add(voice); source.start(); return true;
  }
  stop() {
    for (const voice of this.voices) { voice.source.stop(); voice.source.onended(); }
  }
  dispose() { this.stop(); this.asset.dispose(); }
}
