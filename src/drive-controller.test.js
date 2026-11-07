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
test('repeated travel input is ignored and arrival has a 500ms cooldown', () => {
  const { driver, visits, advance } = setup();
  assert.equal(driver.step(1), true);
  for (let i = 0; i < 30; i++) assert.equal(driver.step(1), false);
  advance(2000); assert.equal(driver.step(1), false); // arrival, not a timer, unlocks travel
  driver.arrive(); advance(499); assert.equal(driver.step(1), false);
  advance(1); assert.equal(driver.step(1), true);
  assert.deepEqual(visits, [1, 2]);
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
