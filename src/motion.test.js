import test from 'node:test';
import assert from 'node:assert/strict';
import { drivingProgress, advanceDriving } from './motion.js';
test('starts slowly, accelerates, and brakes at the destination', () => {
  assert.equal(drivingProgress(0), 0); assert.equal(drivingProgress(1), 1);
  const first = drivingProgress(0.1), cruise = drivingProgress(0.5) - drivingProgress(0.4), last = 1 - drivingProgress(0.9);
  assert.ok(cruise > first * 3); assert.ok(cruise > last * 3);
});
test('physical travel accelerates, brakes, and arrives without overshooting in either direction', () => {
  for (const direction of [-1, 1]) {
    let position = 0, speed = 0, peak = 0, arrived = false;
    for (let frame = 0; frame < 600; frame++) {
      const step = advanceDriving(position, speed, direction * 9.5, 1 / 60);
      assert.ok(direction * step.position >= direction * position);
      assert.ok(Math.abs(step.position) <= 9.5);
      ({ position, speed, arrived } = step); peak = Math.max(peak, Math.abs(speed));
      if (arrived) break;
    }
    assert.ok(arrived); assert.equal(position, direction * 9.5); assert.equal(speed, 0); assert.ok(peak > 6);
  }
});
test('extending the destination preserves motion through the intermediate stop', () => {
  let position = 0, speed = 0, destination = 8, extended = false, crossingSpeed = 0;
  for (let frame = 0; frame < 600; frame++) {
    if (!extended && speed > 0 && 2 * (8 - position) / speed <= .25) { destination = 16; extended = true; }
    const step = advanceDriving(position, speed, destination, 1 / 60);
    if (position < 8 && step.position >= 8) crossingSpeed = step.speed;
    ({ position, speed } = step);
    if (step.arrived) break;
  }
  assert.ok(extended); assert.ok(crossingSpeed > 2); assert.equal(position, 16);
});
test('the travel profile never reverses or overshoots', () => {
  let previous = 0;
  for (let i = 0; i <= 1000; i++) { const p = drivingProgress(i / 1000); assert.ok(p >= previous && p <= 1); previous = p; }
  assert.equal(drivingProgress(-1), 0); assert.equal(drivingProgress(2), 1);
});
