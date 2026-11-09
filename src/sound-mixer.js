// Balanced mix: quiet coast, restrained idle, clear driving and brief interface cues.
export const INITIAL_SOUND_LEVELS = { master: .8, ocean: .135, engine: .38, splash: .5, ui: .35 };

export function createSoundMixer(context, initial = INITIAL_SOUND_LEVELS) {
  const levels = { ...INITIAL_SOUND_LEVELS, ...initial }, channels = {};
  const master = context.createGain(), limiter = context.createDynamicsCompressor();
  master.gain.value = levels.master;
  limiter.threshold.value = -3; limiter.knee.value = 0; limiter.ratio.value = 20;
  limiter.attack.value = .003; limiter.release.value = .15;
  master.connect(limiter); limiter.connect(context.destination);
  for (const name of ['ocean', 'engine', 'splash', 'ui']) {
    const channel = context.createGain(); channel.gain.value = levels[name];
    channel.connect(master); channels[name] = channel;
  }
  let muted = false;
  return {
    channels,
    setMuted(value) {
      muted = Boolean(value);
      master.gain.setTargetAtTime(muted ? 0 : levels.master, context.currentTime, .025);
    },
    setLevel(name, value) {
      if (!Object.hasOwn(levels, name) || !Number.isFinite(value) || name !== 'master' && !channels[name]) return;
      levels[name] = Math.max(0, Math.min(1, value));
      const node = name === 'master' ? master : channels[name];
      node.gain.setTargetAtTime(name === 'master' && muted ? 0 : levels[name], context.currentTime, .025);
    },
    dispose() { Object.values(channels).forEach(channel => channel.disconnect()); master.disconnect(); limiter.disconnect(); },
  };
}
