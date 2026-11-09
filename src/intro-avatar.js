import * as THREE from 'three';

export function createIntroAvatar(b) {
  const g = new THREE.Group(); g.name = 'Waving intro avatar';
  const cream = 0xfff3d5, dark = 0x284b54, teal = 0x42bbc4, skin = 0xe9bd91;
  const box = (size, at, color, bevel = .04) => b.box(g, size, at, color, bevel);
  b.cylinder(g, .7, .78, .15, [0, .1, 0], cream, 12);
  for (const x of [-.23, .23]) { box([.27, .64, .3], [x, .56, 0], dark, .04); box([.33, .18, .49], [x, .29, .1], cream, .05); }
  box([.91, .82, .58], [0, 1.21, 0], teal, .12);
  b.cylinder(g, .13, .13, .19, [0, 1.7, 0], skin, 8);
  box([.76, .72, .66], [0, 2.06, .015], skin, .15);
  box([.8, .23, .7], [0, 2.4, -.035], dark, .09); box([.13, .35, .6], [-.35, 2.22, -.075], dark, .05);
  for (const x of [-.16, .16]) b.mesh(new THREE.SphereGeometry(.036, 6, 4), dark, g).position.set(x, 2.09, .35);
  b.beam(g, [-.11, 1.94, .36], [0, 1.91, .37], .017, dark); b.beam(g, [0, 1.91, .37], [.11, 1.94, .36], .017, dark);
  b.beam(g, [-.43, 1.48, 0], [-.63, 1.14, 0], .13, teal, 7); b.beam(g, [-.63, 1.14, 0], [-.6, .91, .06], .1, skin, 7);
  b.beam(g, [.43, 1.47, 0], [.73, 1.72, .02], .13, teal, 7); b.beam(g, [.73, 1.72, .02], [.87, 2.14, .05], .1, skin, 7);
  const hand = b.mesh(new THREE.IcosahedronGeometry(.16, 1), skin, g); hand.position.set(.9, 2.27, .05); hand.scale.set(.8, 1.2, .5);
  box([.22, .2, .025], [.15, 1.36, .305], cream, .025);
  return g;
}
