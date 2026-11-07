import * as THREE from 'three';

// Preview meshes use the portfolio's own geometry/material helpers.
export function createJeep(b, variant = 'classic') {
  const jeep = new THREE.Group(), orange = 0xf68a13, trim = 0x344249, glass = 0x326c79;
  jeep.name = `${variant} off-road Jeep`;
  jeep.userData.wheels = [];
  const box = (size, at, color, bevel = .03) => b.box(jeep, size, at, color, bevel);
  const beam = (a, c, radius = .045, color = trim) => b.beam(jeep, a, c, radius, color);
  const round = (at, radius, color, depth = .08) => {
    const mesh = b.cylinder(jeep, radius, radius, depth, at, color, 14); mesh.rotation.z = -Math.PI / 2; return mesh;
  };
  box([3.65, .2, 1.45], [0, .65, 0], 0x313c40);
  box([3.4, .58, 1.5], [-.03, 1.02, 0], orange, .07);
  box([1.27, .27, 1.5], [1.02, 1.47, 0], 0xffa323, .055);
  box([.18, .72, 1.5], [1.72, 1.19, 0], orange, .045);
  box([.09, .64, 1.45], [1.835, 1.24, 0], 0xf6a22d);
  for (let i = -2; i <= 2; i++) box([.04, .48, .105], [1.89, 1.25, i * .185], trim, .04);
  for (const side of [-1, 1]) {
    round([1.87, 1.45, side * .57], .225, trim, .09);
    round([1.93, 1.45, side * .57], .158, 0xffedbf, .035);
    round([1.91, 1.05, side * .58], .08, 0xeaaa45, .03);
    box([1.55, .08, .16], [-.48, .75, side * .85], 0x4a5657);
    box([.28, .09, .055], [-.3, 1.37, side * .775], trim);
    box([.26, .29, .17], [.28, 1.9, side * .92], orange, .045);
    beam([.27, 1.78, side * .73], [.27, 1.88, side * .92], .025);
    box([.06, .15, .05], [.3, 1.18, side * .78], 0x56534a);
    box([.06, .15, .05], [-1.05, 1.18, side * .78], 0x56534a);
  }
  box([.24, .24, 1.94], [1.98, .83, 0], trim, .045);
  box([.2, .19, 1.8], [-1.9, .8, 0], trim, .035);
  for (const side of [-1, 1]) {
    round([2.13, .85, side * .61], .12, 0xe7e0c5, .055);
    box([.11, .16, .15], [-1.85, 1.09, side * .64], 0xcc6548);
  }
  // A slightly reclined windscreen and warm low-poly cabin.
  const windshield = [[.31, 1.7, -.7], [.31, 1.7, .7], [.08, 2.53, .7], [.08, 2.53, -.7]];
  b.polygon(jeep, windshield, glass, { roughness: .3 });
  for (const side of [-1, 1]) beam([.33, 1.62, side * .76], [.08, 2.6, side * .76], .065, orange);
  beam([.08, 2.6, -.76], [.08, 2.6, .76], .065, orange);
  beam([.34, 1.66, -.76], [.34, 1.66, .76], .065, orange);
  beam([.22, 1.9, -.6], [.27, 1.78, -.12], .026);
  beam([.22, 1.9, .14], [.27, 1.78, .61], .026);
  box([.25, .19, 1.33], [.08, 1.61, 0], trim);
  for (const side of [-1, 1]) {
    box([.57, .15, .52], [-.65, 1.36, side * .35], 0x6d6150, .055);
    box([.16, .59, .52], [-1, 1.66, side * .35], 0x6d6150, .06);
  }
  const steering = b.mesh(new THREE.TorusGeometry(.19, .025, 5, 12), trim, jeep); steering.position.set(-.02, 1.76, .36); steering.rotation.y = Math.PI / 2 - .3;
  if (variant === 'open') {
    for (const x of [-1.35, -.6]) {
      for (const side of [-1, 1]) beam([x, 1.29, side * .66], [x, 2.48, side * .66], .065);
      beam([x, 2.48, -.66], [x, 2.48, .66], .065);
    }
    for (const side of [-1, 1]) beam([-1.35, 2.48, side * .66], [.08, 2.6, side * .66], .055);
    box([.44, .37, 1.37], [-1.45, 1.35, 0], orange);
  } else {
    const roof = variant === 'expedition' ? 0xe9dcba : trim;
    box([1.7, .15, 1.67], [-.74, 2.65, 0], roof, .055);
    box([.13, .99, 1.55], [-1.52, 2.08, 0], roof, .03);
    box([.035, .57, 1.2], [-1.598, 2.16, 0], glass, .02);
    for (const side of [-1, 1]) {
      b.polygon(jeep, [[-1.4, 1.65, side * .78], [.27, 1.65, side * .78], [.04, 2.54, side * .78], [-1.4, 2.54, side * .78]], glass, { roughness: .3 });
      for (const x of [-1.43, -.62]) box([.07, .91, .08], [x, 2.1, side * .795], roof);
      box([1.65, .09, .09], [-.69, 1.62, side * .8], orange);
    }
    if (variant === 'classic') {
      for (const side of [-1, 1]) { round([.07, 2.84, side * .48], .14, trim, .12); round([.15, 2.84, side * .48], .105, 0xffedbf, .035); }
    }
    if (variant === 'expedition') {
      for (const x of [-1.35, -.05]) for (const side of [-1, 1]) beam([x, 2.72, side * .63], [x, 2.91, side * .63], .035);
      for (const side of [-1, 1]) box([1.65, .1, .08], [-.72, 2.92, side * .65], trim);
      for (const x of [-1.47, .08]) box([.08, .1, 1.3], [x, 2.92, 0], trim);
      box([.77, .35, .81], [-.88, 3.12, 0], 0xc3985a, .055);
      for (const z of [-.27, .27]) box([.8, .035, .06], [-.88, 3.305, z], 0x685e49);
      for (const side of [-1, 1]) { round([.13, 2.89, side * .48], .14, trim, .12); round([.21, 2.89, side * .48], .105, 0xffedbf, .035); }
    }
  }
  // Thick tread, steel hubs and exposed axles give the reference its stance.
  for (const x of [-1.14, 1.12]) {
    beam([x, .55, -1], [x, .55, 1], .085, 0x485154);
    for (const side of [-1, 1]) {
      const wheel = new THREE.Group(); wheel.position.set(x, .56, side * .89); jeep.add(wheel); jeep.userData.wheels.push(wheel);
      b.cylinder(wheel, .56, .56, .39, [0, 0, 0], 0x293338, 14).rotation.x = Math.PI / 2;
      b.cylinder(wheel, .32, .32, .415, [0, 0, 0], 0x9fa7a1, 12).rotation.x = Math.PI / 2;
      b.cylinder(wheel, .19, .19, .435, [0, 0, 0], 0x52656a, 10).rotation.x = Math.PI / 2;
      for (let i = 0; i < 14; i++) {
        const angle = i / 14 * Math.PI * 2;
        b.box(wheel, [.2, .085, .43], [Math.sin(angle) * .55, Math.cos(angle) * .55, 0], 0x3a4447, .018).rotation.z = -angle;
      }
      for (let i = 0; i < 5; i++) {
        const angle = i / 5 * Math.PI * 2;
        b.cylinder(wheel, .026, .026, .45, [Math.cos(angle) * .245, Math.sin(angle) * .245, 0], 0xe0ded0, 6).rotation.x = Math.PI / 2;
      }
      const arch = [];
      for (let i = 0; i <= 10; i++) { const a = i / 10 * Math.PI; arch.push([x + Math.cos(a) * .76, .56 + Math.sin(a) * .76]); }
      for (let i = 10; i >= 0; i--) { const a = i / 10 * Math.PI; arch.push([x + Math.cos(a) * .635, .56 + Math.sin(a) * .635]); }
      b.prism(jeep, arch, .51, trim).position.z = side * .82;
    }
  }
  const spare = new THREE.Group(); spare.position.set(-1.99, 1.39, 0); jeep.add(spare);
  b.cylinder(spare, .49, .49, .3, [0, 0, 0], trim, 14).rotation.z = Math.PI / 2;
  b.cylinder(spare, .28, .28, .33, [0, 0, 0], 0xa0aaa3, 12).rotation.z = Math.PI / 2;
  // Suspend the body independently so engine vibration leaves the tyres planted.
  const body = new THREE.Group(); body.name = 'Jeep suspended body';
  for (const child of [...jeep.children]) {
    if (!jeep.userData.wheels.includes(child)) body.add(child);
  }
  jeep.add(body); jeep.userData.body = body;
  return jeep;
}
