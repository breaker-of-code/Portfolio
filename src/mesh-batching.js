import * as THREE from 'three';
import { mergeGeometries } from 'three/addons/utils/BufferGeometryUtils.js';

// Bake only opaque, stationary geometry. Animated roots remain independent;
// spatial buckets retain useful frustum culling on long islands.
export function batchStaticMeshes(root, { exclude = new Set(), cellSize = 12 } = {}) {
  root.updateMatrixWorld(true);
  const inverse = root.matrixWorld.clone().invert(), transform = new THREE.Matrix4(), point = new THREE.Vector3();
  const buckets = new Map();
  function visit(object) {
    if (exclude.has(object) || !object.visible) return;
    if (object.isMesh && !object.isInstancedMesh && !object.isSkinnedMesh) {
      const material = object.material, geometry = object.geometry;
      if (!Array.isArray(material) && !material.transparent && material.depthTest && material.depthWrite && !material.map && !object.renderOrder && !geometry.morphAttributes.position && geometry.drawRange.count === Infinity) {
        point.setFromMatrixPosition(object.matrixWorld).applyMatrix4(inverse);
        const schema = Object.entries(geometry.attributes).map(([name, attribute]) => `${name}:${attribute.itemSize}:${attribute.array.constructor.name}:${attribute.normalized}`).sort().join('|');
        const cell = cellSize === Infinity ? 'all' : `${Math.floor(point.x / cellSize)},${Math.floor(point.z / cellSize)}`;
        const key = `${cell}:${material.uuid}:${object.castShadow}:${object.receiveShadow}:${Boolean(geometry.index)}:${schema}`;
        if (!buckets.has(key)) buckets.set(key, []);
        buckets.get(key).push(object);
      }
    }
    object.children.forEach(visit);
  }
  visit(root);
  const retired = new Set(); let removed = 0, batches = 0;
  for (const meshes of buckets.values()) {
    if (meshes.length < 2) continue;
    const copies = meshes.map(mesh => {
      transform.multiplyMatrices(inverse, mesh.matrixWorld);
      return mesh.geometry.clone().applyMatrix4(transform);
    });
    const geometry = mergeGeometries(copies, false);
    copies.forEach(copy => copy.dispose());
    if (!geometry) continue;
    const first = meshes[0], batch = new THREE.Mesh(geometry, first.material);
    batch.name = `Static batch (${meshes.length} parts)`;
    batch.castShadow = first.castShadow; batch.receiveShadow = first.receiveShadow;
    geometry.computeBoundingBox(); geometry.computeBoundingSphere();
    root.add(batch);
    for (const mesh of meshes) { retired.add(mesh.geometry); mesh.removeFromParent(); }
    removed += meshes.length; batches++;
  }
  // Respect geometries still shared by a mesh excluded from batching.
  root.traverse(object => { if (object.geometry) retired.delete(object.geometry); });
  retired.forEach(geometry => geometry.dispose());
  return { sourceMeshes: removed, batches, savedDraws: removed - batches };
}
