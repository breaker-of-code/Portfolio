import { assetUrl } from './asset-url.js';

export class AmbientLoop {
  constructor(context, output, { urls = ['/audio/ocean-shore.m4a', '/audio/ocean-shore.wav'], load = (...args) => fetch(...args), onState = () => {}, level = 1, fadeIn = .65, fadeTime = .06, playbackRate = 1 } = {}) {
    this.context = context; this.output = output; this.urls = urls.map(url => assetUrl(url)); this.load = load; this.onState = onState;
    this.abort = new AbortController(); this.disposed = false;
    this.level = Math.max(0, Math.min(1, level)); this.fadeIn = fadeIn; this.fadeTime = fadeTime;
    this.playbackRate = Math.max(.25, Math.min(4, playbackRate));
  }
  async prepare() {
    if (this.disposed) return;
    if (!this.buffer && !this.pending) {
      this.onState('loading');
      this.pending = this.decode().then(buffer => { if (!this.disposed) this.buffer = buffer; })
        .catch(error => { if (!this.disposed) this.onState('unavailable', error); throw error; })
        .finally(() => { this.pending = null; });
    }
    await this.pending;
    return this.buffer;
  }
  async start() {
    if (this.disposed || this.source) return;
    await this.prepare();
    if (this.disposed || this.source) return;
    const source = this.context.createBufferSource(), fade = this.context.createGain();
    source.buffer = this.buffer; source.loop = true;
    source.playbackRate.setValueAtTime(this.playbackRate, this.context.currentTime);
    fade.gain.setValueAtTime(0, this.context.currentTime);
    fade.gain.linearRampToValueAtTime(this.level, this.context.currentTime + this.fadeIn);
    source.connect(fade); fade.connect(this.output); source.start();
    this.source = source; this.fade = fade; this.onState('playing');
  }
  setLevel(value) {
    if (!Number.isFinite(value)) return;
    const level = Math.max(0, Math.min(1, value));
    if (level === this.level) return;
    this.level = level;
    if (!this.fade) return;
    const gain = this.fade.gain, now = this.context.currentTime;
    if (gain.cancelAndHoldAtTime) gain.cancelAndHoldAtTime(now);
    else gain.cancelScheduledValues?.(now);
    gain.setTargetAtTime(this.level, now, this.fadeTime);
  }
  setPlaybackRate(value) {
    if (!Number.isFinite(value)) return;
    const rate = Math.max(.25, Math.min(4, value));
    if (rate === this.playbackRate) return;
    this.playbackRate = rate;
    if (!this.source) return;
    const param = this.source.playbackRate, now = this.context.currentTime;
    if (param.cancelAndHoldAtTime) param.cancelAndHoldAtTime(now);
    else param.cancelScheduledValues?.(now);
    param.setTargetAtTime(rate, now, .045);
  }
  async decode() {
    let lastError;
    for (const url of this.urls) {
      if (this.disposed) throw new Error('Audio disposed');
      try {
        const response = await this.load(url, { signal: this.abort.signal });
        if (!response.ok) throw new Error(`Audio request failed: ${response.status}`);
        return await this.context.decodeAudioData(await response.arrayBuffer());
      } catch (error) { lastError = error; }
    }
    throw lastError;
  }
  dispose() {
    this.disposed = true; this.abort.abort();
    this.source?.stop(); this.source?.disconnect(); this.fade?.disconnect();
    this.source = null; this.buffer = null;
  }
}
