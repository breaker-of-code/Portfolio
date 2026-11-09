import test from 'node:test';
import assert from 'node:assert/strict';
import * as THREE from 'three';
import { batchStaticMeshes } from './mesh-batching.js';

test('batching preserves transformed bounds and picking under a moving landmark root', () => {
  const scene = new THREE.Scene(), root = new THREE.Group(); scene.add(root);
  root.position.set(6, 2, -3); root.rotation.y = .4; root.userData.stop = 2;
  const material = new THREE.MeshStandardMaterial();
  for (let i = 0; i < 8; i++) {
    const group = new THREE.Group(); group.position.set(i * .2, i * .15, 0); group.rotation.z = i * .1; root.add(group);
    const mesh = new THREE.Mesh(new THREE.BoxGeometry(.8, .5, .4), material); mesh.castShadow = true; group.add(mesh);
  }
  const before = new THREE.Box3().setFromObject(root);
  const stats = batchStaticMeshes(root, { cellSize: Infinity });
  const after = new THREE.Box3().setFromObject(root);
  assert.equal(stats.savedDraws, 7);
  assert.ok(before.min.distanceTo(after.min) < 1e-6 && before.max.distanceTo(after.max) < 1e-6);
  root.position.x += 3; root.updateMatrixWorld(true);
  const center = after.getCenter(new THREE.Vector3()); center.x += 3;
  const ray = new THREE.Raycaster(center.clone().add(new THREE.Vector3(0, 0, 10)), new THREE.Vector3(0, 0, -1));
  const hit = ray.intersectObject(root, true)[0];
  assert.ok(hit); assert.equal(hit.object.parent.userData.stop, 2);
  root.traverse(object => object.geometry?.dispose()); material.dispose();
});

test('dynamic bays, transparent objects, material changes and distant culling remain separate', () => {
  const root = new THREE.Group(), material = new THREE.MeshStandardMaterial();
  const bay = new THREE.Group(); root.add(bay); const excluded = new Set([bay]);
  for (const x of [1, 2, 30, 31]) { const mesh = new THREE.Mesh(new THREE.BoxGeometry(), material); mesh.position.x = x; root.add(mesh); }
  const selected = new THREE.Mesh(new THREE.BoxGeometry(), material); bay.add(selected);
  const transparent = new THREE.Mesh(new THREE.PlaneGeometry(), new THREE.MeshBasicMaterial({ transparent: true, opacity: .3 })); root.add(transparent);
  const stats = batchStaticMeshes(root, { exclude: excluded });
  assert.equal(stats.batches, 2); assert.equal(stats.savedDraws, 2);
  assert.equal(selected.parent, bay); assert.equal(transparent.parent, root);
  selected.material = new THREE.MeshBasicMaterial({ color: 'gold' });
  assert.notEqual(selected.material, material);
  root.traverse(object => { object.geometry?.dispose(); });
  selected.material.dispose(); transparent.material.dispose(); material.dispose();
});
