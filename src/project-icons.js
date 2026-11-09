import * as THREE from 'three';

const C = { orange: 0xf77b08 };

// Loaded only when the Projects island is opened.
export function createProjectIcon(builder, type) {
  const g = new THREE.Group();
  if (type === 'puzzle') {
      for (const [x, y, col] of [[-0.5, 0.45, 0x44bcd4], [0.5, 0.45, 0xec91aa], [0, 1.4, 0xffcf45]]) { builder.box(g, [0.92, 0.92, 0.92], [x, y, 0], col, 0.05); builder.box(g, [0.4, 0.4, 0.035], [x, y, 0.48], col === 0xffcf45 ? 0xefb631 : col === 0x44bcd4 ? 0x35a9c2 : 0xd97f9a); }
      if (type === 'puzzle') {
        for (const side of [-1, 1]) for (let i = 0; i < 4; i++) builder.box(g, [0.45, 0.46, 0.57], [side * 1.22, 0.23 + i * 0.49, -0.45], i % 2 ? 0xc9b18a : 0xe0c59a, 0.025);
        for (let i = 0; i < 9; i++) {
          const a = i / 9 * Math.PI, b = (i + 1) / 9 * Math.PI - 0.018;
          const outline = [[Math.cos(a) * 1, 1.96 + Math.sin(a) * 1], [Math.cos(a) * 1.46, 1.96 + Math.sin(a) * 1.46], [Math.cos(b) * 1.46, 1.96 + Math.sin(b) * 1.46], [Math.cos(b) * 1, 1.96 + Math.sin(b) * 1]];
          builder.prism(g, outline, 0.55, i % 2 ? 0xd6bb91 : 0xe7cfa5).position.z = -0.45;
        }
        for (const side of [-1, 1]) {
          const points = [];
          for (let j = 0; j < 12; j++) { const a = (side < 0 ? Math.PI : 0) + side * j * 0.045; points.push(new THREE.Vector3(Math.cos(a) * 1.45, 1.7 + Math.sin(Math.abs(a)) * 1.25 + j * 0.09, -0.08)); }
          builder.mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(points), 14, 0.045, 4, false), 0x7e9c2f, g);
          for (let j = 0; j < 5; j++) {
            const leaf = builder.mesh(new THREE.SphereGeometry(0.2, 5, 3), j % 2 ? 0x9cbb31 : 0x789e28, g);
            leaf.position.set(side * (1.3 - j * 0.09), 1.6 + j * 0.31, 0.07); leaf.scale.set(1, 0.45, 0.55); leaf.rotation.z = side * 0.5;
          }
        }
        builder.flower(g, 1.45, 0.4, 0.65, 0.3); builder.flower(g, -1.17, 2.9, 0.02, 0.21);
        for (const side of [-1, 1]) builder.mesh(new THREE.IcosahedronGeometry(0.3, 0), 0x92ac38, g).position.set(side * 1.4, 0.2, 0.4);
      }
    } else if (type === 'space') {
      g.scale.set(1.12, 1.45, 1.12);
      const profile = [[0.32, 0.22], [0.42, 0.45], [0.49, 1.0], [0.47, 1.55], [0.35, 2.05]].map(([r, y]) => new THREE.Vector2(r, y));
      builder.mesh(new THREE.LatheGeometry(profile, 12), 0xfff0d2, g);
      const nose = [[0.35, 2.04], [0.26, 2.36], [0, 2.7]].map(([r, y]) => new THREE.Vector2(r, y));
      builder.mesh(new THREE.LatheGeometry(nose, 12), C.orange, g);
      const rim = builder.cylinder(g, 0.31, 0.31, 0.13, [0, 1.42, 0.47], 0x5e7a7f, 16); rim.rotation.x = Math.PI / 2;
      const glass = builder.cylinder(g, 0.235, 0.235, 0.145, [0, 1.42, 0.51], 0x32c5d2, 16); glass.rotation.x = Math.PI / 2;
      for (const x of [-0.63, 0.63]) builder.prism(g, [[x * 0.55, 0.25], [x * 1.4, 0], [x * 1.35, 0.85], [x * 0.65, 1.1]], 0.2, C.orange);
      builder.cylinder(g, 0.28, 0.36, 0.28, [0, 0.15, 0], 0x9d9d8c, 10);
      builder.cylinder(g, 0.58, 0.66, 0.12, [0, 0.03, 0], 0xc2b9a0, 12);
    } else if (type === 'race') {
      builder.cylinder(g, 1.02, 1.02, 0.13, [0, 0.09, 0], 0x788071, 24);
      const track = builder.mesh(new THREE.TorusGeometry(0.8, 0.22, 4, 24), 0x586368, g); track.rotation.x = -Math.PI / 2; track.position.y = 0.2;
      for (const x of [-1, 1]) builder.beam(g, [x, 0, -0.3], [x, 2.4, -0.3], 0.045, 0x876846);
      for (let row = 0; row < 3; row++) for (let col = 0; col < 8; col++) builder.box(g, [0.25, 0.25, 0.055], [-0.875 + col * 0.25, 2.15 - row * 0.25, -0.28], (row + col) % 2 ? 0xf9eed5 : 0x2e3b40);
      for (let j = 0; j < 3; j++) {
        const tyre = builder.mesh(new THREE.TorusGeometry(0.25, 0.13, 6, 12), 0x2c3435, g); tyre.rotation.x = Math.PI / 2; tyre.position.set(0.75, 0.14 + j * 0.2, 0.5);
      }
      builder.box(g, [0.75, 0.25, 0.25], [-0.45, 0.24, 0.5], C.orange, 0.02);
    } else if (type === 'arena') {
      builder.box(g, [2.4, 0.3, 1.4], [0, 0.2, 0], 0x9ab362);
      for (const x of [-0.85, 0.85]) {
        builder.box(g, [0.65, 1.45, 0.75], [x, 1, 0], 0xdfcfad);
        for (const dx of [-0.22, 0.22]) builder.box(g, [0.2, 0.35, 0.75], [x + dx, 1.85, 0], 0xe9dabb);
        builder.beam(g, [x, 1.8, 0], [x, 2.5, 0], 0.035, 0x976d43);
        builder.box(g, [0.45, 0.3, 0.04], [x + 0.2, 2.35, 0], x < 0 ? 0xf1a64b : 0x4bc2d0);
      }
      builder.box(g, [1.3, 0.75, 0.4], [0, 0.6, -0.25], 0xd4c19e);

  }
  return g;
}
