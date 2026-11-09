import test from 'node:test';
import assert from 'node:assert/strict';
import { AmbientLoop } from './ambient-loop.js';
import { createSoundMixer } from './sound-mixer.js';
import { SoundEffect } from './sound-effect.js';
import { readSoundPreference, saveSoundPreference } from './sound-preference.js';
import { InterfaceSounds } from './interface-sounds.js';

function context() {
  const sources = [], gains = [];
  const param = () => ({ value: 0, setValueAtTime(value) { this.value = value; }, setTargetAtTime(value) { this.value = value; }, linearRampToValueAtTime(value) { this.value = value; } });
  const node = () => ({ connected: null, connect(to) { this.connected = to; }, disconnect() { this.connected = null; } });
  return { state: 'running', currentTime: 0, destination: {}, sources, gains,
    createGain() { const gain = { ...node(), gain: param() }; gains.push(gain); return gain; },
    createDynamicsCompressor() { return { ...node(), threshold: param(), knee: param(), ratio: param(), attack: param(), release: param() }; },
    createBufferSource() { const source = { ...node(), playbackRate: param(), starts: 0, start() { this.starts++; }, stop() { this.stopped = true; } }; sources.push(source); return source; },
    decodeAudioData: async bytes => ({ bytes }),
  };
}
const response = { ok: true, arrayBuffer: async () => new ArrayBuffer(8) };

test('ambience stays unloaded until requested, shares concurrent loads and never creates duplicate loops', async () => {
  const ctx = context(); let requests = 0;
  const loop = new AmbientLoop(ctx, {}, { load: async () => { requests++; return response; } });
  assert.equal(requests, 0);
  await Promise.all([loop.start(), loop.start()]); await loop.start();
  assert.equal(requests, 1); assert.equal(ctx.sources.length, 1);
  assert.equal(ctx.sources[0].loop, true); assert.equal(ctx.sources[0].starts, 1);
  loop.dispose(); assert.equal(ctx.sources[0].stopped, true);
});

test('the default loader does not call browser fetch with the loop instance as its receiver', async () => {
  const original = globalThis.fetch;
  globalThis.fetch = async function () { assert.equal(this, undefined); return response; };
  const loop = new AmbientLoop(context(), {});
  try { await loop.start(); assert.ok(loop.source); }
  finally { loop.dispose(); globalThis.fetch = original; }
});

test('idle state changes during decoding are applied when playback starts and fade independently of other channels', async () => {
  const ctx = context(); let finish;
  ctx.decodeAudioData = () => new Promise(resolve => { finish = resolve; });
  const loop = new AmbientLoop(ctx, {}, { load: async () => response, fadeIn: .2 });
  const pending = loop.start();
  while (!finish) await Promise.resolve();
  loop.setLevel(0); finish({ duration: 7 }); await pending;
  assert.equal(loop.fade.gain.value, 0);
  loop.setLevel(1); assert.equal(loop.fade.gain.value, 1);
  loop.setLevel(0); assert.equal(loop.fade.gain.value, 0);
  assert.equal(ctx.sources.length, 1, 'fading does not create extra playback sources');
  loop.dispose();
});

test('ambience falls back to PCM and failed downloads can retry', async () => {
  const ctx = context(), requested = []; let offline = true;
  const loop = new AmbientLoop(ctx, {}, { load: async url => {
    requested.push(url);
    if (offline || url.endsWith('.m4a')) throw new Error('Unavailable');
    return response;
  } });
  await assert.rejects(loop.start(), /Unavailable/);
  offline = false; await loop.start();
  assert.ok(requested.at(-1).endsWith('.wav')); assert.equal(ctx.sources.length, 1);
  loop.dispose();
});

test('a short trip finishing during decode cannot leave the driving engine audible', async () => {
  const ctx = context(); let finish;
  ctx.decodeAudioData = () => new Promise(resolve => { finish = resolve; });
  const loop = new AmbientLoop(ctx, {}, { load: async () => response, level: 0, fadeIn: .08, fadeTime: .035 });
  const pending = loop.start();
  while (!finish) await Promise.resolve();
  loop.setLevel(1); loop.setPlaybackRate(1.4);
  loop.setLevel(0); loop.setPlaybackRate(.65);
  finish({ duration: 5 }); await pending;
  assert.equal(loop.fade.gain.value, 0);
  assert.equal(loop.source.playbackRate.value, .65);
  loop.setLevel(.6); loop.setPlaybackRate(.8);
  loop.setPlaybackRate(1.2); loop.setPlaybackRate(.7); loop.setLevel(0);
  assert.equal(loop.source.playbackRate.value, .7);
  assert.equal(loop.fade.gain.value, 0);
  assert.equal(ctx.sources.length, 1, 'speed changes and further trips reuse the decoded loop');
  loop.setPlaybackRate(NaN); assert.equal(loop.source.playbackRate.value, .7);
  loop.dispose();
});

