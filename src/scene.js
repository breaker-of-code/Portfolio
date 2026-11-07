import * as THREE from 'three';
import { RoundedBoxGeometry } from 'three/addons/geometries/RoundedBoxGeometry.js';
import { drivingProgress } from './motion.js';

const C = { sand: 0xf6c77f, shore: 0xffe1a1, rock: 0xa49a91, road: 0x505c67, aqua: 0x33f5ed, orange: 0xf77b08, dark: 0x183b44, green: 0x91af35, cream: 0xfff4d9 };
const clamp = THREE.MathUtils.clamp;
const lerp = THREE.MathUtils.lerp;
const seeded = n => { const x = Math.sin(n * 127.1 + 311.7) * 43758.5453; return x - Math.floor(x); };
const pathZ = x => Math.sin(x * 0.19) * 1.5;
const pathSlope = x => Math.cos(x * 0.19) * 1.5 * 0.19;

export class CoastalScene {
  constructor(canvas, { onStop, onMove, onReady, onError, reducedMotion = false } = {}) {
    this.canvas = canvas;
    this.onStop = onStop; this.onMove = onMove; this.reducedMotion = reducedMotion;
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0x069caa);
    this.scene.fog = new THREE.Fog(0x069caa, 100, 240);
    this.camera = new THREE.OrthographicCamera(-30, 30, 20, -20, 0.1, 200);
    this.camera.position.set(18, 30, 39);
    this.target = new THREE.Vector3(); this.cameraCenter = new THREE.Vector3();
    this.materials = new Map(); this.disposed = false; this.route = 'hub'; this.index = 0;
    this.carX = -16; this.destinationX = -16; this.moving = false; this.routeItems = [];
    this.focusX = 0; this.visualZoom = 1; this.activeHalo = null; this.wheels = [];
    try {
      this.renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: false, powerPreference: 'high-performance' });
      this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.7));
      this.renderer.outputColorSpace = THREE.SRGBColorSpace;
      this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
      this.renderer.toneMappingExposure = 1.12;
      this.renderer.shadowMap.enabled = true;
      this.renderer.shadowMap.type = THREE.PCFShadowMap;
    } catch (error) { onError?.(error); throw error; }
    this.scene.add(new THREE.HemisphereLight(0xe5f9ff, 0xab825c, 1.1));
    const sunlight = new THREE.DirectionalLight(0xffedce, 3.1);
    sunlight.position.set(-12, 27, 11); sunlight.castShadow = true;
    sunlight.shadow.mapSize.set(2048, 2048);
    sunlight.shadow.camera.left = -45; sunlight.shadow.camera.right = 45;
    sunlight.shadow.camera.top = 28; sunlight.shadow.camera.bottom = -28;
    sunlight.shadow.normalBias = 0.03; sunlight.shadow.bias = -0.0004;
    sunlight.shadow.radius = 3;
    this.sun = sunlight; this.scene.add(sunlight, sunlight.target);
    this.world = new THREE.Group(); this.scene.add(this.world);
    this.createWater(); this.createCar(); this.createBirds();
    this.raycaster = new THREE.Raycaster(); this.pointer = new THREE.Vector2();
    this.pointerDown = e => { this.pointerStart = { x: e.clientX, y: e.clientY }; };
    this.pointerUp = e => {
      if (!this.pointerStart || Math.hypot(e.clientX - this.pointerStart.x, e.clientY - this.pointerStart.y) > 10) return;
      this.pointer.set(e.clientX / innerWidth * 2 - 1, -(e.clientY / innerHeight) * 2 + 1);
      this.raycaster.setFromCamera(this.pointer, this.camera);
      const hit = this.raycaster.intersectObjects(this.world.children, true).find(h => {
        let o = h.object; while (o) { if (o.userData.stop !== undefined) return true; o = o.parent; } return false;
      });
      if (hit) { let o = hit.object; while (o && o.userData.stop === undefined) o = o.parent; if (o) this.onStop?.(o.userData.stop); }
    };
    canvas.addEventListener('pointerdown', this.pointerDown); canvas.addEventListener('pointerup', this.pointerUp);
    this.resize = this.resize.bind(this); window.addEventListener('resize', this.resize); this.resize(); this.visualZoom = this.baseHalfHeight;
    this.lastTime = performance.now(); this.animate = this.animate.bind(this); this.renderer.setAnimationLoop(this.animate);
    requestAnimationFrame(() => requestAnimationFrame(() => onReady?.()));
  }

  material(color, options = {}) {
    const key = `${color}:${JSON.stringify(options)}`;
    if (!this.materials.has(key)) this.materials.set(key, new THREE.MeshStandardMaterial({ color, roughness: 0.8, flatShading: true, ...options }));
    return this.materials.get(key);
  }
  mesh(geometry, color, parent = this.world, options = {}) {
    const m = new THREE.Mesh(geometry, this.material(color, options)); m.castShadow = true; m.receiveShadow = true; parent.add(m); return m;
  }
  box(parent, size, position, color, bevel = 0) {
    const geo = bevel ? new RoundedBoxGeometry(...size, 2, Math.min(bevel, Math.min(...size) / 2)) : new THREE.BoxGeometry(...size);
    const m = this.mesh(geo, color, parent); m.position.set(...position); return m;
  }
  polygon(parent, points, color, options = {}) {
    const g = new THREE.BufferGeometry();
    g.setAttribute('position', new THREE.Float32BufferAttribute(points.flat(), 3));
    const indices = []; for (let i = 1; i < points.length - 1; i++) indices.push(0, i, i + 1);
    g.setIndex(indices); g.computeVertexNormals();
    return this.mesh(g, color, parent, { side: THREE.DoubleSide, ...options });
  }
  prism(parent, outline, depth, color) {
    const shape = new THREE.Shape(); outline.forEach(([x, y], i) => i ? shape.lineTo(x, y) : shape.moveTo(x, y)); shape.closePath();
    const g = new THREE.ExtrudeGeometry(shape, { depth, bevelEnabled: true, bevelThickness: 0.035, bevelSize: 0.035, bevelSegments: 1, curveSegments: 1 });
    g.translate(0, 0, -depth / 2); return this.mesh(g, color, parent);
  }
  glow(parent, size, position, color = 0x35fff2) {
    const key = `glow-${color}`;
    if (!this.materials.has(key)) this.materials.set(key, new THREE.MeshBasicMaterial({ color, toneMapped: false }));
    const m = this.box(parent, size, position, color, 0.025); m.material = this.materials.get(key); m.castShadow = false; return m;
  }
  glowMaterial(color) {
    const key = `glow-${color}`;
    if (!this.materials.has(key)) this.materials.set(key, new THREE.MeshBasicMaterial({ color, toneMapped: false }));
    return this.materials.get(key);
  }
  flower(parent, x, y, z, size = 0.25) {
    const center = new THREE.Vector3(x, y, z);
    for (let i = 0; i < 5; i++) {
      const a = i / 5 * Math.PI * 2;
      const petal = this.mesh(new THREE.SphereGeometry(size * 0.65, 5, 3), i % 2 ? 0xf4a5b1 : 0xf291a7, parent);
      petal.position.copy(center).add(new THREE.Vector3(Math.cos(a) * size * 0.7, Math.sin(a) * size * 0.7, 0)); petal.scale.z = 0.4;
    }
    const pollen = this.mesh(new THREE.SphereGeometry(size * 0.32, 6, 4), 0xffda62, parent); pollen.position.copy(center).add(new THREE.Vector3(0, 0, size * 0.3));
  }
  contactShadow(parent, position, width, depth, strength = 0.25) {
    const key = `contact-shadow-${strength}`;
    if (!this.materials.has(key)) {
      const c = document.createElement('canvas'); c.width = c.height = 128;
      const ctx = c.getContext('2d'), gradient = ctx.createRadialGradient(64, 64, 5, 64, 64, 64);
      gradient.addColorStop(0, `rgba(52,43,28,${strength})`); gradient.addColorStop(0.38, `rgba(52,43,28,${strength * 0.7})`); gradient.addColorStop(1, 'rgba(52,43,28,0)');
      ctx.fillStyle = gradient; ctx.fillRect(0, 0, 128, 128);
      const map = new THREE.CanvasTexture(c); map.colorSpace = THREE.SRGBColorSpace;
      const material = new THREE.MeshBasicMaterial({ map, transparent: true, depthWrite: false, toneMapped: false }); material.userData.shared = true;
      this.materials.set(key, material);
    }
    const m = new THREE.Mesh(new THREE.PlaneGeometry(width, depth), this.materials.get(key)); m.rotation.x = -Math.PI / 2; m.position.set(...position); parent.add(m); return m;
  }
  cylinder(parent, r1, r2, height, position, color, sides = 8) {
    const m = this.mesh(new THREE.CylinderGeometry(r1, r2, height, sides), color, parent); m.position.set(...position); return m;
  }
  beam(parent, a, b, radius, color, sides = 6) {
    const av = new THREE.Vector3(...a), bv = new THREE.Vector3(...b), d = bv.clone().sub(av);
    const m = this.cylinder(parent, radius, radius, d.length(), av.clone().add(bv).multiplyScalar(0.5).toArray(), color, sides);
    m.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), d.normalize()); return m;
  }
  text(parent, content, position, width = 4, height = 0.68, { background = '#28454b', color = '#fff9e8', fontSize = 42 } = {}) {
    const c = document.createElement('canvas'); c.width = 640; c.height = Math.round(640 * height / width);
    const ctx = c.getContext('2d'); ctx.fillStyle = background; ctx.beginPath(); ctx.roundRect(0, 0, c.width, c.height, 12); ctx.fill();
    ctx.fillStyle = color; ctx.font = `600 ${fontSize}px system-ui, sans-serif`; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    ctx.fillText(content, c.width / 2, c.height / 2 + 1, c.width - 35);
    const tex = new THREE.CanvasTexture(c); tex.colorSpace = THREE.SRGBColorSpace; tex.anisotropy = 4;
    const material = new THREE.MeshBasicMaterial({ map: tex, transparent: true, side: THREE.DoubleSide });
    const plane = new THREE.Mesh(new THREE.PlaneGeometry(width, height), material);
    plane.position.set(...position); plane.rotation.x = -0.38; parent.add(plane); this.routeTextures?.push(tex); return plane;
  }
  islandShape(length, width, seed) {
    const s = new THREE.Shape();
    for (let i = 0; i < 60; i++) {
      const a = i / 60 * Math.PI * 2, n = 1 + (seeded(i + seed) - 0.5) * 0.085;
      const x = Math.sign(Math.cos(a)) * Math.pow(Math.abs(Math.cos(a)), 0.35) * length / 2 * n;
      const z = Math.sign(Math.sin(a)) * Math.pow(Math.abs(Math.sin(a)), 0.65) * width / 2 * n + Math.sin(x * 0.55) * 0.4 * Math.pow(Math.abs(Math.sin(a)), 3);
      if (i === 0) s.moveTo(x, z); else s.lineTo(x, z);
    }
    s.closePath(); return s;
  }
  createIsland(length) {
    const shape = this.islandShape(length, 13.8, 4);
    const cliffGeometry = new THREE.ExtrudeGeometry(shape, { depth: 1.15, bevelEnabled: true, bevelThickness: 0.28, bevelSize: 0.22, bevelSegments: 1, steps: 1 });
    const colors = []; for (let i = 0; i < cliffGeometry.attributes.position.count; i++) { const tint = 0.82 + seeded(Math.floor(i / 3) + 91) * 0.25; colors.push(tint, tint, tint); }
    cliffGeometry.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3));
    const bottom = this.mesh(cliffGeometry, C.rock, this.world, { vertexColors: true });
    bottom.rotation.x = -Math.PI / 2; bottom.position.y = -1.13;
    const rim = this.mesh(new THREE.ExtrudeGeometry(shape, { depth: 0.1, bevelEnabled: false }), C.shore);
    rim.rotation.x = -Math.PI / 2; rim.scale.set(1.015, 1.035, 1); rim.position.y = 0.12;
    const sand = this.mesh(new THREE.ExtrudeGeometry(shape, { depth: 0.15, bevelEnabled: true, bevelSize: 0.15, bevelThickness: 0.08, bevelSegments: 1 }), C.sand);
    sand.rotation.x = -Math.PI / 2; sand.position.y = 0.27;
    // A translucent pale shallow-water shelf, with the same faceted shoreline.
    const shelf = this.mesh(new THREE.ShapeGeometry(shape), 0x70f0d1, this.world, { transparent: true, opacity: 0.35, depthWrite: false });
    shelf.rotation.x = -Math.PI / 2; shelf.scale.set(1.08, 1.16, 1); shelf.position.y = -0.78; shelf.castShadow = false;
  }
  createWater() {
    const geo = new THREE.PlaneGeometry(450, 260, 110, 80).toNonIndexed(); geo.rotateX(-Math.PI / 2);
    const colors = [], positions = geo.getAttribute('position');
    const deep = new THREE.Color(0x0095a7), shallow = new THREE.Color(0x1bb2b8);
    for (let i = 0; i < positions.count; i++) { const col = deep.clone().lerp(shallow, 0.08 + seeded(Math.floor(i / 3)) * 0.12); colors.push(col.r, col.g, col.b); }
    geo.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3));
    this.water = new THREE.Mesh(geo, new THREE.MeshBasicMaterial({ vertexColors: true, toneMapped: false, fog: false }));
    this.water.position.y = -1.05; this.water.receiveShadow = true; this.scene.add(this.water);
    this.wavelets = new THREE.Group(); this.scene.add(this.wavelets);
    const waveGeo = new THREE.PlaneGeometry(0.65, 0.035); waveGeo.rotateX(-Math.PI / 2);
    const waveMaterial = new THREE.MeshBasicMaterial({ color: 0xd8fff3, transparent: true, opacity: 0.3, depthWrite: false });
    for (let i = 0; i < 125; i++) {
      const wave = new THREE.Mesh(waveGeo, waveMaterial); const x = (seeded(i + 1) - 0.5) * 150, z = (seeded(i + 190) - 0.5) * 85;
      wave.position.set(x, -0.97, z); wave.scale.x = 0.8 + seeded(i + 33) * 3; wave.userData.baseX = x; this.wavelets.add(wave);
    }
  }
  coastalPath(x) {
    const edgeStart = this.islandLength / 2 - 5.2, side = Math.sign(x);
    const distance = Math.abs(x) - edgeStart;
    if (distance <= 0) return { z: pathZ(x), slope: pathSlope(x) };
    // Only the unused road beyond the stops bends into the coastal portals.
    const edgeX = side * edgeStart, initialSlope = side * pathSlope(edgeX);
    const bend = (-0.75 - initialSlope) / 2.8;
    return { z: pathZ(edgeX) + initialSlope * distance + bend * distance ** 2 / 2, slope: side * (initialSlope + bend * distance) };
  }
  road(start, end) {
    const positions = [], uv = [], indices = [], n = Math.ceil((end - start) * 4);
    for (let i = 0; i <= n; i++) { const x = lerp(start, end, i / n), z = this.coastalPath(x).z; positions.push(x, 0.56, z - 1.7, x, 0.56, z + 1.7); uv.push(i / n, 0, i / n, 1); if (i < n) { const k = i * 2; indices.push(k, k + 1, k + 2, k + 1, k + 3, k + 2); } }
    const geo = new THREE.BufferGeometry(); geo.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3)); geo.setAttribute('uv', new THREE.Float32BufferAttribute(uv, 2)); geo.setIndex(indices); geo.computeVertexNormals();
    const road = this.mesh(geo, C.road); road.castShadow = false;
    const points = Array.from({ length: 120 }, (_, i) => { const x = lerp(start, end, i / 119); return new THREE.Vector3(x, 0.595, this.coastalPath(x).z); });
    const glow = this.mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(points), 140, 0.055, 5, false), C.aqua, this.world, { emissive: C.aqua, emissiveIntensity: 0.7 });
    if (!this.materials.has('cyan-route')) this.materials.set('cyan-route', new THREE.MeshBasicMaterial({ color: 0x55fff0, toneMapped: false }));
    glow.material = this.materials.get('cyan-route'); glow.castShadow = false;
  }
  coastalTunnel(x, outward) {
    const tunnel = new THREE.Group();
    tunnel.name = outward < 0 ? 'Coastal entrance tunnel' : 'Coastal exit tunnel';
    const { z, slope } = this.coastalPath(x);
    tunnel.position.set(x, 0.56, z);
    // Local +Z faces onto the island; the road continues behind the portal.
    tunnel.rotation.y = (outward < 0 ? Math.PI / 2 : -Math.PI / 2) - Math.atan(slope);
    this.world.add(tunnel);
    this.rockFootprints.push({ x: x + outward * 1.2, z, radius: 3.5 });

    const inner = 2.12, outer = 2.84, spring = 2.05;
    const stones = [0xb9ad99, 0xc6b79e, 0xa99c8a, 0xc0b29b];
    for (const side of [-1, 1]) {
      // Thick side walls and individual portal stones leave a real opening.
      this.box(tunnel, [outer - inner, spring, 2.9], [side * (inner + outer) / 2, spring / 2, -1.3], 0x928b80, 0.06);
      for (let row = 0; row < 3; row++) this.box(tunnel, [0.79, 0.67, 0.58], [side * 2.48, 0.34 + row * 0.69, 0.12], stones[row], 0.035);
    }
    for (let i = 0; i < 11; i++) {
      const a = i * Math.PI / 11 + 0.007, b = (i + 1) * Math.PI / 11 - 0.007;
      const wedge = [[Math.cos(a) * inner, spring + Math.sin(a) * inner], [Math.cos(a) * outer, spring + Math.sin(a) * outer], [Math.cos(b) * outer, spring + Math.sin(b) * outer], [Math.cos(b) * inner, spring + Math.sin(b) * inner]];
      this.prism(tunnel, wedge, 2.6, i % 2 ? 0x8e887d : 0xa29888).position.z = -1.4;
      this.prism(tunnel, wedge, 0.56, stones[i % stones.length]).position.z = 0.15;
    }
    // A recessed, unlit end hides the actual road edge and gives the bore depth.
    const bore = new THREE.Shape(); bore.moveTo(-inner, -0.04); bore.lineTo(inner, -0.04); bore.lineTo(inner, spring);
    for (let i = 0; i <= 16; i++) { const angle = i * Math.PI / 16; bore.lineTo(Math.cos(angle) * inner, spring + Math.sin(angle) * inner); }
    bore.closePath();
    const darkness = new THREE.Mesh(new THREE.ShapeGeometry(bore), this.glowMaterial(0x142a2c));
    darkness.position.z = -2.62; tunnel.add(darkness);
    for (const side of [-1, 1]) {
      const boulder = this.mesh(new THREE.IcosahedronGeometry(1, 1), side < 0 ? 0xa89d8c : 0xb6a994, tunnel);
      boulder.position.set(side * 3.05, 1.6, -1.35); boulder.scale.set(0.95, 1.9, 1.55); boulder.rotation.y = side * 0.4;
      this.box(tunnel, [0.24, 0.42, 0.25], [side * 2.15, 1.7, -0.25], 0x59574e, 0.03);
      this.glow(tunnel, [0.12, 0.27, 0.08], [side * 2.15, 1.7, -0.09], 0xffd18a);
    }
    const crown = this.mesh(new THREE.IcosahedronGeometry(1, 1), 0xaa9f8e, tunnel);
    crown.position.set(-0.2, 4.65, -1.5); crown.scale.set(2.7, 1.05, 1.45); crown.rotation.y = 0.2;
    this.contactShadow(tunnel, [0, 0.015, 0.3], 6.8, 4.8, 0.36);
  }
  rock(x, z, size = 1.5, seed = 1) {
    const geo = new THREE.IcosahedronGeometry(1, 1), p = geo.attributes.position;
    for (let i = 0; i < p.count; i++) {
      const px = p.getX(i), py = p.getY(i), pz = p.getZ(i);
      const n = 0.88 + seeded(Math.round((px + 2) * 501 + (py + 2) * 103 + (pz + 2) * 907) + seed) * 0.22;
      p.setXYZ(i, px * n, py * n, pz * n);
    }
    geo.computeVertexNormals();
    this.rockFootprints?.push({ x, z, radius: size * 0.85 });
    const m = this.mesh(geo, [0xa79a92, 0xb4a398, 0x9d9291][Math.floor(seeded(seed) * 3)]);
    this.contactShadow(this.world, [x, 0.47, z], size * 2, size * 1.55, 0.3);
    m.position.set(x, 0.42 + size * 0.39, z); m.scale.set(size * 0.8, size, size * 0.72); m.rotation.y = seeded(seed + 4) * 3; return m;
  }
  grass(x, z, seed) {
    const g = new THREE.Group(); g.position.set(x, 0.45, z); this.world.add(g);
    for (let i = 0; i < 7; i++) {
      const a = i * 2.4 + seed, h = 0.65 + seeded(seed + i) * 0.45;
      const blade = this.polygon(g, [[-0.08, 0, 0], [-0.16, h * 0.55, 0], [0.12, h, 0], [0.12, h * 0.5, 0], [0.08, 0, 0]], i % 2 ? 0xb7c945 : 0x83a431);
      blade.rotation.y = a; blade.rotation.z = Math.cos(a) * 0.38; blade.position.set(Math.cos(a) * 0.1, 0, Math.sin(a) * 0.1);
    }
  }
  palm(x, z, scale = 1, flip = false) {
    // Reserve canopy clearance as well as trunk clearance against every rock.
    const clear = (px, pz) => this.rockFootprints.every(r => Math.hypot(px - r.x, pz - r.z) > r.radius + 2.7 * scale) && this.palmFootprints.every(p => Math.hypot(px - p.x, pz - p.z) > 3.6) && this.positions.every(sx => Math.abs(px - sx) > 2.7 || Math.abs(pz - (pathZ(sx) - 3.6)) > 2.1);
    if (!clear(x, z)) {
      let position;
      for (const offset of [3, -3, 6, -6, 9, -9, 12, -12, 15, -15]) {
        const px = clamp(x + offset, -this.islandLength / 2 + 2, this.islandLength / 2 - 2);
        if (clear(px, z)) { position = px; break; }
      }
      if (position === undefined) return;
      x = position;
    }
    this.palmFootprints.push({ x, z });
    const g = new THREE.Group(); g.position.set(x, 0.4, z); g.scale.setScalar(scale); this.world.add(g);
    this.contactShadow(this.world, [x, 0.47, z], 2.3 * scale, 1.8 * scale, 0.2);
    const lean = flip ? -0.75 : 0.75, height = 3.9;
    for (let i = 0; i < 9; i++) {
      const f0 = i / 9, f1 = (i + 1) / 9;
      this.beam(g, [lean * f0 * f0, height * f0, 0], [lean * f1 * f1, height * f1, 0], 0.2 - i * 0.009, i % 2 ? 0xa96f36 : 0xc78943, 7);
    }
    for (let i = 0; i < 8; i++) {
      const verts = [], indices = [], lengths = [0, 0.6, 1.35, 2.15, 2.75], heights = [0, 0.48, 0.5, 0.05, -0.75], widths = [0.02, 0.3, 0.39, 0.28, 0.01];
      for (let j = 0; j < lengths.length; j++) verts.push(lengths[j], heights[j] - 0.07, -widths[j], lengths[j], heights[j] + 0.11, 0, lengths[j], heights[j] - 0.07, widths[j]);
      for (let j = 0; j < 4; j++) { const k = j * 3; indices.push(k, k + 3, k + 1, k + 1, k + 3, k + 4, k + 1, k + 4, k + 2, k + 2, k + 4, k + 5); }
      const geo = new THREE.BufferGeometry(); geo.setAttribute('position', new THREE.Float32BufferAttribute(verts, 3)); geo.setIndex(indices); geo.computeVertexNormals();
      const leaf = this.mesh(geo, i % 2 ? 0xa9bf30 : 0x88ad24, g, { side: THREE.DoubleSide }); leaf.position.set(lean, height, 0); leaf.rotation.y = i / 8 * Math.PI * 2; leaf.scale.x = 0.85 + seeded(i + x) * 0.2;
    }
    for (let i = 0; i < 3; i++) this.mesh(new THREE.IcosahedronGeometry(0.19, 1), 0x926333, g).position.set(lean + Math.cos(i * 2) * 0.22, height - 0.25, Math.sin(i * 2) * 0.22);
    return g;
  }
  fence(x, z, length = 3.2) {
    const g = new THREE.Group(); g.position.set(x, 0.4, z); this.world.add(g);
    for (const side of [-1, 1]) { this.box(g, [0.18, 1.15, 0.2], [side * length / 2, 0.56, 0], 0x9d713f); this.box(g, [0.3, 0.12, 0.3], [side * length / 2, 1.1, 0], 0x825d35); }
    for (const y of [0.43, 0.86]) this.box(g, [length, 0.12, 0.12], [0, y, 0], 0xc49555);
  }
  lamp(x, z) {
    const g = new THREE.Group(); g.position.set(x, 0.4, z); this.world.add(g);
    this.box(g, [0.2, 1.1, 0.2], [0, 0.55, 0], 0xb18449);
    this.glow(g, [0.32, 0.4, 0.32], [0, 1.25, 0], 0xffd781);
    for (const x of [-0.19, 0.19]) for (const z of [-0.19, 0.19]) this.box(g, [0.055, 0.47, 0.055], [x, 1.25, z], 0x98703e);
    this.box(g, [0.48, 0.12, 0.48], [0, 1.5, 0], 0x8f713f);
    this.box(g, [0.45, 0.1, 0.45], [0, 1, 0], 0x8f713f);
  }
  starFish(x, z) {
    const shape = new THREE.Shape();
    for (let i = 0; i < 10; i++) { const a = i / 10 * Math.PI * 2, r = i % 2 ? 0.12 : 0.36; if (i) shape.lineTo(Math.cos(a) * r, Math.sin(a) * r); else shape.moveTo(Math.cos(a) * r, Math.sin(a) * r); }
    shape.closePath();
    const star = this.mesh(new THREE.ExtrudeGeometry(shape, { depth: 0.05, bevelEnabled: true, bevelThickness: 0.025, bevelSize: 0.025, bevelSegments: 1 }), 0xe8a136);
    star.rotation.x = -Math.PI / 2; star.position.set(x, 0.48, z);
  }
  makeIcon(type, parent) {
    const g = new THREE.Group(); parent.add(g);
    if (type === 'hello') {
      this.box(g, [2.6, 1.15, 0.2], [0, 1.05, 0], 0xc78a4b, 0.08);
      this.text(g, 'HELLO', [0, 1.07, 0.13], 2.4, 0.8, { background: '#c78a4b', color: '#fff3d4', fontSize: 70 });
      for (const x of [-1, 1]) this.box(g, [0.14, 1.4, 0.2], [x, 0.35, 0], 0xa8743f);
      this.mesh(new THREE.IcosahedronGeometry(0.22, 0), 0xf2a2a6, g).position.set(1.5, 0.3, 0.3);
    } else if (type === 'case') {
      g.position.y = -0.15;
      this.box(g, [2, 1.3, 0.65], [0, 0.8, 0], 0xbb813f, 0.12);
      this.box(g, [2.04, 0.45, 0.67], [0, 1.1, 0], 0xdca257, 0.04);
      this.box(g, [0.3, 0.35, 0.08], [0, 0.88, 0.38], 0xffd076);
      this.box(g, [0.75, 0.15, 0.18], [0, 1.75, 0], 0x956538);
      for (const x of [-0.3, 0.3]) this.box(g, [0.14, 0.35, 0.18], [x, 1.58, 0], 0x956538);
    } else if (type === 'game') {
      g.position.y = 0.35;
      this.box(g, [2.4, 1.05, 0.55], [0, 0.8, 0], 0xfff3d5, 0.3);
      for (const [x, y, col] of [[0.7, 0.92, 0xffb949], [0.95, 0.7, 0xea8b83], [0.45, 0.7, 0x71c8d2]]) this.cylinder(g, 0.14, 0.14, 0.1, [x, y, 0.34], col).rotation.x = Math.PI / 2;
      this.box(g, [0.65, 0.18, 0.1], [-0.6, 0.8, 0.34], 0x415359); this.box(g, [0.18, 0.65, 0.1], [-0.6, 0.8, 0.34], 0x415359);
    } else if (type === 'blocks' || type === 'puzzle') {
      for (const [x, y, col] of [[-0.5, 0.45, 0x44bcd4], [0.5, 0.45, 0xec91aa], [0, 1.4, 0xffcf45]]) { this.box(g, [0.92, 0.92, 0.92], [x, y, 0], col, 0.05); this.box(g, [0.4, 0.4, 0.035], [x, y, 0.48], col === 0xffcf45 ? 0xefb631 : col === 0x44bcd4 ? 0x35a9c2 : 0xd97f9a); }
      if (type === 'puzzle') {
        for (const side of [-1, 1]) for (let i = 0; i < 4; i++) this.box(g, [0.45, 0.46, 0.57], [side * 1.22, 0.23 + i * 0.49, -0.45], i % 2 ? 0xc9b18a : 0xe0c59a, 0.025);
        for (let i = 0; i < 9; i++) {
          const a = i / 9 * Math.PI, b = (i + 1) / 9 * Math.PI - 0.018;
          const outline = [[Math.cos(a) * 1, 1.96 + Math.sin(a) * 1], [Math.cos(a) * 1.46, 1.96 + Math.sin(a) * 1.46], [Math.cos(b) * 1.46, 1.96 + Math.sin(b) * 1.46], [Math.cos(b) * 1, 1.96 + Math.sin(b) * 1]];
          this.prism(g, outline, 0.55, i % 2 ? 0xd6bb91 : 0xe7cfa5).position.z = -0.45;
        }
        for (const side of [-1, 1]) {
          const points = [];
          for (let j = 0; j < 12; j++) { const a = (side < 0 ? Math.PI : 0) + side * j * 0.045; points.push(new THREE.Vector3(Math.cos(a) * 1.45, 1.7 + Math.sin(Math.abs(a)) * 1.25 + j * 0.09, -0.08)); }
          this.mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(points), 14, 0.045, 4, false), 0x7e9c2f, g);
          for (let j = 0; j < 5; j++) {
            const leaf = this.mesh(new THREE.SphereGeometry(0.2, 5, 3), j % 2 ? 0x9cbb31 : 0x789e28, g);
            leaf.position.set(side * (1.3 - j * 0.09), 1.6 + j * 0.31, 0.07); leaf.scale.set(1, 0.45, 0.55); leaf.rotation.z = side * 0.5;
          }
        }
        this.flower(g, 1.45, 0.4, 0.65, 0.3); this.flower(g, -1.17, 2.9, 0.02, 0.21);
        for (const side of [-1, 1]) this.mesh(new THREE.IcosahedronGeometry(0.3, 0), 0x92ac38, g).position.set(side * 1.4, 0.2, 0.4);
      }
    } else if (type === 'mail') {
      g.position.y = -0.15;
      this.box(g, [2.15, 1.45, 0.3], [0, 0.9, 0], C.cream, 0.1);
      const geo = new THREE.BufferGeometry(); geo.setAttribute('position', new THREE.Float32BufferAttribute([-1.02, 1.6, 0.17, 1.02, 1.6, 0.17, 0, 0.8, 0.2], 3)); geo.computeVertexNormals(); this.mesh(geo, 0xf6b84b, g, { side: THREE.DoubleSide });
    } else if (type === 'space') {
      g.scale.set(1.12, 1.45, 1.12);
      const profile = [[0.32, 0.22], [0.42, 0.45], [0.49, 1.0], [0.47, 1.55], [0.35, 2.05]].map(([r, y]) => new THREE.Vector2(r, y));
      this.mesh(new THREE.LatheGeometry(profile, 12), 0xfff0d2, g);
      const nose = [[0.35, 2.04], [0.26, 2.36], [0, 2.7]].map(([r, y]) => new THREE.Vector2(r, y));
      this.mesh(new THREE.LatheGeometry(nose, 12), C.orange, g);
      const rim = this.cylinder(g, 0.31, 0.31, 0.13, [0, 1.42, 0.47], 0x5e7a7f, 16); rim.rotation.x = Math.PI / 2;
      const glass = this.cylinder(g, 0.235, 0.235, 0.145, [0, 1.42, 0.51], 0x32c5d2, 16); glass.rotation.x = Math.PI / 2;
      for (const x of [-0.63, 0.63]) this.prism(g, [[x * 0.55, 0.25], [x * 1.4, 0], [x * 1.35, 0.85], [x * 0.65, 1.1]], 0.2, C.orange);
      this.cylinder(g, 0.28, 0.36, 0.28, [0, 0.15, 0], 0x9d9d8c, 10);
      this.cylinder(g, 0.58, 0.66, 0.12, [0, 0.03, 0], 0xc2b9a0, 12);
    } else if (type === 'race') {
      this.cylinder(g, 1.02, 1.02, 0.13, [0, 0.09, 0], 0x788071, 24);
      const track = this.mesh(new THREE.TorusGeometry(0.8, 0.22, 4, 24), 0x586368, g); track.rotation.x = -Math.PI / 2; track.position.y = 0.2;
      for (const x of [-1, 1]) this.beam(g, [x, 0, -0.3], [x, 2.4, -0.3], 0.045, 0x876846);
      for (let row = 0; row < 3; row++) for (let col = 0; col < 8; col++) this.box(g, [0.25, 0.25, 0.055], [-0.875 + col * 0.25, 2.15 - row * 0.25, -0.28], (row + col) % 2 ? 0xf9eed5 : 0x2e3b40);
      for (let j = 0; j < 3; j++) {
        const tyre = this.mesh(new THREE.TorusGeometry(0.25, 0.13, 6, 12), 0x2c3435, g); tyre.rotation.x = Math.PI / 2; tyre.position.set(0.75, 0.14 + j * 0.2, 0.5);
      }
      this.box(g, [0.75, 0.25, 0.25], [-0.45, 0.24, 0.5], C.orange, 0.02);
    } else if (type === 'arena') {
      this.box(g, [2.4, 0.3, 1.4], [0, 0.2, 0], 0x9ab362);
      for (const x of [-0.85, 0.85]) {
        this.box(g, [0.65, 1.45, 0.75], [x, 1, 0], 0xdfcfad);
        for (const dx of [-0.22, 0.22]) this.box(g, [0.2, 0.35, 0.75], [x + dx, 1.85, 0], 0xe9dabb);
        this.beam(g, [x, 1.8, 0], [x, 2.5, 0], 0.035, 0x976d43);
        this.box(g, [0.45, 0.3, 0.04], [x + 0.2, 2.35, 0], x < 0 ? 0xf1a64b : 0x4bc2d0);
      }
      this.box(g, [1.3, 0.75, 0.4], [0, 0.6, -0.25], 0xd4c19e);
    } else if (type === 'building') {
      this.box(g, [2.85, 0.22, 1.6], [0, 0.11, 0], 0x99ae51, 0.07);
      this.box(g, [2.4, 1.6, 1.3], [0, 1, 0], 0xf5e9d0);
      this.box(g, [1.6, 0.8, 1.25], [-0.1, 2.1, 0], 0xfff3dc);
      for (const x of [-0.75, 0, 0.75]) this.box(g, [0.5, 0.46, 0.03], [x, 1.4, 0.67], 0x72b7c7);
      this.box(g, [1.4, 0.15, 0.6], [0, 0.9, 0.9], 0xf1b744);
      this.box(g, [0.65, 0.8, 0.05], [0, 0.45, 0.67], 0x72b7c7);
      for (const x of [-1.1, 1.1]) for (const z of [0.3, 0.7]) this.box(g, [0.35, 0.45, 0.35], [x, 0.34, z], z > 0.5 ? 0xa9bc49 : 0x7e9b3b, 0.035);
    }
    return g;
  }
  station(x, index, item) {
    const group = new THREE.Group(); group.userData.stop = index; group.position.set(x, 0.5, 0); this.world.add(group);
    const z = pathZ(x);
    const pad = this.box(group, [3.05, 0.13, 1.95], [0, 0.14, z], 0x75eddf, 0.14);
    this.box(group, [2.72, 0.05, 1.62], [0, 0.23, z], 0xbdf4d9, 0.1);
    const platformZ = z - 3.6;
    this.contactShadow(group, [0, -0.02, platformZ], 5.8, 4.3, 0.36);
    this.box(group, [3.9, 0.74, 2.9], [0, 0.37, platformZ], 0x9f9180, 0.12);
    this.box(group, [4.04, 0.17, 3.02], [0, 0.79, platformZ], 0xc6b398, 0.075);
    const light = this.glow(group, [2.45, 0.13, 0.065], [0, 0.46, platformZ + 1.47], 0xffc05c);
    light.material = this.material(C.orange, { emissive: C.orange, emissiveIntensity: 0.3 });
    const iconRoot = new THREE.Group(); iconRoot.position.set(0, 0.88, platformZ); group.add(iconRoot);
    this.makeIcon(item.icon || item.visual || 'building', iconRoot);
    this.text(group, `${this.route === 'hub' ? '' : `${String(index + 1).padStart(2, '0')} / `}${item.name.toUpperCase()}`, [0, 0.5, z + 2.05], this.route === 'hub' ? 3.85 : 5.2, 1.12, { fontSize: this.route === 'hub' ? 108 : 76 });
    const marker = this.mesh(new THREE.ConeGeometry(0.25, 0.42, 3), C.aqua, group, { emissive: C.aqua, emissiveIntensity: 0.6 });
    marker.rotation.z = Math.PI; marker.position.set(0, 4.65, platformZ); marker.visible = index === this.index;
    const iconHeight = new THREE.Box3().setFromObject(iconRoot).getSize(new THREE.Vector3()).y;
    marker.userData.baseY = 0.88 + iconHeight * 1.24 + 0.7;
    this.stations.push({ group, iconRoot, iconHeight, iconScale: 1, scaleVelocity: 0, marker, pad, light, anchor: new THREE.Vector3(x, 0.5 + 0.88 + iconHeight, platformZ) });
  }
  clearWorld() {
    this.world.traverse(obj => { if (obj.geometry) obj.geometry.dispose(); if (obj.material?.map && !obj.material.userData.shared) { obj.material.map.dispose(); obj.material.dispose(); } });
    this.world.clear(); this.routeTextures = [];
  }
  setRoute(route, items, selected = 0, immediate = false) {
    if (this.route === route && this.routeItems === items && this.stations?.length) { this.go(selected, immediate); return; }
    this.clearWorld(); this.rockFootprints = []; this.palmFootprints = []; this.route = route; this.routeItems = items; this.index = selected; this.stations = [];
    this.spacing = route === 'hub' ? 8 : 9.5;
    this.positions = items.map((_, i) => (i - (items.length - 1) / 2) * this.spacing);
    const length = Math.max(45, (items.length - 1) * this.spacing + 13);
    this.islandLength = length;
    this.createIsland(length + 3); this.road(-length / 2 + 1, length / 2 - 1);
    this.coastalTunnel(-length / 2 + 2.4, -1);
    this.coastalTunnel(length / 2 - 2.4, 1);
    items.forEach((item, i) => this.station(this.positions[i], i, item));
    // Place rock clusters before foliage so trees can find a clear footprint.
    this.positions.forEach((x, i) => {
      if (i % 3 === 0) { this.rock(x - 1.5, -6.2, 3.2 + seeded(i + 2) * 0.6, i); this.rock(x + 0.8, -5.9, 2.2, i + 37); }
    });
    this.rock(-length / 2 + 4.4, -4.8, 2.6, 55);
    for (let i = 0; i < Math.ceil(length / 5); i++) {
      const x = -length / 2 + 2 + i * 5;
      this.fence(x, 4.4, 4.5);
      if (i % 3 === 0) this.lamp(x + 1.8, 4.35);
      this.grass(x + seeded(i + 100), -5.8, i + 3);
      if (i % 3 === 1) this.palm(x, -5.9, 0.95 + seeded(i) * 0.18, i % 2 === 0);
      if (i % 3 === 0) this.rock(x, 6.1, 0.55, i + 20);
      this.grass(x + 1, 3.5, i + 23);
      if (i % 2 === 1) { this.rock(x + 1.7, 5.6, 0.55, i + 211); this.starFish(x - 0.8, 5.4); }
    }
    this.palm(-length / 2 + 2, -3.5, 1.1);
    this.createPier(length / 2 - 3);
    this.carX = this.positions[selected]; this.destinationX = this.carX; this.moving = false;
    this.go(selected, true);
    this.world.updateMatrixWorld(true);
    this.overviewBounds = new THREE.Box3().setFromObject(this.world).expandByScalar(0.65);
    this.resize();
    this.focusX = route === 'hub' ? 0 : this.carX;
    this.visualZoom = this.viewHalfHeight();
  }
  createPier(x) {
    const g = new THREE.Group(); g.position.set(x, 0.2, 4.4); this.world.add(g);
    for (let i = 0; i < 9; i++) this.box(g, [2.6, 0.14, 0.34], [0, 0, i * 0.38], 0xc28e4f);
    for (const z of [0, 2.8]) for (const side of [-1, 1]) this.cylinder(g, 0.13, 0.16, 1.9, [side * 1.4, -0.1, z], 0xa4713a);
    if (this.route !== 'hub') this.text(g, 'END OF THE ROUTE', [0, 1, 3], 2.8, 0.65, { fontSize: 36 });
  }
  createCar() {
    this.car = new THREE.Group(); this.scene.add(this.car);
    this.carShadow = this.contactShadow(this.scene, [this.carX, 0.608, pathZ(this.carX)], 4.5, 2.5, 0.3);
    this.prism(this.car, [[-1.31, 0.38], [1.31, 0.38], [1.32, 0.76], [1.13, 0.9], [-1.19, 0.9], [-1.32, 0.72]], 1.2, C.orange);
    this.box(this.car, [2.45, 0.11, 1.26], [0, 0.38, 0], 0xa9551d, 0.035);
    this.prism(this.car, [[-0.99, 0.87], [0.6, 0.87], [0.2, 1.55], [-0.77, 1.55]], 1.04, C.orange);
    this.box(this.car, [0.97, 0.045, 1.07], [-0.28, 1.58, 0], 0xfb8b14, 0.025);
    for (const side of [-1, 1]) {
      const z = side * 0.59;
      this.polygon(this.car, [[-0.74, 1.43, z], [-0.23, 1.43, z], [-0.23, 1.01, z], [-0.88, 1.01, z]], 0x22444f, { roughness: 0.28 });
      this.polygon(this.car, [[-0.14, 1.43, z], [0.16, 1.43, z], [0.42, 1.01, z], [-0.14, 1.01, z]], 0x2b5362, { roughness: 0.28 });
      this.box(this.car, [0.16, 0.04, 0.04], [-0.38, 0.86, side * 0.629], 0x583f25, 0.012);
      this.box(this.car, [0.16, 0.04, 0.04], [0.3, 0.86, side * 0.629], 0x583f25, 0.012);
      this.box(this.car, [2.27, 0.035, 0.028], [0, 0.52, side * 0.631], 0xeac075);
      this.box(this.car, [0.2, 0.16, 0.12], [0.4, 1.01, side * 0.69], C.orange, 0.025);
      this.beam(this.car, [-0.17, 0.46, side * 0.634], [-0.17, 0.92, side * 0.634], 0.008, 0xc06314, 3);
    }
    this.polygon(this.car, [[0.28, 1.44, -0.45], [0.28, 1.44, 0.45], [0.55, 0.99, 0.49], [0.55, 0.99, -0.49]], 0x234c5b, { roughness: 0.3 });
    this.polygon(this.car, [[-0.85, 1.44, -0.44], [-0.85, 1.44, 0.44], [-1.01, 1, 0.48], [-1.01, 1, -0.48]], 0x284852, { roughness: 0.3 });
    this.box(this.car, [0.58, 0.045, 1.03], [0.89, 0.9, 0], 0xfa8711, 0.025);
    this.box(this.car, [0.09, 0.15, 1.23], [1.35, 0.43, 0], 0x657276, 0.025);
    this.box(this.car, [0.09, 0.14, 1.23], [-1.35, 0.43, 0], 0x657276, 0.025);
    this.box(this.car, [0.03, 0.2, 0.43], [1.367, 0.65, 0], 0x243e43);
    for (const z of [-0.43, 0.43]) {
      this.glow(this.car, [0.035, 0.2, 0.27], [1.36, 0.73, z], 0xfff2c7);
      this.box(this.car, [0.03, 0.19, 0.18], [-1.34, 0.69, z], 0xc84732, 0.025);
    }
    this.box(this.car, [0.025, 0.11, 0.3], [-1.39, 0.49, 0], 0xfff4ce);
    for (const x of [-0.88, 0.87]) for (const z of [-0.65, 0.65]) {
      const pivot = new THREE.Group(); pivot.position.set(x, 0.34, z); this.car.add(pivot);
      const wheel = this.cylinder(pivot, 0.35, 0.35, 0.24, [0, 0, 0], 0x293238, 14); wheel.rotation.x = Math.PI / 2;
      const hub = this.cylinder(pivot, 0.22, 0.22, 0.255, [0, 0, 0], 0x8e9b9b, 12); hub.rotation.x = Math.PI / 2;
      const cap = this.cylinder(pivot, 0.14, 0.14, 0.27, [0, 0, 0], 0xced3c7, 10); cap.rotation.x = Math.PI / 2;
      for (let i = 0; i < 5; i++) {
        const a = i / 5 * Math.PI * 2;
        this.box(pivot, [0.035, 0.09, 0.277], [Math.sin(a) * 0.17, Math.cos(a) * 0.17, 0], 0x546468).rotation.z = -a;
      }
      this.wheels.push(pivot);
    }
    this.car.scale.setScalar(1.18);
    this.car.position.set(this.carX, 0.63, pathZ(this.carX));
  }
  createBirds() {
    this.birds = new THREE.Group(); this.scene.add(this.birds);
    for (let i = 0; i < 4; i++) {
      const g = new THREE.Group(); this.birds.add(g);
      this.beam(g, [-0.45, 0.12, 0], [0, 0, 0], 0.025, 0xf9f4d9, 3); this.beam(g, [0, 0, 0], [0.45, 0.12, 0], 0.025, 0xf9f4d9, 3);
      g.userData.phase = i * 1.7;
    }
  }
  go(index, immediate = false) {
    this.index = index; this.destinationX = this.positions?.[index] ?? 0;
    if (this.drive && this.destinationX === this.drive.to) return;
    if (immediate || this.reducedMotion) {
      this.carX = this.destinationX; this.drive = null; this.moving = false; this.onMove?.(false);
    } else {
      const distance = Math.abs(this.destinationX - this.carX);
      this.drive = distance < 0.01 ? null : { from: this.carX, to: this.destinationX, started: performance.now(), duration: clamp(650 + Math.sqrt(distance) * 390, 800, 3400) };
      this.moving = Boolean(this.drive); this.onMove?.(this.moving);
    }
    this.stations?.forEach((s, i) => {
      s.marker.visible = i === index;
      s.light.material = this.glowMaterial(i === index ? 0x3dfff1 : 0xffbd51);
      s.pad.material = this.glowMaterial(i === index ? 0x35fff1 : 0x68dcd6);
    });
  }
  resize() {
    const w = window.innerWidth, h = window.innerHeight; this.mobile = w <= 700; this.aspect = w / h;
    this.renderer.setSize(w, h); this.baseHalfHeight = this.mobile ? 13.2 : clamp(24 / this.aspect, 10.5, 19);
    this.renderer.setPixelRatio(Math.min(devicePixelRatio, this.mobile ? 1.5 : 1.7));
    this.fitOverview();
    this.camera.updateProjectionMatrix();
  }
  fitOverview() {
    if (!this.overviewBounds) return;
    // Project the complete island into camera space, then fit it between the UI.
    const direction = new THREE.Vector3(-4.5, 24, 35).normalize();
    const right = new THREE.Vector3().crossVectors(new THREE.Vector3(0, 1, 0), direction).normalize();
    const up = new THREE.Vector3().crossVectors(direction, right).normalize();
    const min = this.overviewBounds.min, max = this.overviewBounds.max;
    let left = Infinity, rightEdge = -Infinity, bottom = Infinity, top = -Infinity;
    for (const x of [min.x, max.x]) for (const y of [min.y, max.y]) for (const z of [min.z, max.z]) {
      const point = new THREE.Vector3(x, y, z), px = point.dot(right), py = point.dot(up);
      left = Math.min(left, px); rightEdge = Math.max(rightEdge, px); bottom = Math.min(bottom, py); top = Math.max(top, py);
    }
    const h = innerHeight, w = innerWidth;
    const cardWidth = w >= 1700 ? 410 : w > 1100 ? 380 : 345;
    const safeLeft = this.mobile ? 18 : 32;
    const safeRight = this.mobile ? w - 18 : w - cardWidth - 64;
    const safeTop = this.mobile ? h * (h <= 650 ? 0.50 : 0.57) : Math.min(180, h * 0.23);
    const safeBottom = h - (this.mobile ? 225 : h <= 500 ? 155 : 220);
    const usableHeight = Math.max(40, safeBottom - safeTop);
    const usableWidth = Math.max(w * 0.35, safeRight - safeLeft);
    this.overviewHalfHeight = Math.max((rightEdge - left) * h / (2 * usableWidth), (top - bottom) * h / (2 * usableHeight));
    const centerY = 1 - (safeTop + safeBottom) / h;
    const centerX = (safeLeft + safeRight) / w - 1;
    this.overviewLook = up.multiplyScalar((top + bottom) / 2 - centerY * this.overviewHalfHeight)
      .add(right.multiplyScalar((left + rightEdge) / 2 - centerX * this.overviewHalfHeight * this.aspect));
  }
  viewHalfHeight() { return this.route === 'hub' ? (this.overviewHalfHeight || this.baseHalfHeight) : this.mobile ? 12 : Math.min(this.baseHalfHeight, 11.5); }
  setPaused(paused) {
    if (Boolean(this.paused) === paused) return;
    if (paused) this.pauseStarted = performance.now();
    else if (this.drive) this.drive.started += performance.now() - this.pauseStarted;
    this.paused = paused;
  }
  getAnchor() {
    const a = this.stations?.[this.index]?.anchor; if (!a) return { x: innerWidth / 2, y: innerHeight / 2 };
    const p = a.clone().project(this.camera); return { x: (p.x + 1) * innerWidth / 2, y: (-p.y + 1) * innerHeight / 2 };
  }
  animate(now) {
    if (this.disposed) return;
    const dt = Math.min((now - this.lastTime) / 1000, 0.05); this.lastTime = now; const t = now / 1000;
    if (this.paused) return;
    const previousX = this.carX;
    if (this.drive) {
      const p = (now - this.drive.started) / this.drive.duration;
      this.carX = lerp(this.drive.from, this.drive.to, drivingProgress(p));
      if (p >= 1 || this.reducedMotion) { this.carX = this.drive.to; this.drive = null; }
    }
    const moving = Boolean(this.drive);
    if (moving !== this.moving) { this.moving = moving; this.onMove?.(moving); }
    const delta = this.carX - previousX;
    const padLift = 0.14 * Math.max(0, 1 - Math.abs(this.destinationX - this.carX) / 1.7);
    this.car.position.set(this.carX, 0.63 + padLift + (moving && !this.reducedMotion ? Math.sin(t * 24) * 0.013 : 0), pathZ(this.carX));
    this.carShadow.position.set(this.carX, 0.608, pathZ(this.carX));
    this.car.rotation.y = -Math.atan(pathSlope(this.carX));
    this.carShadow.rotation.z = this.car.rotation.y;
    this.wheels.forEach(w => { w.rotation.z -= delta / 0.32; });
    const focus = this.route === 'hub' ? 0 : this.carX;
    this.focusX = lerp(this.focusX, focus, 1 - Math.exp(-dt * 3));
    const halfH = this.viewHalfHeight();
    this.visualZoom = lerp(this.visualZoom, halfH, 1 - Math.exp(-dt * 3));
    this.camera.left = -this.visualZoom * this.aspect; this.camera.right = this.visualZoom * this.aspect;
    this.camera.top = this.visualZoom; this.camera.bottom = -this.visualZoom; this.camera.updateProjectionMatrix();
    // Offset the look target toward sea: the car stays below the compact card.
    const look = this.route === 'hub' && this.overviewLook ? this.overviewLook.clone() : new THREE.Vector3(this.focusX + (this.mobile ? 0 : 0.6), 0, this.mobile ? -8.3 : -3.8);
    this.camera.position.copy(look).add(new THREE.Vector3(-4.5, 24, 35)); this.camera.lookAt(look);
    this.sun.position.set(this.focusX - 12, 27, 11); this.sun.target.position.set(this.focusX, 0, 0); this.sun.target.updateMatrixWorld();
    this.stations?.forEach((s, i) => {
      if (s.marker.visible) s.marker.position.y = s.marker.userData.baseY + (this.reducedMotion ? 0 : Math.sin(t * 2.5) * 0.12);
      const targetScale = i === this.index && !moving ? 1.24 : 1;
      if (this.reducedMotion) { s.iconScale = targetScale; s.scaleVelocity = 0; }
      else { s.scaleVelocity += (targetScale - s.iconScale) * 105 * dt; s.scaleVelocity *= Math.exp(-12 * dt); s.iconScale += s.scaleVelocity * dt; }
      s.iconRoot.scale.setScalar(s.iconScale);
      s.anchor.y = 0.5 + s.iconRoot.position.y + s.iconHeight * s.iconScale;
    });
    if (!this.reducedMotion) {
      this.wavelets.children.forEach((w, i) => { w.position.x = w.userData.baseX + Math.sin(t * 0.3 + i) * 0.35; });
      this.birds.children.forEach((b, i) => { const a = t * 0.08 + b.userData.phase; b.position.set(this.focusX + Math.sin(a) * 17, 8 + i * 0.65, -13 + Math.cos(a) * 7); b.rotation.y = -a; b.rotation.z = Math.sin(t * 1.7 + i) * 0.07; });
    }
    this.renderer.render(this.scene, this.camera);
  }
  dispose() {
    this.disposed = true; this.renderer.setAnimationLoop(null); window.removeEventListener('resize', this.resize);
    this.canvas.removeEventListener('pointerdown', this.pointerDown); this.canvas.removeEventListener('pointerup', this.pointerUp);
    this.clearWorld(); this.scene.traverse(o => { o.geometry?.dispose(); }); this.materials.forEach(m => { m.map?.dispose(); m.dispose(); }); this.renderer.dispose();
  }
}
