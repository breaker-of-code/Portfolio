import * as THREE from 'three';

function axis(nearExtent, nearStep, farStep, halfSize) {
  const nearCount = Math.ceil(nearExtent / nearStep), edge = nearCount * nearStep;
  const positive = Array.from({ length: nearCount + 1 }, (_, i) => i * nearStep);
  let cursor = edge, step = nearStep;
  while (cursor < halfSize) {
    step = Math.min(farStep, step * 1.15);
    cursor = Math.min(halfSize, cursor + step);
    positive.push(cursor);
  }
  return new Float32Array([...positive.slice(1).reverse().map(value => -value), ...positive]);
}

export function createOceanGrid(halfLength, { nearStep = 1.5, farStep = 6 } = {}) {
  const size = Math.max(600, (halfLength + 80) * 2);
  return { size, x: axis(halfLength + 16, nearStep, farStep, size / 2), z: axis(40, nearStep, farStep, size / 2) };
}

// One indexed surface, including the transition cells: no overlapping LOD rings
// or cracks where the fine island water meets the coarse offshore geometry.
export function createOceanGeometry(grid) {
  const columns = grid.x.length, rows = grid.z.length, count = columns * rows;
  const positions = new Float32Array(count * 3), normals = new Float32Array(count * 3), uv = new Float32Array(count * 2);
  const indices = new (count > 65535 ? Uint32Array : Uint16Array)((columns - 1) * (rows - 1) * 6);
  let indexOffset = 0;
  for (let row = 0; row < rows; row++) for (let column = 0; column < columns; column++) {
    const vertex = row * columns + column;
    positions[vertex * 3] = grid.x[column]; positions[vertex * 3 + 2] = grid.z[row]; normals[vertex * 3 + 1] = 1;
    uv[vertex * 2] = (grid.x[column] + grid.size / 2) / grid.size;
    uv[vertex * 2 + 1] = 1 - (grid.z[row] + grid.size / 2) / grid.size;
    if (column < columns - 1 && row < rows - 1) {
      const a = row * columns + column, b = a + 1, c = a + columns, d = c + 1;
      indices.set([a, c, b, c, d, b], indexOffset); indexOffset += 6;
    }
  }
  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  geometry.setAttribute('normal', new THREE.BufferAttribute(normals, 3));
  geometry.setAttribute('uv', new THREE.BufferAttribute(uv, 2));
  geometry.setIndex(new THREE.BufferAttribute(indices, 1));
  geometry.computeBoundingBox(); geometry.boundingBox.min.y = -2.1; geometry.boundingBox.max.y = 2.1;
  geometry.computeBoundingSphere(); geometry.boundingSphere.radius += 2.1;
  return geometry;
}

export function oceanCell(axisValues, value) {
  let left = 0, right = axisValues.length - 1;
  while (right - left > 1) {
    const middle = (left + right) >> 1;
    if (axisValues[middle] <= value) left = middle; else right = middle;
  }
  return [axisValues[left], axisValues[right]];
}