test('leaving the page while decoding cannot start or retain an orphaned audio loop', async () => {
  const ctx = context(); let finish;
  ctx.decodeAudioData = () => new Promise(resolve => { finish = resolve; });
  const loop = new AmbientLoop(ctx, {}, { load: async () => response });
  const pending = loop.start();
  while (!finish) await Promise.resolve();
  loop.dispose(); finish({ duration: 9 }); await pending;
  assert.equal(ctx.sources.length, 0); assert.equal(loop.buffer, null);
});

test('mix channels stay independent, master mute stays silent during level changes and values are clamped', () => {
  const ctx = context(), mixer = createSoundMixer(ctx);
  assert.notEqual(mixer.channels.ocean, mixer.channels.engine);
  assert.equal(mixer.channels.ocean.gain.value, .135 * .6, 'ocean is 60% of its previously approved level');
  mixer.setLevel('ocean', .3); assert.equal(mixer.channels.ocean.gain.value, .3);
  assert.equal(mixer.channels.engine.gain.value, .38);
  mixer.setMuted(true); mixer.setLevel('master', .9); assert.equal(ctx.gains[0].gain.value, 0);
  mixer.setMuted(false); assert.equal(ctx.gains[0].gain.value, .9);
  mixer.setLevel('splash', 2); assert.equal(mixer.channels.splash.gain.value, 1);
  mixer.setLevel('splash', NaN); assert.equal(mixer.channels.splash.gain.value, 1);
  assert.doesNotThrow(() => mixer.setLevel('constructor', 1));
  mixer.dispose(); assert.equal(mixer.channels.ocean.connected, null);
});

test('mute persists after reopening, defaults on for new visitors, and works when storage is denied', () => {
  const values = new Map(), storage = { getItem: key => values.get(key) ?? null, setItem: (key, value) => values.set(key, value) };
  assert.equal(readSoundPreference(storage), true);
  saveSoundPreference(false, storage); assert.equal(readSoundPreference(storage), false);
  saveSoundPreference(true, storage); assert.equal(readSoundPreference(storage), true);
  const denied = { getItem() { throw Error('Denied'); }, setItem() { throw Error('Denied'); } };
  assert.equal(readSoundPreference(denied), true);
  assert.doesNotThrow(() => saveSoundPreference(false, denied));
});

test('fish effects reuse one download, play only when ready and running, and stop all active voices on cleanup', async () => {
  const ctx = context(); let requests = 0;
  const effect = new SoundEffect(ctx, {}, { load: async () => { requests++; return response; } });
  assert.equal(effect.play(), false, 'an early landing is not queued to play late');
  await Promise.all([effect.prepare(), effect.prepare()]); assert.equal(requests, 1);
  assert.equal(effect.play({ level: .65 }), true); assert.equal(effect.play(), true);
  assert.equal(effect.play(), false, 'overlapping splashes have a bounded voice count');
  ctx.state = 'suspended'; assert.equal(effect.play(), false);
  effect.stop(); assert.equal(effect.voices.size, 0);
  assert.ok(ctx.sources.every(source => source.stopped && source.connected === null));
  ctx.state = 'running'; assert.equal(effect.play(), true);
  effect.dispose(); assert.equal(effect.voices.size, 0); assert.equal(effect.play(), false);
});

test('interface cues never play late after loading, reject rapid repeats, and clean up active sounds', async () => {
  const ctx = context(), requested = [];
  const sounds = new InterfaceSounds(ctx, {}, { load: async url => { requested.push(url); return response; } });
  assert.equal(sounds.play('arrival'), false);
  await sounds.prepare(); assert.equal(requested.length, 3);
  assert.equal(ctx.sources.length, 0, 'preloading does not queue an old arrival');
  assert.equal(sounds.play('click'), true); assert.equal(sounds.play('click'), false);
  assert.equal(sounds.play('arrival'), true); assert.equal(sounds.play('transition'), true);
  assert.equal(sounds.play('constructor'), false);
  sounds.stop(); assert.ok(ctx.sources.every(source => source.stopped));
  ctx.currentTime = 1; assert.equal(sounds.play('click'), true);
  sounds.dispose(); assert.equal(sounds.play('arrival'), false);
});
