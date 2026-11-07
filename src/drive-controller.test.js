import test from 'node:test';
import assert from 'node:assert/strict';
import { createDriveController } from './drive-controller.js';

function setup(index = 0) {
  let time = 0, selected = index;
  const visits = [];
  const driver = createDriveController({ getIndex: () => selected, getLength: () => 5,
    now: () => time, go: i => { selected = i; visits.push(i); } });
  return { driver, visits, advance: ms => { time += ms; } };
}
test('repeated travel input is ignored and arrival unlocks immediately', () => {
  const { driver, visits, advance } = setup();
  assert.equal(driver.step(1), true);
  for (let i = 0; i < 30; i++) assert.equal(driver.step(1), false);
  advance(2000); assert.equal(driver.step(1), false); // arrival, not a timer, unlocks travel
  driver.arrive(); assert.equal(driver.step(1), true);
  assert.deepEqual(visits, [1, 2]);
});
test('the approach window allows exactly one continuation, and reversal uses the last passed stop', () => {
  const { driver, visits } = setup();
  driver.step(1); assert.equal(driver.step(1), false);
  driver.approach(); assert.equal(driver.step(1), true);
  assert.equal(driver.step(1), false);
  driver.passed(1); assert.equal(driver.step(-1), true);
  assert.equal(driver.step(-1), false);
  assert.deepEqual(visits, [1, 2, 1]);
});
test('one reversal returns to departure and all further input waits for arrival', () => {
  for (const direction of [-1, 1]) {
    const { driver, visits, advance } = setup(2);
    driver.step(direction); assert.equal(driver.step(-direction), true);
    assert.equal(driver.step(-direction), false); assert.equal(driver.step(direction), false);
    assert.equal(driver.to(4), false); assert.deepEqual(visits, [2 + direction, 2]);
    driver.arrive(); advance(500); assert.equal(driver.step(-direction), true);
  }
});
test('direct destinations share the lock and reset allows a new route', () => {
  const { driver, visits } = setup();
  assert.equal(driver.step(-1), false); assert.equal(driver.to(NaN), false);
  driver.to(3); assert.equal(driver.to(4), false); driver.to(0);
  assert.deepEqual(visits, [3, 0]); driver.arrive(); driver.reset();
  assert.equal(driver.to(4), true);
});
test('clicked stops cannot retarget a trip, including its approach window', () => {
  const { driver, visits } = setup();
  assert.equal(driver.selectStop(3), true);
  assert.equal(driver.selectStop(1), false);
  assert.equal(driver.selectStop(0), false);
  driver.approach();
  assert.equal(driver.selectStop(4), false);
  assert.deepEqual(visits, [3]);
  // The existing one-time keyboard reversal remains available.
  assert.equal(driver.step(-1), true);
  assert.equal(driver.selectStop(4), false);
  driver.arrive();
  assert.equal(driver.selectStop(4), true);
  assert.deepEqual(visits, [3, 0, 4]);
});
