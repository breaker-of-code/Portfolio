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
    this.life.traverse(object => { if (object.geometry) geometries.add(object.geometry); if (object.isInstancedMesh) object.dispose(); });
    geometries.forEach(geometry => geometry.dispose());
    this.routeMaterials?.forEach(material => material.dispose());
    this.life.clear(); this.routeMaterials = [];
  }
  seaMaterial(color, opacity = 1) {
    const material = new THREE.MeshBasicMaterial({ color, transparent: opacity < 1, opacity, depthWrite: opacity === 1, toneMapped: false, side: THREE.DoubleSide });
    this.routeMaterials.push(material); return material;
  }
  createRoute(length) {
    this.clearRoute(); this.lastTime = undefined; this.boats = []; this.schools = []; this.surf = []; this.jumpers = [];
    this.createSurf(length + 3);
    const columns = Math.max(3, Math.min(7, Math.ceil(length / 18)));
    for (let i = 0; i < columns; i++) {
      const x = (i / (columns - 1) - 0.5) * length * 0.6;
      this.createBoat(x, i % 2 ? -13.7 : 14.5, i * 1.8 + 0.3, false, 0.8 + (i % 3) * 0.09);
    }
    this.createBoat(-length / 2 - 2.5, -12.2, 1.6, false, 0.72);
    this.createBoat(length / 2 + 1.5, 13, 4.7, false, 0.8);
    this.createBoat(length / 2 - 4.4, 10.5, 4.1, true);
    this.createBoat(-length / 2 - 4.6, 8.8, 1.3, true, 0.88);
    // Five fish share two instanced meshes per school, rather than ten draw calls.
    this.fishBodyGeometry = new THREE.SphereGeometry(1, 7, 4); this.fishBodyGeometry.scale(0.43, 0.065, 0.16);
    this.fishTailGeometry = new THREE.BufferGeometry();
    this.fishTailGeometry.setAttribute('position', new THREE.Float32BufferAttribute([0, 0, 0, -0.32, 0, 0.2, -0.32, 0, -0.2], 3));
    const schoolCount = Math.max(8, Math.min(14, Math.ceil(length / 7)));
    for (let i = 0; i < schoolCount; i++) {
      const x = (i / (schoolCount - 1) - 0.5) * length * 0.82;
      this.createSchool(x, i % 2 ? -13.1 - (i % 3) * 0.5 : 13.3 + (i % 3) * 0.6, i);
    }
    for (let i = 0; i < 4; i++) this.createJumper((i / 3 - 0.5) * length * 0.66, i % 2 ? -11.7 : 11.8, i);
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
  createBoat(x, z, phase, moored, scale = 1) {
    const b = this.builder, root = new THREE.Group(), model = new THREE.Group(); root.add(model); this.life.add(root);
    root.name = moored ? 'Bobbing wooden dinghy' : 'Drifting sailboat';
    root.scale.setScalar((moored ? 0.78 : 1) * scale);
    const sails = [[0xfff3d6, 0xe99776], [0xf5c169, 0xfff0d0], [0x88d5c8, 0xffe6b5]][Math.floor(phase) % 3];
    const hull = b.prism(model, [[-1.65, 0.2], [1.7, 0.2], [1.25, -0.42], [-1.25, -0.42]], 1.12, moored ? 0xb8783d : 0xffefd2);
    const deck = b.box(model, [2.6, 0.11, 0.92], [0, 0.2, 0], 0xc49154, 0.04);
    for (const side of [-1, 1]) b.box(model, [2.7, 0.12, 0.09], [0, 0.3, side * 0.51], moored ? 0xe2b26c : 0xe28b58, 0.02);
    if (moored) {
      for (const bx of [-0.7, 0.55]) b.box(model, [0.25, 0.11, 0.94], [bx, 0.35, 0], 0xe4ba7e, 0.025);
      b.beam(model, [-1, 0.45, -0.9], [0.9, 0.45, 0.9], 0.035, 0x8f623d);
      b.box(model, [0.46, 0.05, 0.19], [0.92, 0.45, 0.92], 0xb47e44).rotation.y = -0.7;
    } else {
      b.beam(model, [-0.2, 0.3, 0], [-0.2, 3.65, 0], 0.045, 0x8b6b48);
      b.beam(model, [-0.25, 0.65, 0], [1.35, 0.65, 0], 0.028, 0x8b6b48);
      b.polygon(model, [[-0.1, 3.5, 0.03], [-0.1, 0.72, 0.03], [1.32, 0.72, 0.03]], sails[0]);
      b.polygon(model, [[-0.32, 3.2, 0], [-1.45, 0.72, 0], [-0.32, 0.72, 0]], sails[1]);
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
    root.traverse(object => { object.castShadow = false; object.receiveShadow = false; });
  }
  createSchool(x, z, index) {
    const school = new THREE.Group(); school.name = 'Swimming fish school'; this.life.add(school);
    const colors = [0xf6cf80, 0x225f72, 0xf2b491, 0xc5ead0];
    const material = this.seaMaterial(colors[index % colors.length], 0.7);
    const bodies = new THREE.InstancedMesh(this.fishBodyGeometry, material, 5);
    const tails = new THREE.InstancedMesh(this.fishTailGeometry, material, 5);
    bodies.frustumCulled = tails.frustumCulled = false;
    tails.instanceMatrix.setUsage(THREE.DynamicDrawUsage); school.add(bodies, tails);
    const fish = Array.from({ length: 5 }, (_, i) => ({ x: -i * 0.76, z: (i % 2 ? -1 : 1) * 0.38 + i * 0.12, scale: 0.9 + random(i + index * 5) * 0.35 }));
    fish.forEach((f, i) => {
      this.dummy.position.set(f.x, 0, f.z); this.dummy.rotation.set(0, 0, 0); this.dummy.scale.setScalar(f.scale); this.dummy.updateMatrix(); bodies.setMatrixAt(i, this.dummy.matrix);
    });
    school.position.set(x, -0.83, z); this.schools.push({ root: school, tails, fish, x, z, phase: index * 2.1 });
  }
  createJumper(x, z, index) {
    const b = this.builder, root = new THREE.Group(); this.life.add(root); root.name = 'Jumping coastal fish';
    const colors = [0xffcf73, 0xf29d76, 0xb7ddd0, 0xffdf9b];
    const body = b.mesh(new THREE.SphereGeometry(1, 7, 4), colors[index], root); body.scale.set(0.51, 0.19, 0.2);
    b.polygon(root, [[-0.4, 0, 0], [-0.82, 0.29, 0], [-0.82, -0.29, 0]], colors[index]);
    b.polygon(root, [[-0.15, 0.14, 0], [-0.2, 0.39, 0], [0.14, 0.15, 0]], 0xe5a263);
    for (const side of [-1, 1]) {
      const eye = b.mesh(new THREE.SphereGeometry(0.045, 5, 3), 0x183e49, root); eye.position.set(0.31, 0.06, side * 0.15);
    }
    root.traverse(object => { object.castShadow = false; object.receiveShadow = false; });
    const splashMaterial = this.seaMaterial(0xdbfff2, 0.5);
    const ring = new THREE.Mesh(new THREE.RingGeometry(0.36, 0.4, 20), splashMaterial); ring.rotation.x = -Math.PI / 2; ring.name = 'Fish landing ripple'; this.life.add(ring);
    const droplets = new THREE.InstancedMesh(new THREE.SphereGeometry(0.045, 4, 3), splashMaterial, 6); droplets.frustumCulled = false; droplets.instanceMatrix.setUsage(THREE.DynamicDrawUsage); this.life.add(droplets);
    this.jumpers.push({ root, ring, droplets, splashMaterial, x, z, phase: 0.3 + index * 2.15, period: 8.8, height: 1 + index % 2 * 0.45 });
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
      school.fish.forEach((fish, i) => {
        this.dummy.position.set(fish.x - 0.37 * fish.scale, 0, fish.z); this.dummy.rotation.set(0, Math.sin(t * 8 + i * 0.8) * 0.4, 0); this.dummy.scale.setScalar(fish.scale); this.dummy.updateMatrix(); school.tails.setMatrixAt(i, this.dummy.matrix);
      });
      school.tails.instanceMatrix.needsUpdate = true;
    });
    this.jumpers?.forEach(fish => {
      const cycle = (t + fish.phase) % fish.period, flight = 1.25, progress = Math.min(1, cycle / flight), direction = fish.z < 0 ? -1 : 1;
      const landingX = fish.x + 1.25 * direction;
      fish.root.visible = cycle < flight;
      fish.root.position.set(fish.x + (progress - 0.5) * 2.5 * direction, -0.93 + Math.sin(progress * Math.PI) * fish.height, fish.z);
      fish.root.rotation.set(0, fish.z < 0 ? Math.PI : 0, 0.75 - progress * 1.5);
      const age = cycle - flight, splash = age >= 0 && age < 0.8;
      fish.ring.visible = fish.droplets.visible = splash;
      fish.ring.position.set(landingX, -0.87, fish.z);
      fish.ring.scale.setScalar(0.4 + Math.max(0, age) * 2.1);
      fish.splashMaterial.opacity = splash ? (1 - age / 0.8) * 0.55 : 0;
      if (splash) {
        const p = age / 0.8;
        for (let i = 0; i < 6; i++) {
          const a = i / 6 * Math.PI * 2, radius = 0.16 + p * 0.6;
          this.dummy.position.set(landingX + Math.cos(a) * radius, -0.86 + Math.sin(p * Math.PI) * (0.3 + i % 2 * 0.24), fish.z + Math.sin(a) * radius);
          this.dummy.rotation.set(0, 0, 0); this.dummy.scale.setScalar(1 - p * 0.65); this.dummy.updateMatrix(); fish.droplets.setMatrixAt(i, this.dummy.matrix);
        }
        fish.droplets.instanceMatrix.needsUpdate = true;
      }
    });
  }
  dispose() {
    this.clearRoute(); this.life.removeFromParent();
    for (const mesh of [this.water, this.ripples]) { mesh.geometry.dispose(); mesh.material.dispose(); if (mesh.isInstancedMesh) mesh.dispose(); mesh.removeFromParent(); }
  }
}
