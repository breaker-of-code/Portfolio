import test from 'node:test';
import assert from 'node:assert/strict';
import { drivingProgress } from './motion.js';
test('starts slowly, accelerates, and brakes at the destination', () => {
  assert.equal(drivingProgress(0), 0); assert.equal(drivingProgress(1), 1);
  const first = drivingProgress(0.1), cruise = drivingProgress(0.5) - drivingProgress(0.4), last = 1 - drivingProgress(0.9);
  assert.ok(cruise > first * 3); assert.ok(cruise > last * 3);
});
test('the travel profile never reverses or overshoots', () => {
  let previous = 0;
  for (let i = 0; i <= 1000; i++) { const p = drivingProgress(i / 1000); assert.ok(p >= previous && p <= 1); previous = p; }
  assert.equal(drivingProgress(-1), 0); assert.equal(drivingProgress(2), 1);
});
