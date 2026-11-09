import * as THREE from 'three';
import { createMotorboat } from './motorboat.js';
import { oceanWaveGLSL, oceanSurface } from './ocean-waves.js';
import { createOceanGrid, createOceanGeometry } from './ocean-grid.js';
import { batchStaticMeshes } from './mesh-batching.js';

// Ambient scenery lives outside the island's camera-fit bounds.
export class CoastalOcean {
  constructor(builder) {
    this.builder = builder;
    this.scene = builder.scene;
    this.time = { value: 0 }; this.islandHalfLength = { value: 24 };
    this.profile = builder.qualityProfile || { nearStep: 1.5, farStep: 6, sceneryHz: 60 };
    this.dummy = new THREE.Object3D();
    this.life = new THREE.Group(); this.scene.add(this.life);
    this.createWater();
  }
  createWater() {
    this.grid = createOceanGrid(this.islandHalfLength.value, this.profile);
    const geometry = createOceanGeometry(this.grid);
    this.waterMaterial = new THREE.MeshBasicMaterial({ color: 0x0699ac, toneMapped: false, fog: false });
    this.waterMaterial.onBeforeCompile = shader => {
      shader.uniforms.oceanTime = this.time;
      shader.uniforms.islandHalfLength = this.islandHalfLength;
      const declarations = 'uniform float oceanTime; uniform float islandHalfLength; varying vec3 vOceanPosition; varying vec3 vOceanNormal;\n';
      shader.vertexShader = declarations + oceanWaveGLSL + shader.vertexShader.replace('#include <begin_vertex>', `
        #include <begin_vertex>
        transformed.y += oceanHeight(position.xz);
        vOceanPosition = transformed;
        float slopeX = (oceanHeight(position.xz + vec2(0.4, 0.0)) - oceanHeight(position.xz - vec2(0.4, 0.0))) / 0.8;
        float slopeZ = (oceanHeight(position.xz + vec2(0.0, 0.4)) - oceanHeight(position.xz - vec2(0.0, 0.4))) / 0.8;
        vOceanNormal = normalize(vec3(-slopeX, 1.0, -slopeZ));
      `);
      shader.fragmentShader = declarations + shader.fragmentShader.replace('#include <color_fragment>', `
        #include <color_fragment>
        // Interpolate wave normals across shared vertices for rounded swells.
        vec3 waterNormal = normalize(vOceanNormal);
        float sunlight = max(0.0, dot(waterNormal, normalize(vec3(-0.55, 0.60, 0.25))));
        diffuseColor.rgb *= 0.48 + sunlight * 0.72;
        diffuseColor.rgb *= 1.0 + clamp(vOceanPosition.y, -2.0, 2.0) * 0.09;
        float ripples = sin(vOceanPosition.x * 1.9 + vOceanPosition.z * 2.6 - oceanTime * 1.7 + sin(vOceanPosition.x * 0.63) * 1.2)
          * sin(vOceanPosition.z * 1.5 - vOceanPosition.x * 0.8 + oceanTime * 0.9);
        diffuseColor.rgb *= 0.98 + ripples * 0.035;
      `);
    };
    this.waterMaterial.customProgramCacheKey = () => 'coastal-smooth-raised-ocean-v8';
    this.water = new THREE.Mesh(geometry, this.waterMaterial);
    this.water.name = 'Smooth raised ocean swells and fine ripples'; this.water.position.y = -1.05;
    // The static plane bounds do not include shader displacement.
    geometry.computeBoundingBox(); geometry.boundingBox.min.y = -2.1; geometry.boundingBox.max.y = 2.1;
    geometry.computeBoundingSphere(); geometry.boundingSphere.radius += 2.1;
    this.scene.add(this.water);
  }
  setQuality(profile) {
    this.profile = profile;
    this.grid = createOceanGrid(this.islandHalfLength.value, profile);
    const old = this.water.geometry;
    this.water.geometry = createOceanGeometry(this.grid);
    old.dispose();
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
    this.clearRoute(); this.lastTime = undefined; this.boats = []; this.jumpers = [];
    this.islandHalfLength.value = (length + 3) / 2;
    this.setQuality(this.profile); this.lastSceneryTime = undefined;
    const columns = Math.max(3, Math.min(7, Math.ceil(length / 18)));
    for (let i = 0; i < columns; i++) {
      const x = (i / (columns - 1) - 0.5) * length * 0.6;
      this.createBoat(x, i % 2 ? -13.7 : 14.5, i * 1.8 + 0.3, false, 0.8 + (i % 3) * 0.09);
    }
    this.createBoat(-length / 2 - 2.5, -12.2, 1.6, false, 0.72);
    this.createBoat(length / 2 + 8, 15.5, 4.7, false, 0.8);
    if (this.builder.pier) this.createMooredMotorboat(this.builder.pier);
    this.createBoat(-length / 2 - 4.6, 8.8, 1.3, true, 0.88);
    for (let i = 0; i < 4; i++) this.createJumper((i / 3 - 0.5) * length * 0.66, i % 2 ? -11.7 : 11.8, i);
    this.update(0);
  }
  surfaceAt(x, z, time) {
    return oceanSurface(x, z, time, this.islandHalfLength.value, this.grid);
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
    batchStaticMeshes(model, { cellSize: Infinity });
  }
  createMooredMotorboat(pier) {
    const b = this.builder, root = new THREE.Group(), model = createMotorboat(b), wake = new THREE.Group();
    root.name = 'Modern motorboat moored beside fishing pier'; root.add(model, wake); this.life.add(root);
    this.boats.push({ root, model, wake, x: pier.boatX, z: pier.boatZ, phase: 4.1, moored: true, heading: Math.PI / 2 });
    root.traverse(object => { object.castShadow = false; object.receiveShadow = false; });
    batchStaticMeshes(model, { cellSize: Infinity });
    for (const direction of [-1, 1]) {
      b.beam(this.life, [pier.x + 1.4, .85, pier.deckZ + direction * 1.52], [pier.boatX - .9, -.18, pier.boatZ + direction * 1.2], .025, 0xb7b19a, 5);
    }
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
    this.jumpers.push({ root, ring, droplets, splashMaterial, x, z, phase: 0.3 + index * 1.1, period: 4.4, height: 1 + index % 2 * 0.45 });
  }
  update(t) {
    if (this.lastTime === t) return;
    this.lastTime = t; this.time.value = t;
    if (this.lastSceneryTime !== undefined && t - this.lastSceneryTime < 1 / this.profile.sceneryHz) return;
    this.lastSceneryTime = t;
    this.boats?.forEach(boat => {
      const a = t * 0.13 + boat.phase;
      const x = boat.x + (boat.moored ? 0 : Math.sin(a) * 2.6), z = boat.z + (boat.moored ? 0 : Math.sin(a * 2) * 0.8);
      const surface = this.surfaceAt(x, z, t);
      const heading = boat.moored ? (boat.heading ?? -0.25) : -Math.atan2(Math.cos(a * 2) * 1.6, Math.cos(a) * 2.6);
      boat.root.position.set(x, -0.69 + surface.height, z);
      boat.root.rotation.y = heading;
      boat.model.rotation.x = -0.6 * Math.atan(surface.slopeX * Math.sin(heading) + surface.slopeZ * Math.cos(heading));
      boat.model.rotation.z = 0.6 * Math.atan(surface.slopeX * Math.cos(heading) - surface.slopeZ * Math.sin(heading));
      boat.wake.scale.set(0.9 + Math.sin(t + boat.phase) * 0.1, 1, 1);
    });
    this.jumpers?.forEach(fish => {
      const cycle = (t + fish.phase) % fish.period, flight = 1.25, progress = Math.min(1, cycle / flight), direction = fish.z < 0 ? -1 : 1;
      const landingX = fish.x + 1.25 * direction;
      const wasAirborne = fish.airborne;
      fish.airborne = fish.root.visible = cycle < flight;
      if (wasAirborne === true && !fish.airborne) this.builder.fishSplash?.(landingX, -0.99 + this.surfaceAt(landingX, fish.z, t).height, fish.z);
      const x = fish.x + (progress - 0.5) * 2.5 * direction;
      const surface = this.surfaceAt(x, fish.z, t);
      const landing = this.surfaceAt(landingX, fish.z, t);
      fish.root.position.set(x, -0.93 + surface.height + Math.sin(progress * Math.PI) * fish.height, fish.z);
      fish.root.rotation.set(0, fish.z < 0 ? Math.PI : 0, 0.75 - progress * 1.5);
      const age = cycle - flight, splash = age >= 0 && age < 0.8;
      fish.ring.visible = fish.droplets.visible = splash;
      fish.ring.position.set(landingX, -0.99 + landing.height, fish.z);
      fish.ring.scale.setScalar(0.4 + Math.max(0, age) * 2.1);
      fish.splashMaterial.opacity = splash ? (1 - age / 0.8) * 0.55 : 0;
      if (splash) {
        const p = age / 0.8;
        for (let i = 0; i < 6; i++) {
          const a = i / 6 * Math.PI * 2, radius = 0.16 + p * 0.6;
          this.dummy.position.set(landingX + Math.cos(a) * radius, -0.98 + landing.height + Math.sin(p * Math.PI) * (0.3 + i % 2 * 0.24), fish.z + Math.sin(a) * radius);
          this.dummy.rotation.set(0, 0, 0); this.dummy.scale.setScalar(1 - p * 0.65); this.dummy.updateMatrix(); fish.droplets.setMatrixAt(i, this.dummy.matrix);
        }
        fish.droplets.instanceMatrix.needsUpdate = true;
      }
    });
  }
  dispose() {
    this.clearRoute(); this.life.removeFromParent();
    for (const mesh of [this.water]) { mesh.geometry.dispose(); mesh.material.dispose(); if (mesh.isInstancedMesh) mesh.dispose(); mesh.removeFromParent(); }
  }
}
