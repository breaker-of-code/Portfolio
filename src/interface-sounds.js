import { SoundEffect } from './sound-effect.js';

const cues = { click: { cooldown: .08 }, arrival: { cooldown: .3 }, transition: { cooldown: .5 } };
export class InterfaceSounds {
  constructor(context, output, { load, onState = () => {} } = {}) {
    this.context = context; this.lastPlayed = {}; this.effects = {}; this.onState = onState;
    for (const name of Object.keys(cues)) this.effects[name] = new SoundEffect(context, output, {
      urls: [`/audio/ui-${name}.m4a`, `/audio/ui-${name}.wav`], load,
      onState: (state, error) => onState(name, state, error),
    });
  }
  prepare() { return Promise.allSettled(Object.entries(this.effects).map(async ([name, effect]) => {
    await effect.prepare();
    if (!effect.asset.disposed) this.onState(name, 'ready');
  })); }
  play(name) {
    const cue = Object.hasOwn(cues, name) && cues[name];
    if (!cue || this.context.currentTime - (this.lastPlayed[name] ?? -Infinity) < cue.cooldown) return false;
    if (!this.effects[name].play()) return false;
    this.lastPlayed[name] = this.context.currentTime; return true;
  }
  stop() { Object.values(this.effects).forEach(effect => effect.stop()); }
  dispose() { Object.values(this.effects).forEach(effect => effect.dispose()); }
}
