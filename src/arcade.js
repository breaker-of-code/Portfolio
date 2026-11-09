import * as THREE from 'three';

// Option C from the console review, using the island's own material helpers.
export function createArcade(b) {
  const g = new THREE.Group(); g.name = 'Coastal mini arcade';
  const cream = 0xfff3d5, dark = 0x284b54, teal = 0x42bbc4, coral = 0xed9384, amber = 0xffbc45;
  const box = (size, at, color, bevel = .04) => b.box(g, size, at, color, bevel);
  const outline = [[-.7, 0], [.68, 0], [.68, .9], [.92, 1.1], [.84, 1.34], [.55, 1.46], [.3, 2.45], [.72, 2.5], [.72, 2.9], [-.7, 2.9]];
  for (const x of [-.77, .77]) {
    const side = b.prism(g, outline, .13, teal); side.rotation.y = -Math.PI / 2; side.position.x = x;
  }
  box([1.47, 1.17, 1.24], [0, .59, 0], cream);
  box([1.46, .2, .98], [0, 1.26, .43], dark, .03);
  box([1.47, 1.27, .35], [0, 1.96, -.07], dark, .03).rotation.x = -.17;
  const screen = new THREE.Group(); screen.position.set(0, 1.96, .145); screen.rotation.x = -.17; g.add(screen);
  b.box(screen, [1.15, .94, .04], [0, 0, 0], 0x8fcfc7, .025);
  b.polygon(screen, [[-.55, -.41, .03], [-.18, .2, .03], [.18, -.41, .03]], 0x69a276);
  b.polygon(screen, [[-.1, -.41, .04], [.33, .29, .04], [.56, -.41, .04]], 0x4a8a79);
  b.box(screen, [.19, .13, .04], [0, -.22, .07], amber, .015);
  box([1.51, .39, .73], [0, 2.69, .08], cream, .045);
  box([1.24, .23, .035], [0, 2.7, .47], amber, .02);
  for (let i = 0; i < 3; i++) box([.13, .09, .04], [(i - 1) * .22, 2.7, .5], cream, .015);
  b.beam(g, [-.38, 1.34, .62], [-.38, 1.68, .62], .045, dark, 8);
  b.mesh(new THREE.IcosahedronGeometry(.12, 1), coral, g).position.set(-.38, 1.7, .62);
  for (const [x, z, color] of [[.21, .56, amber], [.47, .56, coral], [.34, .78, teal]]) b.cylinder(g, .095, .095, .07, [x, 1.41, z], color, 12);
  box([.54, .13, .035], [0, .72, .65], dark, .025);
  box([.27, .055, .045], [0, .72, .68], amber, .01);
  for (let i = 0; i < 3; i++) box([.56, .045, .035], [0, .31 + i * .11, .65], 0x9fbaae, .01);
  g.scale.setScalar(.83);
  return g;
}
