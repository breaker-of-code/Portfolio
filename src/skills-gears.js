import * as THREE from 'three';

export function createSkillsGears(b) {
  const g = new THREE.Group(); g.name = 'Interlocking skills gears';
  b.box(g, [2.9, .18, 1.2], [0, .13, 0], 0xfff3d5, .065);
  const gear = (x, y, radius, teeth, color, angle) => {
    const shape = new THREE.Shape();
    for (let i = 0; i < teeth * 4; i++) {
      const a = i / (teeth * 4) * Math.PI * 2, r = radius * [.79, 1, 1, .79][i % 4];
      if (i) shape.lineTo(Math.cos(a) * r, Math.sin(a) * r); else shape.moveTo(Math.cos(a) * r, Math.sin(a) * r);
    }
    shape.closePath();
    const hole = new THREE.Path(); hole.absarc(0, 0, radius * .34, 0, Math.PI * 2, true); shape.holes.push(hole);
    const geometry = new THREE.ExtrudeGeometry(shape, { depth: .23, bevelEnabled: true, bevelSize: .025, bevelThickness: .025, bevelSegments: 1, curveSegments: 20 });
    geometry.translate(0, 0, -.115);
    const mesh = b.mesh(geometry, color, g); mesh.position.set(x, y, .05); mesh.rotation.z = angle;
    b.beam(g, [x, .22, -.2], [x, y, -.2], .065, 0x284b54);
  };
  gear(-.64, 1.27, .97, 11, 0x42bbc4, .1);
  gear(.91, 1.95, .72, 9, 0xffbc45, -.1);
  gear(.96, .69, .53, 8, 0xed9384, .1);
  return g;
}
