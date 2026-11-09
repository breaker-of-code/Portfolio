import test from 'node:test';
import assert from 'node:assert/strict';
import * as THREE from 'three';
import { OCEAN_GRID, oceanVertexHeight, oceanSurface } from './ocean-waves.js';
import { createOceanGrid, createOceanGeometry } from './ocean-grid.js';
import { QUALITY_PROFILES } from './quality.js';

test('broad offshore swells have visible height while the water beneath the island stays calm', () => {
  for (const halfLength of [24, 60]) {
    for (const time of [0, 3, 12]) {
      assert.ok(Math.abs(oceanVertexHeight(halfLength - 1, 0, time, halfLength)) === 0);
      assert.ok(Math.abs(oceanVertexHeight(0, 7, time, halfLength)) === 0);
    }
  }
  const heights = Array.from({ length: 100 }, (_, i) => oceanVertexHeight(10, 30, i * 0.3, 24));
  assert.ok(Math.max(...heights) - Math.min(...heights) > 2.0, 'offshore water should still move');
  assert.ok(heights.every(height => Math.abs(height) <= 2.0));
});

test('all water quality levels use a continuous fine-to-coarse grid and keep boats on the rendered surface', () => {
  const time = 4.7, halfLength = 24;
  let previousTriangles = 0;
  for (const profile of Object.values(QUALITY_PROFILES)) {
    const grid = createOceanGrid(halfLength, profile), geometry = createOceanGeometry(grid);
    const triangles = geometry.index.count / 3;
    assert.ok(triangles < 240 * 240 * 2 * .45);
    assert.ok(triangles > previousTriangles); previousTriangles = triangles;
    const gaps = Array.from(grid.x.slice(1), (value, i) => value - grid.x[i]);
    assert.ok(gaps.every(gap => gap > 0));
    assert.ok(Math.max(...gaps) > profile.nearStep * 2);
    assert.ok(geometry.index.array.every(index => index < geometry.attributes.position.count));
    const positions = geometry.attributes.position;
    for (let i = 0; i < positions.count; i++) positions.setY(i, oceanVertexHeight(positions.getX(i), positions.getZ(i), time, halfLength));
    const material = new THREE.MeshBasicMaterial({ side: THREE.DoubleSide }), mesh = new THREE.Mesh(geometry, material); mesh.updateMatrixWorld();
    for (const [x, z] of [[.3, 11.8], [-18.8, -13.7], [35.4, 15.5], [50.1, 30.2], [80, 80], [-190, 150]]) {
      const hit = new THREE.Raycaster(new THREE.Vector3(x, 10, z), new THREE.Vector3(0, -1, 0)).intersectObject(mesh)[0];
      assert.ok(hit); assert.ok(Math.abs(hit.point.y - oceanSurface(x, z, time, halfLength, grid).height) < 1e-5);
    }
    geometry.dispose(); material.dispose();
  }
});

test('boat and fish surface samples match the displaced triangular water mesh', () => {
  const time = 4.7, halfLength = 24;
  const geometry = new THREE.PlaneGeometry(OCEAN_GRID.size, OCEAN_GRID.size, OCEAN_GRID.columns, OCEAN_GRID.rows);
  geometry.rotateX(-Math.PI / 2);
  const position = geometry.getAttribute('position');
  for (let i = 0; i < position.count; i++) position.setY(i, oceanVertexHeight(position.getX(i), position.getZ(i), time, halfLength));
  const material = new THREE.MeshBasicMaterial({ side: THREE.DoubleSide });
  const mesh = new THREE.Mesh(geometry, material);
  mesh.updateMatrixWorld();
  for (const [x, z] of [[0.3, 11.8], [-18.8, -13.7], [35.4, 15.5], [0, 30], [50.1, 30.2], [-22.4, 8.8]]) {
    const hit = new THREE.Raycaster(new THREE.Vector3(x, 10, z), new THREE.Vector3(0, -1, 0)).intersectObject(mesh)[0];
    assert.ok(hit, 'sample lies on water');
    const surface = oceanSurface(x, z, time, halfLength);
    assert.ok(Math.abs(hit.point.y - surface.height) < 0.00001, `height mismatch at ${x}, ${z}`);
    assert.ok(Number.isFinite(surface.slopeX) && Number.isFinite(surface.slopeZ));
  }
  geometry.dispose(); material.dispose();
});

