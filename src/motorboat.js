import * as THREE from 'three';

export function createMotorboat(b) {
  const model = new THREE.Group(); model.name = 'Modern white cabin motorboat';
  const white = 0xfff4df, navy = 0x254853, glass = 0x65b9c5;
  const box = (size, at, color, bevel = .035) => b.box(model, size, at, color, bevel);
  const outline = [[-2.25, -.85], [.9, -.85], [1.85, -.55], [2.45, 0], [1.85, .55], [.9, .85], [-2.25, .85]];
  const vertices = [], indices = [];
  for (const [x, z] of outline) vertices.push(x, .4, z);
  for (const [x, z] of outline) vertices.push(x * .9, -.45, z * .65);
  const n = outline.length;
  for (let i = 0; i < n; i++) { const j = (i + 1) % n; indices.push(i, j, n + i, j, n + j, n + i); }
  for (let i = 1; i < n - 1; i++) indices.push(0, i, i + 1, n, n + i + 1, n + i);
  const hull = new THREE.BufferGeometry(); hull.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3)); hull.setIndex(indices); hull.computeVertexNormals();
  b.mesh(hull, white, model, { side: THREE.DoubleSide });
  for (let i = 0; i < n; i++) {
    const a = outline[i], c = outline[(i + 1) % n];
    b.polygon(model, [[a[0] * .985, .15, a[1] * .94], [c[0] * .985, .15, c[1] * .94], [c[0] * .972, .04, c[1] * .9], [a[0] * .972, .04, a[1] * .9]], navy);
  }
  box([3.18, .1, 1.45], [-.5, .46, 0], 0xd7ba87);
  box([.73, .23, 1.21], [-1.55, .66, 0], white, .08);
  box([.19, .54, 1.22], [-1.84, .89, 0], white, .055);
  for (const side of [-1, 1]) {
    box([.65, .16, .44], [-.28, .76, side * .38], white, .06);
    box([.12, .5, .45], [-.55, .98, side * .38], white, .055);
    b.polygon(model, [[.9, .59, side * .65], [.63, 1.38, side * .65], [-.68, 1.38, side * .65], [-.8, .59, side * .65]], glass, { roughness: .3 });
    b.beam(model, [-.72, .52, side * .64], [-.66, 1.64, side * .64], .035, navy);
    b.beam(model, [.9, .54, side * .64], [.62, 1.64, side * .64], .035, navy);
  }
  b.polygon(model, [[.93, .62, -.65], [.93, .62, .65], [.64, 1.4, .65], [.64, 1.4, -.65]], glass, { roughness: .25 });
  box([1.75, .13, 1.46], [-.05, 1.67, 0], white, .065);
  box([.35, .06, .48], [-.05, 1.76, 0], navy, .02);
  box([.34, .77, .45], [-2.37, .01, 0], navy, .055);
  box([.64, .055, .6], [-2.42, -.37, 0], navy, .025);
  const bowRail = [[.98, .76, -.76], [1.8, .76, -.5], [2.27, .76, 0], [1.8, .76, .5], [.98, .76, .76]];
  for (let i = 0; i < bowRail.length - 1; i++) b.beam(model, bowRail[i], bowRail[i + 1], .025, white);
  for (const at of bowRail) b.beam(model, [at[0], .42, at[2]], at, .022, white);
  for (const x of [-1.3, 1.1]) b.cylinder(model, .12, .12, .43, [x, .19, -.94], 0xe3ddd1, 10);
  return model;
}
