import test from 'node:test';
import assert from 'node:assert/strict';
import { AdaptiveQuality, initialQuality, cappedPixelRatio } from './quality.js';

test('limited hardware starts conservatively and high-DPI screens respect device caps', () => {
  assert.equal(initialQuality({ mobile: true, cores: 8, memory: 8 }), 'medium');
  assert.equal(initialQuality({ cores: 4, memory: 8 }), 'low');
  assert.equal(initialQuality({ cores: 8, memory: 4 }), 'low');
  assert.equal(initialQuality(), 'high');
  assert.equal(cappedPixelRatio(3, 'high', false), 1.5);
  assert.equal(cappedPixelRatio(3, 'high', true), 1.25);
  assert.equal(cappedPixelRatio(2, 'low', true), 1);
  assert.equal(cappedPixelRatio(1, 'high', false), 1);
});

test('sustained slow frames lower quality while warmup and hidden intervals do not', () => {
  const quality = new AdaptiveQuality('high');
  const changes = [];
  for (let now = 40; now <= 22000; now += 40) {
    const change = quality.sample(40, now);
    if (change) changes.push([now, change]);
  }
  assert.deepEqual(changes.map(([, level]) => level), ['medium', 'low']);
  assert.ok(changes[0][0] >= 7000);
  assert.ok(changes[1][0] - changes[0][0] >= 7000);
  const hidden = new AdaptiveQuality('high');
  for (let now = 100; now <= 20000; now += 100) assert.equal(hidden.sample(100, now, false), null);
  assert.equal(hidden.level, 'high');
  assert.equal(hidden.sample(5000, 25000), null);
  assert.equal(hidden.sample(100, 26000), null);
});

test('quality recovers gradually after a long stable period without oscillating', () => {
  const quality = new AdaptiveQuality('low');
  const changes = [];
  for (let now = 16; now <= 68000; now += 16) {
    const change = quality.sample(16, now);
    if (change) changes.push([now, change]);
  }
  assert.deepEqual(changes.map(([, level]) => level), ['medium', 'high']);
  assert.ok(changes[0][0] >= 30000);
  assert.ok(changes[1][0] - changes[0][0] >= 30000);
});
