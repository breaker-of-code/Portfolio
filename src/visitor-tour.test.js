import test from 'node:test';
import assert from 'node:assert/strict';
import * as THREE from 'three';
import { createBounceNavigator, createIdleTour } from './visitor-tour.js';
import { CoastalScene } from './scene.js';

function clock() {
  let now = 0, nextId = 0; const tasks = new Map();
  return {
    schedule(fn, delay) { const id = ++nextId; tasks.set(id, { at: now + delay, fn }); return id; },
    cancel(id) { tasks.delete(id); },
    tick(ms) {
      const end = now + ms;
      while (true) {
        const next = [...tasks.entries()].filter(([, task]) => task.at <= end).sort((a, b) => a[1].at - b[1].at)[0];
        if (!next) break;
        now = next[1].at; tasks.delete(next[0]); next[1].fn();
      }
      now = end;
    },
    get pending() { return tasks.size; },
  };
}

test('Jeep taps bounce at both ends and cannot change direction or retarget during travel', () => {
  let index = 0, busy = false, length = 4; const visits = [];
  const bounce = createBounceNavigator({ getIndex: () => index, getLength: () => length, isBusy: () => busy,
    go: target => { index = target; visits.push(index); return true; } });
  for (let i = 0; i < 3; i++) bounce.step();
  busy = true; assert.equal(bounce.step(), false); assert.equal(index, 3);
  busy = false;
  for (let i = 0; i < 4; i++) bounce.step();
  assert.deepEqual(visits, [1, 2, 3, 2, 1, 0, 1]);
  bounce.reset(); index = 1; assert.equal(bounce.step(), true); assert.equal(index, 2);
  length = 1; index = 0; assert.equal(bounce.step(), false);
  length = 0; assert.equal(bounce.step(), false);
});

test('untouched tour moves at 30-second intervals, bounces, and stops forever on input', () => {
  const timer = clock(); let index = 0; const visits = [];
  const bounce = createBounceNavigator({ getIndex: () => index, getLength: () => 3, isBusy: () => false,
    go: next => { index = next; visits.push(index); return true; } });
  const tour = createIdleTour({ advance: () => bounce.step(), canAdvance: () => true, schedule: timer.schedule, cancel: timer.cancel });
  tour.start(); tour.start(); assert.equal(timer.pending, 1);
  timer.tick(29999); assert.deepEqual(visits, []);
  timer.tick(1); assert.deepEqual(visits, [1]);
  timer.tick(120000); assert.deepEqual(visits, [1, 2, 1, 0, 1]);
  tour.interact(); timer.tick(600000); tour.start();
  assert.equal(tour.interacted, true); assert.equal(timer.pending, 0); assert.equal(visits.length, 5);
});

test('an interaction during loading prevents the hint/tour from starting later', () => {
  const timer = clock(); let moves = 0;
  const tour = createIdleTour({ advance: () => moves++, canAdvance: () => true, schedule: timer.schedule, cancel: timer.cancel });
  tour.interact(); tour.start(); timer.tick(90000);
  assert.equal(tour.interacted, true); assert.equal(moves, 0); assert.equal(timer.pending, 0);
});

test('background/portrait pauses restart a full interval without catch-up travel', () => {
  const timer = clock(); let moves = 0;
  const tour = createIdleTour({ advance: () => moves++, canAdvance: () => true, schedule: timer.schedule, cancel: timer.cancel });
  tour.start(); timer.tick(17000); tour.setPaused(true); timer.tick(120000);
  assert.equal(moves, 0); tour.setPaused(false); timer.tick(29999); assert.equal(moves, 0);
  timer.tick(1); assert.equal(moves, 1);
  tour.dispose(); timer.tick(90000); assert.equal(moves, 1); assert.equal(timer.pending, 0);
});

test('tour skips an unavailable frame instead of overriding travel or a dialog', () => {
  const timer = clock(); let ready = false, moves = 0;
  const tour = createIdleTour({ advance: () => moves++, canAdvance: () => ready, schedule: timer.schedule, cancel: timer.cancel });
  tour.start(); timer.tick(30000); assert.equal(moves, 0);
  ready = true; timer.tick(30000); assert.equal(moves, 1);
  tour.dispose();
});

test('Jeep picking hits nested batched geometry, and rejects water or coordinates outside the canvas', () => {
  const camera = new THREE.OrthographicCamera(-5, 5, 5, -5, .1, 50);
  camera.position.set(0, 0, 10); camera.lookAt(0, 0, 0); camera.updateProjectionMatrix();
  const car = new THREE.Group(), body = new THREE.Group(); car.add(body);
  const mesh = new THREE.InstancedMesh(new THREE.BoxGeometry(1, 1, 1), new THREE.MeshBasicMaterial(), 1);
  mesh.setMatrixAt(0, new THREE.Matrix4().makeTranslation(2, 0, 0)); body.add(mesh);
  const scene = { car, camera, canvas: { getBoundingClientRect: () => ({ left: 0, top: 0, right: 100, bottom: 100, width: 100, height: 100 }) },
    pointer: new THREE.Vector2(), raycaster: new THREE.Raycaster(), setPickRay: CoastalScene.prototype.setPickRay };
  assert.equal(CoastalScene.prototype.pickCar.call(scene, 70, 50), true);
  assert.equal(CoastalScene.prototype.pickCar.call(scene, 50, 50), false);
  assert.equal(CoastalScene.prototype.pickCar.call(scene, 150, 50), false);
  mesh.geometry.dispose(); mesh.material.dispose(); mesh.dispose();
});
