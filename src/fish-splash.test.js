import test from 'node:test';
import assert from 'node:assert/strict';
import * as THREE from 'three';
import { CoastalOcean } from './ocean.js';

test('fish landing emits one splash per flight, with no fake splash when a route initializes mid-cycle', () => {
  let splashes = 0;
  const fish = { phase: 0, period: 4.4, x: 0, z: 12, height: 1,
    root: new THREE.Object3D(), ring: new THREE.Object3D(),
    droplets: { setMatrixAt() {}, instanceMatrix: {} }, splashMaterial: {} };
  const ocean = { time: {}, profile: { sceneryHz: 60 }, jumpers: [fish], dummy: new THREE.Object3D(),
    builder: { fishSplash() { splashes++; } }, surfaceAt: () => ({ height: 0 }) };
  for (const time of [2, 3, 4.5, 5.7, 5.75, 6]) CoastalOcean.prototype.update.call(ocean, time);
  assert.equal(splashes, 1);
  for (const time of [8.9, 9.9, 10.1, 10.2]) CoastalOcean.prototype.update.call(ocean, time);
  assert.equal(splashes, 2);
});
