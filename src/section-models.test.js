import test from 'node:test';
import assert from 'node:assert/strict';
import * as THREE from 'three';
import { CoastalScene } from './scene.js';
import { createProjectIcon } from './project-icons.js';
import { createCareerBuilding } from './career-building.js';
import { createJeep } from './jeep.js';
import { batchStaticMeshes } from './mesh-batching.js';

test('every lazy section model builds valid geometry and still batches under its animated root', async () => {
  const builder = Object.create(CoastalScene.prototype);
  builder.materials = new Map(); builder.world = new THREE.Group();
  for (const create of [
    ...['space', 'puzzle', 'race', 'arena'].map(type => () => createProjectIcon(builder, type)),
    ...Array.from({ length: 5 }, (_, variant) => () => createCareerBuilding(builder, variant)),
  ]) {
    const model = create(), before = new THREE.Box3().setFromObject(model);
    assert.ok(!before.isEmpty()); assert.ok(before.min.toArray().every(Number.isFinite));
    const stats = batchStaticMeshes(model, { cellSize: Infinity });
    const after = new THREE.Box3().setFromObject(model);
    assert.ok(stats.savedDraws > 0);
    assert.ok(before.min.distanceTo(after.min) < 1e-5 && before.max.distanceTo(after.max) < 1e-5);
    model.traverse(object => object.geometry?.dispose());
  }
  builder.materials.forEach(material => material.dispose());
});

test('Jeep batching leaves the suspension and rotating wheel roots independent', () => {
  const builder = Object.create(CoastalScene.prototype); builder.materials = new Map(); builder.world = new THREE.Group();
  const car = createJeep(builder, 'open'), body = car.userData.body, wheels = car.userData.wheels;
  const before = new THREE.Box3().setFromObject(car);
  let saved = batchStaticMeshes(body, { cellSize: Infinity }).savedDraws;
  for (const wheel of wheels) saved += batchStaticMeshes(wheel, { cellSize: Infinity }).savedDraws;
  const after = new THREE.Box3().setFromObject(car);
  assert.ok(saved > 80);
  assert.ok(before.min.distanceTo(after.min) < 1e-5 && before.max.distanceTo(after.max) < 1e-5);
  assert.ok(wheels.every(wheel => wheel.parent === car && wheel.children.length > 0));
  body.position.y = .01; wheels[0].rotation.z = .5;
  assert.equal(wheels[0].position.y, .56); assert.equal(body.rotation.z, 0);
  car.traverse(object => object.geometry?.dispose()); builder.materials.forEach(material => material.dispose());
});
