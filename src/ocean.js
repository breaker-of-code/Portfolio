import * as THREE from 'three';

const random = n => { const value = Math.sin(n * 127.1 + 311.7) * 43758.5453; return value - Math.floor(value); };

// Ambient scenery lives outside the island's camera-fit bounds.
export class CoastalOcean {
  constructor(builder) {
    this.builder = builder;
    this.scene = builder.scene;
    this.time = { value: 0 };
    this.life = new THREE.Group(); this.scene.add(this.life);
    this.createWater(); this.createRipples();
  }
  createWater() {
    const geometry = new THREE.PlaneGeometry(600, 600, 110, 80).toNonIndexed(); geometry.rotateX(-Math.PI / 2);
    const colors = [], positions = geometry.getAttribute('position');
    const deep = new THREE.Color(0x0095a7), shallow = new THREE.Color(0x1bb2b8);
    for (let i = 0; i < positions.count; i++) {
      const color = deep.clone().lerp(shallow, 0.08 + random(Math.floor(i / 3)) * 0.12);
      colors.push(color.r, color.g, color.b);
    }
    geometry.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3));
    this.waterMaterial = new THREE.MeshBasicMaterial({ vertexColors: true, toneMapped: false, fog: false });
    this.waterMaterial.onBeforeCompile = shader => {
      shader.uniforms.oceanTime = this.time;
      const declarations = 'uniform float oceanTime; varying vec2 vOceanXZ;\n';
      shader.vertexShader = declarations + shader.vertexShader.replace('#include <begin_vertex>', `
        #include <begin_vertex>
        vOceanXZ = position.xz;
        transformed.y += sin(position.x * 0.35 + position.z * 0.28 + oceanTime * 0.9) * 0.065
          + sin(position.z * 0.7 - position.x * 0.17 - oceanTime * 0.65) * 0.035;
      `);
      shader.fragmentShader = declarations + shader.fragmentShader.replace('#include <color_fragment>', `
        #include <color_fragment>
        float swell = sin(vOceanXZ.x * 0.42 + vOceanXZ.y * 0.21 - oceanTime * 0.85);
        float crossing = sin(vOceanXZ.y * 0.65 - vOceanXZ.x * 0.16 + oceanTime * 0.55);
        float shimmer = pow(max(0.0, sin(vOceanXZ.x * 0.9 + vOceanXZ.y * 1.7 - oceanTime * 1.2)), 28.0);
        shimmer *= smoothstep(0.55, 0.92, sin(vOceanXZ.x * 0.47 - vOceanXZ.y * 0.63 + oceanTime * 0.3));
        shimmer *= smoothstep(0.35, 0.9, sin(vOceanXZ.x * 0.61 + vOceanXZ.y * 0.43 - oceanTime * 0.2));
        diffuseColor.rgb *= 0.97 + swell * 0.045 + crossing * 0.035;
        diffuseColor.rgb = mix(diffuseColor.rgb, vec3(0.24, 0.78, 0.74), shimmer * 0.075);
      `);
    };
    this.waterMaterial.customProgramCacheKey = () => 'coastal-ocean-v1';
    this.water = new THREE.Mesh(geometry, this.waterMaterial);
    this.water.name = 'Moving turquoise water'; this.water.position.y = -1.05;
    this.scene.add(this.water);
  }
  createRipples() {
    const vertices = [], indices = [];
    for (let i = 0; i <= 8; i++) {
      const x = i / 8 * 1.4 - 0.7, z = Math.sin(i / 8 * Math.PI) * 0.13;
      vertices.push(x, 0, z - 0.025, x, 0, z + 0.025);
      if (i < 8) { const n = i * 2; indices.push(n, n + 1, n + 2, n + 1, n + 3, n + 2); }
    }
    const geometry = new THREE.BufferGeometry(); geometry.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3)); geometry.setIndex(indices); geometry.computeVertexNormals();
    this.rippleMaterial = new THREE.MeshBasicMaterial({ color: 0xc9fff1, transparent: true, opacity: 0.32, depthWrite: false, toneMapped: false, side: THREE.DoubleSide });
    this.ripples = new THREE.InstancedMesh(geometry, this.rippleMaterial, 90);
    this.ripples.name = 'Drifting wave crests'; this.ripples.frustumCulled = false;
    this.ripples.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
    this.rippleData = Array.from({ length: 90 }, (_, i) => ({ x: (random(i + 1) - 0.5) * 150, z: (random(i + 190) - 0.5) * 75, scale: 0.7 + random(i + 33) * 1.8, phase: random(i + 501) * Math.PI * 2 }));
    this.dummy = new THREE.Object3D(); this.scene.add(this.ripples);
  }
  clearRoute() {
    const geometries = new Set();
    this.life.traverse(object => { if (object.geometry) geometries.add(object.geometry); });
    geometries.forEach(geometry => geometry.dispose());
    this.routeMaterials?.forEach(material => material.dispose());
    this.life.clear(); this.routeMaterials = [];
  }
  seaMaterial(color, opacity = 1) {
    const material = new THREE.MeshBasicMaterial({ color, transparent: opacity < 1, opacity, depthWrite: opacity === 1, toneMapped: false, side: THREE.DoubleSide });
    this.routeMaterials.push(material); return material;
  }
  createRoute(length) {
    this.clearRoute(); this.lastTime = undefined; this.boats = []; this.schools = []; this.surf = [];
    this.createSurf(length + 3);
    this.createBoat(-length * 0.27, 17, 0, false);
    this.createBoat(length * 0.19, -13.8, 2.8, false);
    this.createBoat(length / 2 - 4.4, 10.5, 4.1, true);
    for (let i = 0; i < 3; i++) this.createSchool((i - 1) * length * 0.28, i === 1 ? -11.4 : 12.5 + i * 1.2, i);
    this.update(0);
  }
  createSurf(length) {
    const outline = this.builder.islandShape(length, 13.8, 4).getSpacedPoints(120);
    const vertices = [], indices = [];
    outline.forEach((point, i) => {
      // Shape Y becomes negative world Z when the island is laid flat.
      for (const width of [-0.055, 0.055]) vertices.push(point.x * (1 + width / length), 0, -point.y * (1 + width / 7));
      if (i < outline.length - 1) { const n = i * 2; indices.push(n, n + 1, n + 2, n + 1, n + 3, n + 2); }
    });
    const geometry = new THREE.BufferGeometry(); geometry.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3)); geometry.setIndex(indices); geometry.computeVertexNormals();
    for (let i = 0; i < 3; i++) {
      const material = this.seaMaterial(0xd5fff0, 0.4), mesh = new THREE.Mesh(geometry, material);
      mesh.name = 'Rolling shoreline foam'; mesh.position.y = -0.89 + i * 0.003;
      this.life.add(mesh); this.surf.push(mesh);
    }
  }
  createBoat(x, z, phase, moored) {
    const b = this.builder, root = new THREE.Group(), model = new THREE.Group(); root.add(model); this.life.add(root);
    root.name = moored ? 'Bobbing wooden dinghy' : 'Drifting sailboat';
    const hull = b.prism(model, [[-1.65, 0.2], [1.7, 0.2], [1.25, -0.42], [-1.25, -0.42]], 1.12, moored ? 0xb8783d : 0xffefd2);
    const deck = b.box(model, [2.6, 0.11, 0.92], [0, 0.2, 0], 0xc49154, 0.04);
    for (const side of [-1, 1]) b.box(model, [2.7, 0.12, 0.09], [0, 0.3, side * 0.51], moored ? 0xe2b26c : 0xe28b58, 0.02);
    if (moored) {
      root.scale.setScalar(0.78);
      for (const bx of [-0.7, 0.55]) b.box(model, [0.25, 0.11, 0.94], [bx, 0.35, 0], 0xe4ba7e, 0.025);
      b.beam(model, [-1, 0.45, -0.9], [0.9, 0.45, 0.9], 0.035, 0x8f623d);
      b.box(model, [0.46, 0.05, 0.19], [0.92, 0.45, 0.92], 0xb47e44).rotation.y = -0.7;
    } else {
      b.beam(model, [-0.2, 0.3, 0], [-0.2, 3.65, 0], 0.045, 0x8b6b48);
      b.beam(model, [-0.25, 0.65, 0], [1.35, 0.65, 0], 0.028, 0x8b6b48);
      b.polygon(model, [[-0.1, 3.5, 0.03], [-0.1, 0.72, 0.03], [1.32, 0.72, 0.03]], phase ? 0xf5c169 : 0xfff3d6);
      b.polygon(model, [[-0.32, 3.2, 0], [-1.45, 0.72, 0], [-0.32, 0.72, 0]], phase ? 0xfff0d0 : 0xe99776);
      b.polygon(model, [[-0.2, 3.65, 0], [-0.2, 3.32, 0], [0.38, 3.5, 0]], 0x67d7d4);
    }
    const wake = new THREE.Group(); root.add(wake);
    const wakeMaterial = this.seaMaterial(0xdcfff0, moored ? 0.14 : 0.32);
    for (const side of [-1, 1]) {
      const line = b.polygon(wake, [[-1.4, -0.1, side * 0.36], [-4.4, -0.1, side * 1.4], [-4, -0.1, side * 1.14], [-1.4, -0.1, side * 0.3]], 0xdcfff0);
      line.material = wakeMaterial; line.castShadow = false; line.receiveShadow = false;
    }
    root.position.set(x, -0.69, z);
    this.boats.push({ root, model, wake, x, z, phase, moored });
    // Tiny scenery uses the shared material cache; no downloaded model or texture.
    hull.receiveShadow = deck.receiveShadow = false;
  }
  createSchool(x, z, index) {
    const b = this.builder, school = new THREE.Group(), tails = [];
    school.name = 'Swimming fish school'; this.life.add(school);
    const material = this.seaMaterial(index % 2 ? 0x2a7c83 : 0xf1c87b, 0.55);
    for (let i = 0; i < 4; i++) {
      const fish = new THREE.Group(); school.add(fish); fish.position.set(-i * 0.8, 0, (i % 2 ? -1 : 1) * 0.35 + i * 0.13);
      fish.scale.setScalar(0.85 + random(i + index * 5) * 0.35);
      const body = new THREE.Mesh(new THREE.SphereGeometry(1, 7, 4), material); body.scale.set(0.43, 0.055, 0.15); fish.add(body);
      const tail = new THREE.Group(); tail.position.x = -0.37; fish.add(tail); tails.push(tail);
      const fin = b.polygon(tail, [[0, 0, 0], [-0.32, 0, 0.2], [-0.32, 0, -0.2]], 0xf1c87b); fin.material = material; fin.castShadow = false;
    }
    school.position.set(x, -0.83, z); this.schools.push({ root: school, tails, x, z, phase: index * 2.1 });
  }
  update(t) {
    if (this.lastTime === t) return;
    this.lastTime = t; this.time.value = t;
    this.rippleData.forEach((ripple, i) => {
      this.dummy.position.set(ripple.x + Math.sin(t * 0.35 + ripple.phase) * 0.6, -0.91, ripple.z + Math.cos(t * 0.28 + ripple.phase) * 0.35);
      this.dummy.rotation.y = Math.sin(ripple.phase) * 0.3;
      this.dummy.scale.set(ripple.scale * (0.86 + Math.sin(t * 0.7 + ripple.phase) * 0.14), 1, 1);
      this.dummy.updateMatrix(); this.ripples.setMatrixAt(i, this.dummy.matrix);
    });
    this.ripples.instanceMatrix.needsUpdate = true;
    this.surf?.forEach((mesh, i) => {
      const progress = (t * 0.14 + i / 3) % 1, spread = 1 - progress;
      mesh.scale.set(1.025 + spread * 0.055, 1, 1.10 + spread * 0.33);
      mesh.material.opacity = Math.sin(progress * Math.PI) * 0.44;
    });
    this.boats?.forEach(boat => {
      const a = t * 0.13 + boat.phase;
      boat.root.position.set(boat.x + (boat.moored ? 0 : Math.sin(a) * 2.6), -0.69 + Math.sin(t * 1.3 + boat.phase) * 0.075, boat.z + (boat.moored ? 0 : Math.sin(a * 2) * 0.8));
      boat.root.rotation.y = boat.moored ? -0.25 : -Math.atan2(Math.cos(a * 2) * 1.6, Math.cos(a) * 2.6);
      boat.model.rotation.x = Math.sin(t * 1.1 + boat.phase) * 0.045;
      boat.model.rotation.z = Math.sin(t * 1.5 + boat.phase) * 0.035;
      boat.wake.scale.set(0.9 + Math.sin(t + boat.phase) * 0.1, 1, 1);
    });
    this.schools?.forEach(school => {
      const a = t * 0.19 + school.phase;
      school.root.position.set(school.x + Math.sin(a) * 3.2, -0.83, school.z + Math.cos(a) * 1.2);
      school.root.rotation.y = -Math.atan2(-Math.sin(a) * 1.2, Math.cos(a) * 3.2);
      school.tails.forEach((tail, i) => { tail.rotation.y = Math.sin(t * 8 + i * 0.8) * 0.4; });
    });
  }
  dispose() {
    this.clearRoute(); this.life.removeFromParent();
    for (const mesh of [this.water, this.ripples]) { mesh.geometry.dispose(); mesh.material.dispose(); mesh.removeFromParent(); }
  }
}
