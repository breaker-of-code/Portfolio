import * as THREE from 'three';

// The selected desk B from the Career icon review.
export function createDeveloperDesk(b) {
  const g = new THREE.Group(); g.name = 'Game developer desk';
  const cream = 0xfff3d5, dark = 0x284b54, teal = 0x42bbc4, amber = 0xffbc45, coral = 0xed9384;
  const box = (size, position, color, bevel = .04) => b.box(g, size, position, color, bevel);
  box([3.15, .16, 1.45], [0, 1.18, .05], cream, .06);
  box([.64, .07, .5], [-.38, 1.31, -.32], dark, .04);
  box([.12, .36, .13], [-.38, 1.48, -.42], dark, .02);
  box([1.91, 1.2, .18], [-.38, 2.08, -.38], dark, .07);
  box([1.68, .96, .025], [-.38, 2.08, -.271], 0x153e48, .035);
  for (const [x, y, width, color] of [[-.82, 2.37, .32, coral], [-.53, 2.21, .58, teal], [-.54, 2.05, .38, amber], [-.57, 1.89, .49, teal], [-.72, 1.75, .27, cream]]) box([width, .055, .018], [x, y, -.25], color, .009);
  box([.57, .99, .69], [1.12, 1.78, -.12], cream, .07);
  box([.4, .82, .04], [1.12, 1.78, .25], dark, .045);
  for (const y of [1.64, 1.97]) {
    const ring = b.mesh(new THREE.TorusGeometry(.11, .025, 5, 14), teal, g); ring.position.set(1.12, y, .29);
    b.mesh(new THREE.IcosahedronGeometry(.035, 0), 0x9bdbd1, g).position.set(1.12, y, .29);
  }
  box([1.36, .075, .44], [-.4, 1.31, .49], dark, .035);
  for (let row = 0; row < 3; row++) for (let col = 0; col < 9; col++) box([.105, .018, .072], [-.94 + col * .133, 1.36, .34 + row * .112], row === 2 && col === 4 ? amber : 0xc8d9cc, .008);
  box([.24, .1, .32], [.48, 1.33, .49], teal, .09);
  box([.34, .42, .34], [-1.31, 1.47, -.18], coral, .055);
  const mug = b.mesh(new THREE.TorusGeometry(.11, .03, 5, 12), coral, g); mug.position.set(-1.49, 1.47, -.18); mug.rotation.y = Math.PI / 2;
  // Lower the tabletop and everything on it, keeping the feet at their old level.
  for (const child of g.children) child.position.y -= .55;
  for (const x of [-1.28, 1.28]) for (const z of [-.49, .57]) box([.13, .57, .13], [x, .295, z], dark, .025);
  return g;
}
