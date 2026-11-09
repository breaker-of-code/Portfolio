import * as THREE from 'three';
import { RoundedBoxGeometry } from 'three/addons/geometries/RoundedBoxGeometry.js';
import { advanceDriving, MAX_DRIVING_SPEED } from './motion.js';
import { referenceHalfHeight, viewportHalfHeight, fittedZoom } from './camera-layout.js';
import { CoastalOcean } from './ocean.js';
import { createJeep } from './jeep.js';
import { JeepExhaust } from './exhaust.js';
import { createArcade } from './arcade.js';
import { createDeveloperDesk } from './developer-desk.js';
import { createSkillsGears } from './skills-gears.js';
import { createIntroAvatar } from './intro-avatar.js';
import { createContactMailbox } from './contact-mailbox.js';
import { createRouteAssetLoader } from './route-assets.js';
import { createPerformanceProbe } from './performance-probe.js';
import { AdaptiveQuality, QUALITY_PROFILES, initialQuality, cappedPixelRatio } from './quality.js';
import { batchStaticMeshes } from './mesh-batching.js';

const C = { sand: 0xf6c77f, shore: 0xffe1a1, rock: 0xa49a91, road: 0x505c67, aqua: 0x33f5ed, orange: 0xf77b08, dark: 0x183b44, green: 0x91af35, cream: 0xfff4d9 };
const clamp = THREE.MathUtils.clamp;
const lerp = THREE.MathUtils.lerp;
const seeded = n => { const x = Math.sin(n * 127.1 + 311.7) * 43758.5453; return x - Math.floor(x); };
const pathZ = x => Math.sin(x * 0.19) * 1.5;
const pathSlope = x => Math.cos(x * 0.19) * 1.5 * 0.19;

export class CoastalScene {
  constructor(canvas, { onStop, onCar, onMove, onSpeed, onSplash, onApproach, onWaypoint, onReady, onError, reducedMotion = false, zoomLevels = {} } = {}) {
    this.canvas = canvas;
    this.onCar = onCar;
    this.onSplash = onSplash;
    this.zoomLevels = { hub: null, career: null, projects: null, ...zoomLevels };
    this.onStop = onStop; this.onMove = onMove; this.onSpeed = onSpeed; this.onApproach = onApproach; this.onWaypoint = onWaypoint; this.carSpeed = 0; this.reducedMotion = reducedMotion;
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0x069caa);
    this.scene.fog = new THREE.Fog(0x069caa, 250, 600);
    this.camera = new THREE.OrthographicCamera(-30, 30, 20, -20, 0.1, 800);
    this.camera.position.set(18, 30, 39);
    this.target = new THREE.Vector3(); this.cameraCenter = new THREE.Vector3();
    this.routeAssets = createRouteAssetLoader();
    this.materials = new Map(); this.disposed = false; this.route = 'hub'; this.index = 0;
    this.carX = -16; this.destinationX = -16; this.moving = false; this.routeItems = [];
    this.focusX = 0; this.visualZoom = 1; this.activeHalo = null; this.wheels = [];
    const params = new URLSearchParams(location.search);
    this.fixedQuality = params.has('benchmark') && Object.hasOwn(QUALITY_PROFILES, params.get('quality')) ? params.get('quality') : null;
    this.qualityLevel = this.fixedQuality || initialQuality({ mobile: this.isMobileViewport(), memory: navigator.deviceMemory, cores: navigator.hardwareConcurrency });
    this.qualityProfile = QUALITY_PROFILES[this.qualityLevel];
    this.qualityController = new AdaptiveQuality(this.qualityLevel, performance.now());
    canvas.dataset.quality = this.qualityLevel;
    try {
      this.renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: false, powerPreference: 'high-performance' });
      this.renderer.setPixelRatio(cappedPixelRatio(window.devicePixelRatio, this.qualityLevel, this.isMobileViewport()));
      this.renderer.outputColorSpace = THREE.SRGBColorSpace;
      this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
      this.renderer.toneMappingExposure = 1.12;
      this.renderer.shadowMap.enabled = true;
      this.renderer.shadowMap.type = THREE.PCFShadowMap;
    } catch (error) { onError?.(error); throw error; }
    this.scene.add(new THREE.HemisphereLight(0xe5f9ff, 0xab825c, 1.1));
    const sunlight = new THREE.DirectionalLight(0xffedce, 3.1);
    sunlight.position.set(-12, 27, 11); sunlight.castShadow = true;
    sunlight.shadow.mapSize.set(this.qualityProfile.shadowSize, this.qualityProfile.shadowSize);
    sunlight.shadow.camera.left = -45; sunlight.shadow.camera.right = 45;
    sunlight.shadow.camera.top = 28; sunlight.shadow.camera.bottom = -28;
    sunlight.shadow.normalBias = 0.03; sunlight.shadow.bias = -0.0004;
    sunlight.shadow.radius = 3;
    this.sun = sunlight; this.scene.add(sunlight, sunlight.target);
    this.world = new THREE.Group(); this.scene.add(this.world);
    this.ocean = new CoastalOcean(this); this.oceanTime = 0; this.createCar(); this.createBirds();
    this.exhaust.movingInterval = this.qualityProfile.exhaustInterval;
    this.raycaster = new THREE.Raycaster(); this.pointer = new THREE.Vector2();
    this.pointerDown = e => { this.pointerStart = !this.moving && !this.paused && e.button === 0 && e.isPrimary !== false ? { x: e.clientX, y: e.clientY } : null; };
    this.pointerUp = e => {
      const start = this.pointerStart; this.pointerStart = null;
      if (this.moving || this.paused || !start || Math.hypot(e.clientX - start.x, e.clientY - start.y) > 10) return;
      if (this.pickCar(e.clientX, e.clientY)) { this.canvas.style.cursor = 'default'; this.onCar?.(); return; }
      const stop = this.pickStop(e.clientX, e.clientY);
      if (stop !== null) { this.canvas.style.cursor = 'default'; this.onStop?.(stop); }
    };
    this.pointerMove = e => {
      if (e.pointerType === 'touch') return;
      this.canvas.style.cursor = !this.moving && !this.paused && (this.pickCar(e.clientX, e.clientY) || this.pickStop(e.clientX, e.clientY, false) !== null) ? 'pointer' : 'default';
    };
    this.pointerCancel = () => { this.pointerStart = null; this.canvas.style.cursor = 'default'; };
    canvas.addEventListener('pointerdown', this.pointerDown); canvas.addEventListener('pointerup', this.pointerUp);
    canvas.addEventListener('pointermove', this.pointerMove); canvas.addEventListener('pointercancel', this.pointerCancel); canvas.addEventListener('pointerleave', this.pointerCancel);
    this.resize = this.resize.bind(this); window.addEventListener('resize', this.resize); this.resize(); this.visualZoom = this.baseHalfHeight;
    this.performanceProbe = createPerformanceProbe(this.renderer, canvas);
    this.lastTime = performance.now(); this.animate = this.animate.bind(this); this.renderer.setAnimationLoop(this.animate);
    requestAnimationFrame(() => requestAnimationFrame(() => onReady?.()));
  }

  isMobileViewport() {
    return (matchMedia('(pointer: coarse)').matches || navigator.maxTouchPoints > 0) && Math.min(innerWidth, innerHeight) <= 1024
      || innerHeight <= 550 && innerWidth > innerHeight;
  }
  setQuality(level) {
    if (this.qualityLevel === level) return;
    this.qualityLevel = level; this.qualityProfile = QUALITY_PROFILES[level];
    this.canvas.dataset.quality = level;
    this.renderer.setPixelRatio(cappedPixelRatio(devicePixelRatio, level, this.isMobileViewport()));
    this.sun.shadow.map?.dispose(); this.sun.shadow.map = null;
    this.sun.shadow.mapSize.set(this.qualityProfile.shadowSize, this.qualityProfile.shadowSize);
    this.ocean.setQuality(this.qualityProfile);
    this.exhaust.movingInterval = this.qualityProfile.exhaustInterval;
  }

  setPickRay(clientX, clientY) {
    const bounds = this.canvas.getBoundingClientRect();
    if (!bounds.width || !bounds.height || clientX < bounds.left || clientX > bounds.right || clientY < bounds.top || clientY > bounds.bottom) return false;
    this.pointer.set((clientX - bounds.left) / bounds.width * 2 - 1, -((clientY - bounds.top) / bounds.height) * 2 + 1);
    this.camera.updateMatrixWorld();
    this.raycaster.setFromCamera(this.pointer, this.camera);
    return true;
  }
  pickCar(clientX, clientY) {
    if (!this.car || !this.setPickRay(clientX, clientY)) return false;
    this.car.updateWorldMatrix(true, true);
    return this.raycaster.intersectObject(this.car, true).length > 0;
  }
  pickStop(clientX, clientY, includeLandmarks = true) {
    if (!this.setPickRay(clientX, clientY)) return null;
    const stations = this.stations || [];
    const bays = stations.flatMap(station => [station.pad, station.parkingSurface]);
    // Test the actual white bay and its border first, then preserve landmark selection.
    const hit = this.raycaster.intersectObjects(bays, false)[0]
      || (includeLandmarks ? this.raycaster.intersectObjects(stations.map(station => station.group), true)[0] : null);
    if (!hit) return null;
    let object = hit.object;
    while (object && object.userData.stop === undefined) object = object.parent;
    return object?.userData.stop ?? null;
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
  text(parent, content, position, width = 4, height = 0.68, { background = '#28454b', color = '#fff9e8', fontSize = 42, alwaysOnTop = false } = {}) {
    const c = document.createElement('canvas'); c.width = 640; c.height = Math.round(640 * height / width);
    const ctx = c.getContext('2d'); ctx.fillStyle = background; ctx.beginPath(); ctx.roundRect(0, 0, c.width, c.height, 12); ctx.fill();
    ctx.fillStyle = color; ctx.font = `600 ${fontSize}px system-ui, sans-serif`; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    ctx.fillText(content, c.width / 2, c.height / 2 + 1, c.width - 35);
    const tex = new THREE.CanvasTexture(c); tex.colorSpace = THREE.SRGBColorSpace; tex.anisotropy = 4;
    const material = new THREE.MeshBasicMaterial({ map: tex, transparent: true, side: THREE.DoubleSide });
    const plane = new THREE.Mesh(new THREE.PlaneGeometry(width, height), material);
    if (alwaysOnTop) { material.depthTest = false; material.depthWrite = false; plane.renderOrder = 30; }
    plane.position.set(...position); plane.rotation.x = -0.38; parent.add(plane); this.routeTextures?.push(tex); return plane;
  }
  stopLabel(parent, name, index, subtitle, position, width = 5, palette = {}) {
    const boardColor = palette.board ?? 0x194b55, badgeColor = palette.badge ?? 0xffbe4b;
    const label = new THREE.Group(); label.name = `Stop label: ${name}`;
    label.position.set(...position); label.rotation.x = -0.38; parent.add(label);
    const scale = width / 5 * 1.25;
    const plaque = this.box(label, [5, 0.85, 0.16], [0, 0, 0], boardColor, 0.075);
    plaque.material = this.material(boardColor, { depthTest: false, depthWrite: false }); plaque.renderOrder = 28;
    const badge = this.box(label, [0.78, 0.74, 0.045], [-2.04, 0, 0.105], badgeColor, 0.06);
    badge.material = this.material(badgeColor, { depthTest: false, depthWrite: false }); badge.renderOrder = 29;
    const canvas = document.createElement('canvas'); canvas.width = 1280; canvas.height = 218;
    const ctx = canvas.getContext('2d'); ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    ctx.fillStyle = palette.number ?? '#214d55'; ctx.font = '700 114px system-ui, sans-serif';
    ctx.fillText(String(index + 1).padStart(2, '0'), 118, 109, 168);
    ctx.fillStyle = palette.text ?? '#fff4d9';
    ctx.font = `700 ${width < 4 ? 175 : 118}px system-ui, sans-serif`; ctx.fillText(name.toUpperCase(), 748, 109, 930);
    const texture = new THREE.CanvasTexture(canvas); texture.colorSpace = THREE.SRGBColorSpace; texture.anisotropy = 4;
    const face = new THREE.Mesh(new THREE.PlaneGeometry(5, 0.85), new THREE.MeshBasicMaterial({ map: texture, transparent: true, side: THREE.DoubleSide, depthTest: false, depthWrite: false, toneMapped: false }));
    face.position.z = 0.14; face.renderOrder = 30; label.add(face); this.routeTextures?.push(texture);
    label.scale.setScalar(scale);
    label.userData.baseScale = scale;
    return label;
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
    const canopyClear = (px, pz) => this.route !== 'career' || this.positions.every(sx => {
      const dx = Math.max(0, Math.abs(px + (flip ? -.75 : .75) * scale - sx) - 2.25);
      const dz = Math.max(0, Math.abs(pz - (pathZ(sx) - 3.6)) - 1.85);
      return Math.hypot(dx, dz) > 3.05 * scale + .12;
    });
    const clear = (px, pz) => canopyClear(px, pz) && this.rockFootprints.every(r => Math.hypot(px - r.x, pz - r.z) > r.radius + 2.7 * scale) && this.palmFootprints.every(p => Math.hypot(px - p.x, pz - p.z) > 3.6) && this.positions.every(sx => Math.abs(px - sx) > 2.7 || Math.abs(pz - (pathZ(sx) - 3.6)) > 2.1);
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
      (this.palmLeaves ??= []).push({ leaf, phase: x * .37 + i * .8 });
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
  prepareRoute(route) { return this.routeAssets.prepare(route); }
  hasRouteAssets(route) { return this.routeAssets.has(route); }
  makeIcon(type, parent, variant = 0) {
    const g = new THREE.Group(); parent.add(g);
    if (type === 'hello') {
      g.add(createIntroAvatar(this));
    } else if (type === 'case') {
      g.position.y = 0.24;
      g.add(createDeveloperDesk(this));
    } else if (type === 'game') {
      g.position.y = 0.27;
      g.add(createArcade(this));
    } else if (type === 'blocks') {
      g.add(createSkillsGears(this));
    } else if (type === 'mail') {
      g.add(createContactMailbox(this));
    } else {
      g.add(this.routeAssets.create(this.route, this, type, variant));
    }
    return g;
  }
  station(x, index, item) {
    const group = new THREE.Group(); group.userData.stop = index; group.position.set(x, 0.5, 0); this.world.add(group);
    const z = pathZ(x);
    const heading = -Math.atan(pathSlope(x));
    const bay = new THREE.Group(); bay.name = 'Stone inset parking bay';
    bay.position.z = z; bay.rotation.y = heading; bay.userData.stop = index; group.add(bay);
    this.box(bay, [4.25, .12, 2.55], [0, .14, 0], 0xb8a482, .07);
    const pad = this.box(bay, [4.02, .04, 2.32], [0, .22, 0], 0xffc15b, .05);
    const parkingSurface = this.box(bay, [3.8, .025, 2.1], [0, .255, 0], 0x657375, .03);
    for (const x of [-1.6, 1.6]) this.box(bay, [.08, .02, 1.7], [x, .28, 0], 0xa7b6b0);
    pad.userData.stop = parkingSurface.userData.stop = index;
    const platformZ = z - 3.6;
    this.contactShadow(group, [0, -0.02, platformZ], 5.8, 4.3, 0.36);
    this.box(group, [3.9, 0.74, 2.9], [0, 0.37, platformZ], 0x9f9180, 0.12);
    this.box(group, [4.04, 0.17, 3.02], [0, 0.79, platformZ], 0xc6b398, 0.075);
    const light = this.glow(group, [2.45, 0.13, 0.065], [0, 0.46, platformZ + 1.47], 0xffc05c);
    light.material = this.material(C.orange, { emissive: C.orange, emissiveIntensity: 0.3 });
    const iconRoot = new THREE.Group(); iconRoot.position.set(0, 1.33, platformZ); group.add(iconRoot);
    iconRoot.userData.baseY = iconRoot.position.y;
    this.makeIcon(item.icon || item.visual || 'building', iconRoot, index);
    if (this.route !== 'career') this.stopLabel(group, item.name, index, this.route === 'hub' ? 'MAIN ISLAND' : `PROJECT / ${item.category || 'UNITY'}`, [0, 0.85, z + 2.65], this.route === 'hub' ? 3.85 : 5);
    const marker = this.mesh(new THREE.ConeGeometry(0.25, 0.42, 3), C.aqua, group, { emissive: C.aqua, emissiveIntensity: 0.6 });
    marker.rotation.z = Math.PI; marker.position.set(0, 4.65, platformZ); marker.visible = index === this.index;
    const iconHeight = new THREE.Box3().setFromObject(iconRoot).getSize(new THREE.Vector3()).y;
    marker.userData.baseY = iconRoot.position.y + iconHeight * 1.24 + 0.7;
    this.stations.push({ group, iconRoot, iconHeight, iconScale: 1, scaleVelocity: 0, marker, pad, parkingSurface, light, anchor: new THREE.Vector3(x, 0.5 + iconRoot.position.y + iconHeight, platformZ) });
  }
  createCareerTimeline(items) {
    const start = this.positions[0] - 2.8, end = this.positions.at(-1) + 2.8, segments = 120;
    const cursor = new THREE.Group(); this.world.add(cursor);
    const rails = [], milestones = [];
    for (const [offset, color] of [[2.35, 0xe9a0ff], [3.65, 0xf7e5be]]) {
      const points = Array.from({ length: segments + 1 }, (_, i) => {
        const x = lerp(start, end, i / segments); return new THREE.Vector3(x, 0.64, pathZ(x) + offset);
      });
      const curve = new THREE.CatmullRomCurve3(points);
      const base = this.mesh(new THREE.TubeGeometry(curve, segments, 0.16, 4, false), 0x665f65); base.castShadow = false;
      const line = this.mesh(new THREE.TubeGeometry(curve, segments, 0.045, 4, false), color); line.material = this.glowMaterial(color); line.castShadow = false;
      const progress = this.mesh(new THREE.TubeGeometry(curve, segments, 0.059, 4, false), 0xffc15d); progress.material = this.glowMaterial(0xffc15d); progress.castShadow = false;
      rails.push(progress);
    }
    items.forEach((company, i) => {
      const x = this.positions[i], z = pathZ(x), group = new THREE.Group(); group.userData.stop = i; this.world.add(group);
      this.beam(group, [x + 1.75, 0.5, z + 2.35], [x + 1.75, 1.8, z + 2.35], 0.065, 0x65565d);
      const label = this.stopLabel(group, company.name, i, company.role, [x, 1.95, z + 2.35], 4.5);
      milestones.push({ label });
    });
    // A single year readout follows the car, rather than per-stop placeholder plates.
    const yearBoard = new THREE.Group(); yearBoard.name = 'Raised 3D career year sign';
    yearBoard.position.set(0, 1.35, 3.85); yearBoard.rotation.x = -.38; cursor.add(yearBoard);
    const frame = this.box(yearBoard, [3.7, 1.35, .24], [0, 0, 0], 0x194b55, .075);
    frame.material = this.material(0x194b55, { depthTest: false, depthWrite: false }); frame.renderOrder = 28;
    for (const x of [-1.3, 1.3]) this.beam(cursor, [x, .52, 3.85], [x, 1.34, 3.85], .065, 0x65565d);
    const yearFace = this.text(yearBoard, '', [0, 0, .15], 3.45, 1.15, { fontSize: 100, alwaysOnTop: true });
    yearFace.rotation.x = 0;
    const years = items.map((company, i) => Number.isFinite(company.timelineYear) ? company.timelineYear : Math.round(2017 + i * (new Date().getFullYear() - 2017) / Math.max(1, items.length - 1)));
    this.timeline = { start, end, segments, rails, milestones, cursor, yearFace, years, lastYear: null };
    this.updateCareerTimeline();
  }
  updateCareerTimeline() {
    if (!this.timeline) return;
    const { start, end, segments, rails, milestones, cursor } = this.timeline;
    const fraction = clamp((this.carX - start) / (end - start), 0, 1);
    rails.forEach(rail => rail.geometry.setDrawRange(0, Math.round(fraction * segments) * 4 * 6));
    cursor.position.set(this.carX, 0, pathZ(this.carX));
    const timeline = this.timeline;
    const stopProgress = clamp((this.carX - this.positions[0]) / this.spacing, 0, this.positions.length - 1);
    const from = Math.floor(stopProgress), to = Math.min(from + 1, timeline.years.length - 1);
    const yearValue = lerp(timeline.years[from], timeline.years[to], stopProgress - from);
    if (timeline.lastYear === null || Math.abs(yearValue - timeline.lastYear) > .002) {
      const tex = timeline.yearFace.material.map, canvas = tex.image, ctx = canvas.getContext('2d');
      const w = canvas.width, h = canvas.height, integer = Math.floor(yearValue + .00001), fraction = yearValue - integer;
      ctx.fillStyle = '#284147'; ctx.fillRect(0, 0, w, h);
      ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillStyle = '#ffcf70';
      ctx.font = '600 23px system-ui'; ctx.fillText('CAREER / SAMPLE YEARS', w / 2, 27);
      ctx.save(); ctx.beginPath(); ctx.rect(0, 53, w, h - 62); ctx.clip();
      ctx.fillStyle = '#fff4d9'; ctx.font = '600 115px monospace';
      const line = h - 50, center = (h + 53) / 2;
      ctx.fillText(String(integer), w / 2, center - fraction * line);
      if (fraction > 0) ctx.fillText(String(integer + 1), w / 2, center + (1 - fraction) * line);
      ctx.restore(); tex.needsUpdate = true; timeline.lastYear = yearValue;
    }
    milestones.forEach((milestone, i) => {
      milestone.label.scale.setScalar(milestone.label.userData.baseScale * (i === this.index ? 1.08 : 1));
    });
  }
  clearWorld() {
    this.world.traverse(obj => { if (obj.geometry) obj.geometry.dispose(); if (obj.material?.map && !obj.material.userData.shared) { obj.material.map.dispose(); obj.material.dispose(); } });
    this.world.clear(); this.routeTextures = []; this.palmLeaves = [];
  }
  setRoute(route, items, selected = 0, immediate = false) {
    if (this.route === route && this.routeItems === items && this.stations?.length) { this.go(selected, immediate); return; }
    this.exhaust?.reset(); this.clearWorld(); this.rockFootprints = []; this.palmFootprints = []; this.route = route; this.routeItems = items; this.index = selected; this.stations = []; this.timeline = null;
    this.spacing = route === 'hub' ? 8 : 9.5;
    this.positions = items.map((_, i) => (i - (items.length - 1) / 2) * this.spacing);
    const length = Math.max(45, (items.length - 1) * this.spacing + 13);
    this.islandLength = length;
    this.createIsland(length + 3); this.road(-length / 2 + 1, length / 2 - 1);
    this.coastalTunnel(-length / 2 + 2.4, -1);
    this.coastalTunnel(length / 2 - 2.4, 1);
    items.forEach((item, i) => this.station(this.positions[i], i, item));
    if (route === 'career') this.createCareerTimeline(items);
    // Place rock clusters before foliage so trees can find a clear footprint.
    this.positions.forEach((x, i) => {
      if (i % 3 === 0) {
        const behindHello = (route === 'hub' && i === 0) || route === 'career';
        const rockZ = behindHello ? pathZ(x) - 7.7 : -6.2;
        this.rock(x - (behindHello ? 2.3 : 1.5), rockZ, 3.2 + seeded(i + 2) * 0.6, i);
        this.rock(x + 0.8, behindHello ? rockZ - 0.1 : -5.9, 2.2, i + 37);
        // Keep the entrance's foliage buffer so a new palm does not hide the desk.
        if (behindHello) this.rockFootprints.push({ x: x + 0.8, z: -5.9, radius: 2.2 * 0.85 });
      }
    });
    this.rock(-length / 2 + (route !== 'projects' ? 2.2 : 4.4), route !== 'projects' ? -7.8 : -4.8, 2.6, 55);
    for (let i = 0; i < Math.ceil(length / 5); i++) {
      const x = -length / 2 + 2 + i * 5;
      this.fence(x, route === 'career' ? 6.1 : 4.4, 4.5);
      if (i % 3 === 0) this.lamp(x + 1.8, 4.35);
      this.grass(x + seeded(i + 100), -5.8, i + 3);
      if (i % 3 === 1) this.palm(x, -5.9, route === 'career' ? .65 : 0.95 + seeded(i) * 0.18, i % 2 === 0);
      if (i % 3 === 0) this.rock(x, 6.1, 0.55, i + 20);
      if (route !== 'career') this.grass(x + 1, 3.5, i + 23);
      if (i % 2 === 1) { this.rock(x + 1.7, 5.6, 0.55, i + 211); this.starFish(x - 0.8, 5.4); }
    }
    this.palm(-length / 2 + 2, -3.5, route === 'career' ? .65 : 1.1);
    // Leave room for the cabin boat beside the dock at the default island zoom.
    this.createPier(length / 2 - 7.5);
    this.carX = this.positions[selected]; this.destinationX = this.carX; this.carSpeed = 0; this.moving = false;
    this.go(selected, true);
    const excluded = new Set([
      ...this.stations.map(station => station.group), ...this.palmLeaves.map(({ leaf }) => leaf),
      ...(this.timeline ? [this.timeline.cursor, ...this.timeline.rails, ...this.timeline.milestones.map(milestone => milestone.label)] : []),
    ]);
    this.batching = batchStaticMeshes(this.world, { exclude: excluded });
    for (const station of this.stations) {
      const result = batchStaticMeshes(station.iconRoot, { cellSize: Infinity });
      this.batching.savedDraws += result.savedDraws;
      const base = batchStaticMeshes(station.group, { cellSize: Infinity, exclude: new Set([station.iconRoot, station.marker, station.pad, station.parkingSurface, station.light]) });
      this.batching.savedDraws += base.savedDraws;
    }
    this.world.updateMatrixWorld(true);
    this.overviewBounds = new THREE.Box3().setFromObject(this.world).expandByScalar(0.65);
    this.ocean.createRoute(length); this.ocean.update(this.oceanTime);
    this.resize();
    this.focusX = this.cameraFocusX();
    this.visualZoom = this.viewHalfHeight();
    this.qualityController.reset(performance.now());
  }
  createPier(x) {
    // Find the actual front shoreline, including its irregular faceted edge.
    const outline = this.islandShape(this.islandLength + 3, 13.8, 4).getPoints(), crossings = [];
    for (let i = 0; i < outline.length - 1; i++) {
      const a = outline[i], b = outline[i + 1];
      if ((a.x <= x && b.x > x) || (b.x <= x && a.x > x)) crossings.push(-(a.y + (b.y - a.y) * (x - a.x) / (b.x - a.x)));
    }
    const shoreZ = Math.max(...crossings), startZ = shoreZ - 0.4;
    const g = new THREE.Group(); g.name = 'Fishing pier over open water'; g.position.set(x, 0.48, startZ); this.world.add(g);
    // A narrow gangway joins the beach to a wider fishing deck offshore.
    for (let i = 0; i < 8; i++) this.box(g, [1.25, 0.14, 0.34], [0, 0, i * 0.38], 0xc28e4f);
    for (let i = 0; i < 9; i++) this.box(g, [2.6, 0.14, 0.34], [0, 0, 3.04 + i * 0.38], i % 2 ? 0xd6a35d : 0xc28e4f);
    for (const z of [3.04, 6.08]) for (const side of [-1, 1]) this.cylinder(g, 0.13, 0.16, 2.5, [side * 1.4, -0.32, z], 0xa4713a);
    for (const side of [-1, 1]) this.box(g, [0.12, 0.22, 3.4], [side * 1.16, -0.15, 4.56], 0x956633);
    this.pier = { x, shoreZ, startZ, deckZ: startZ + 4.56, endZ: startZ + 6.25, boatX: x + 3, boatZ: startZ + 4.56 };
  }
  createCar() {
    this.car = createJeep(this, 'open'); this.scene.add(this.car);
    this.exhaust = new JeepExhaust(this.scene);
    this.car.scale.setScalar(0.92 * 0.85);
    this.wheels = this.car.userData.wheels;
    this.carBatchSaved = batchStaticMeshes(this.car.userData.body, { cellSize: Infinity }).savedDraws;
    for (const wheel of this.wheels) this.carBatchSaved += batchStaticMeshes(wheel, { cellSize: Infinity }).savedDraws;
    this.wheelRadius = 0.56 * 0.92 * 0.85;
    this.carShadow = this.contactShadow(this.scene, [this.carX, 0.608, pathZ(this.carX)], 4.8, 2.8, 0.3);
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
      this.carX = this.destinationX; this.carSpeed = 0; this.drive = null; this.moving = false; this.onMove?.(false);
    } else {
      const distance = Math.abs(this.destinationX - this.carX);
      this.drive = distance < 0.01 ? null : { to: this.destinationX, approached: false };
      if (!this.drive) this.carSpeed = 0;
      this.moving = Boolean(this.drive); this.onMove?.(this.moving);
    }
    this.stations?.forEach((s, i) => {
      s.marker.visible = i === index;
      s.light.material = this.glowMaterial(i === index ? 0x3dfff1 : 0xffbd51);
      s.pad.material = this.material(i === index ? 0xffd77b : 0xffc15b);
    });
  }
  resize() {
    const w = window.innerWidth, h = window.innerHeight; this.mobile = w <= 700; this.aspect = w / h;
    this.renderer.setSize(w, h); this.baseHalfHeight = this.mobile ? 13.2 : clamp(24 / this.aspect, 10.5, 19);
    this.renderer.setPixelRatio(cappedPixelRatio(devicePixelRatio, this.qualityLevel, this.isMobileViewport()));
    this.qualityController.reset(performance.now());
    this.fitOverview(true);
    this.visualZoom = this.viewHalfHeight();
    this.focusX = this.cameraFocusX();
    this.camera.updateProjectionMatrix();
  }
  fitOverview(reuseHomeBounds = false) {
    if (!this.overviewBounds) return;
    // Project the complete island into camera space, then fit it between the UI.
    const direction = new THREE.Vector3(-4.5, 24, 35).normalize();
    const right = new THREE.Vector3().crossVectors(new THREE.Vector3(0, 1, 0), direction).normalize();
    const up = new THREE.Vector3().crossVectors(direction, right).normalize();
    if (this.route === 'hub' && !reuseHomeBounds || !this.homeViewBounds) {
      let left = Infinity, rightEdge = -Infinity, bottom = Infinity, top = -Infinity;
      this.world.updateMatrixWorld(true);
      this.world.traverse(object => {
        if (!object.geometry) return;
        object.geometry.computeBoundingBox();
        const bounds = object.geometry.boundingBox;
        if (!bounds) return;
        for (const x of [bounds.min.x, bounds.max.x]) for (const y of [bounds.min.y, bounds.max.y]) for (const z of [bounds.min.z, bounds.max.z]) {
          const point = new THREE.Vector3(x, y, z).applyMatrix4(object.matrixWorld);
          const px = point.dot(right), py = point.dot(up);
          left = Math.min(left, px); rightEdge = Math.max(rightEdge, px); bottom = Math.min(bottom, py); top = Math.max(top, py);
        }
      });
      this.homeViewBounds = { left: left - 0.8, rightEdge: rightEdge + 0.8, bottom: bottom - 0.8, top: top + 0.8 };
      this.homeIslandLength = this.islandLength;
    }
    // Every section uses the Home frame, keeping cars and landmarks the same size.
    const { left, rightEdge, bottom, top } = this.homeViewBounds;
    const h = innerHeight, w = innerWidth;
    const padding = Math.max(24, Math.min(70, w * 0.045));
    const safeLeft = padding, safeRight = w - padding;
    const layout = getComputedStyle(document.documentElement);
    const safeTop = parseFloat(layout.getPropertyValue('--world-top')) || 185;
    const dockHeight = parseFloat(layout.getPropertyValue('--dock-height')) || 218;
    const dockBottom = parseFloat(layout.getPropertyValue('--dock-bottom')) || 24;
    const worldGap = parseFloat(layout.getPropertyValue('--world-gap')) || 16;
    const safeBottom = h - dockHeight - dockBottom - worldGap;
    this.overviewHalfHeight = referenceHalfHeight(this.homeViewBounds);
    this.defaultZoom = fittedZoom(this.homeViewBounds, { width: w, height: h, top: safeTop, bottom: h - dockBottom, padding });
    const halfHeight = this.viewHalfHeight();
    const centerY = 1 - (safeTop + safeBottom) / h;
    const centerX = (safeLeft + safeRight) / w - 1;
    const compactOffset = h <= 550 && w > h ? 0.6 : 0;
    this.overviewLook = up.multiplyScalar((top + bottom) / 2 + compactOffset - centerY * halfHeight)
      .add(right.multiplyScalar((left + rightEdge) / 2 - centerX * halfHeight * this.aspect));
  }
  viewHalfHeight() {
    return viewportHalfHeight(innerHeight, this.overviewHalfHeight || this.baseHalfHeight, this.getZoom());
  }
  getZoom() { return this.zoomLevels?.[this.route] ?? this.defaultZoom ?? 100; }
  setZoom(value) {
    if (value !== null && !Number.isFinite(value)) return;
    this.zoomLevels[this.route] = value === null ? null : clamp(Math.round(value), 10, 600);
    this.fitOverview(true);
    this.visualZoom = this.viewHalfHeight();
  }
  cameraFocusX() {
    if (!this.homeViewBounds) return 0;
    // Extra records extend the island rather than shrinking its buildings. At
    // either endpoint, keep the same projected edge padding as Home.
    const rightX = 35 / Math.hypot(35, 4.5);
    const homeWidth = this.homeViewBounds.rightEdge - this.homeViewBounds.left;
    const visibleWidth = 2 * this.viewHalfHeight() * this.aspect;
    const padding = Math.max(24, Math.min(70, innerWidth * .045));
    const usableWidth = visibleWidth * (1 - 2 * padding / innerWidth);
    const extraLength = ((this.islandLength || 0) - (this.homeIslandLength || 45)) / 2;
    const limit = Math.max(0, extraLength + (homeWidth - usableWidth) / (2 * rightX));
    return clamp(this.carX, -limit, limit);
  }
  setPaused(paused) {
    if (Boolean(this.paused) === paused) return;
    if (paused) this.pauseStarted = performance.now();
    this.paused = paused;
    this.qualityController.reset(performance.now());
  }
  getAnchor() {
    const a = this.stations?.[this.index]?.anchor; if (!a) return { x: innerWidth / 2, y: innerHeight / 2 };
    const p = a.clone().project(this.camera); return { x: (p.x + 1) * innerWidth / 2, y: (-p.y + 1) * innerHeight / 2 };
  }
  fishSplash(x, y, z) {
    const point = new THREE.Vector3(x, y, z).project(this.camera);
    if (Math.abs(point.x) <= 1 && Math.abs(point.y) <= 1 && Math.abs(point.z) <= 1) this.onSplash?.({ pan: point.x * .65 });
  }
  animate(now) {
    if (this.disposed) return;
    // A queued first frame can predate scene setup; never run springs backwards.
    const frameMs = now - this.lastTime;
    const dt = clamp(frameMs / 1000, 0, 0.05); this.lastTime = now; const t = now / 1000;
    if (this.paused) return;
    if (!this.reducedMotion) this.oceanTime += dt;
    this.ocean.update(this.oceanTime);
    const previousX = this.carX;
    if (this.drive) {
      const step = advanceDriving(this.carX, this.carSpeed, this.destinationX, dt);
      this.carX = step.position; this.carSpeed = step.speed;
      this.positions.forEach((x, i) => { if (i !== this.index && (previousX < x && this.carX >= x || previousX > x && this.carX <= x)) this.onWaypoint?.(i); });
      const remaining = Math.abs(this.destinationX - this.carX);
      const arrivalTime = 2 * remaining / Math.max(Math.abs(this.carSpeed), 0.1);
      if (!this.drive.approached && arrivalTime <= 0.25) { this.drive.approached = true; this.onApproach?.(); }
      if (step.arrived || this.reducedMotion) { this.carX = this.destinationX; this.carSpeed = 0; this.drive = null; }
    }
    const moving = Boolean(this.drive);
    if (moving !== this.moving) { this.moving = moving; this.onMove?.(moving); }
    if (this.carSpeed !== this.lastSoundSpeed) {
      this.lastSoundSpeed = this.carSpeed; this.onSpeed?.(this.carSpeed / MAX_DRIVING_SPEED);
    }
    const delta = this.carX - previousX;
    this.idleStrength = this.reducedMotion ? 0 : THREE.MathUtils.damp(this.idleStrength ?? 1, moving ? 0 : 1, 12, dt);
    const engineTime = this.oceanTime * Math.PI * 2;
    const body = this.car.userData.body;
    body.position.y = (Math.sin(engineTime * 8) * .009 + Math.sin(engineTime * 11.3) * .003) * this.idleStrength;
    body.rotation.x = Math.sin(engineTime * 7.7 + .6) * .0025 * this.idleStrength;
    body.rotation.z = Math.sin(engineTime * 8.3) * .0018 * this.idleStrength;
    const padLift = 0.16 * Math.max(0, 1 - Math.abs(this.destinationX - this.carX) / 1.7);
    this.car.position.set(this.carX, 0.63 + padLift + (moving && !this.reducedMotion ? Math.sin(t * 24) * 0.013 : 0), pathZ(this.carX));
    this.carShadow.position.set(this.carX, 0.608, pathZ(this.carX));
    this.car.rotation.y = -Math.atan(pathSlope(this.carX));
    this.carShadow.rotation.z = this.car.rotation.y;
    this.exhaust.update(dt, this.car, moving, this.reducedMotion);
    this.wheels.forEach(w => { w.rotation.z -= delta / this.wheelRadius; });
    this.updateCareerTimeline();
    const focus = this.cameraFocusX();
    this.focusX = lerp(this.focusX, focus, 1 - Math.exp(-dt * 3));
    const halfH = this.viewHalfHeight();
    this.visualZoom = lerp(this.visualZoom, halfH, 1 - Math.exp(-dt * 3));
    this.camera.left = -this.visualZoom * this.aspect; this.camera.right = this.visualZoom * this.aspect;
    this.camera.top = this.visualZoom; this.camera.bottom = -this.visualZoom; this.camera.updateProjectionMatrix();
    // Fit the scene between the top controls and bottom details dock. Long routes follow the car.
    const look = this.overviewLook ? this.overviewLook.clone().add(new THREE.Vector3(this.focusX, 0, 0)) : new THREE.Vector3(this.focusX, 0, 0);
    this.camera.position.copy(look).add(new THREE.Vector3(-18, 96, 140)); this.camera.lookAt(look);
    this.sun.position.set(this.focusX - 12, 27, 11); this.sun.target.position.set(this.focusX, 0, 0); this.sun.target.updateMatrixWorld();
    this.stations?.forEach((s, i) => {
      const bob = this.reducedMotion ? 0 : Math.sin(this.oceanTime * 1.2 + i * .8) * .12;
      s.iconRoot.position.y = s.iconRoot.userData.baseY + bob;
      if (s.marker.visible) s.marker.position.y = s.marker.userData.baseY + bob + (this.reducedMotion ? 0 : Math.sin(this.oceanTime * 2.5) * 0.08);
      const targetScale = i === this.index && !moving ? 1.24 : 1;
      if (this.reducedMotion) { s.iconScale = targetScale; s.scaleVelocity = 0; }
      else { s.scaleVelocity += (targetScale - s.iconScale) * 105 * dt; s.scaleVelocity *= Math.exp(-12 * dt); s.iconScale += s.scaleVelocity * dt; }
      s.iconRoot.scale.setScalar(s.iconScale);
      s.anchor.y = 0.5 + s.iconRoot.position.y + s.iconHeight * s.iconScale;
    });
    this.palmLeaves?.forEach(({ leaf, phase }) => {
      leaf.rotation.z = this.reducedMotion ? 0 : Math.sin(this.oceanTime * .85 + phase) * .025;
      leaf.rotation.x = this.reducedMotion ? 0 : Math.sin(this.oceanTime * 1.1 + phase * 1.3) * .014;
    });
    if (!this.reducedMotion) {
      this.birds.children.forEach((b, i) => { const a = t * 0.08 + b.userData.phase; b.position.set(this.focusX + Math.sin(a) * 17, 8 + i * 0.65, -13 + Math.cos(a) * 7); b.rotation.y = -a; b.rotation.z = Math.sin(t * 1.7 + i) * 0.07; });
    }
    const renderStarted = this.performanceProbe ? performance.now() : 0;
    this.renderer.render(this.scene, this.camera);
    this.performanceProbe?.frame(now, performance.now() - renderStarted, { route: this.route, quality: this.qualityLevel, shadowSize: this.qualityProfile.shadowSize, waterTriangles: this.waterTriangles(), batchedDrawsSaved: (this.batching?.savedDraws || 0) + this.carBatchSaved });
    if (!this.fixedQuality) {
      const level = this.qualityController.sample(frameMs, now, !document.hidden);
      if (level) this.setQuality(level);
    }
  }
  waterTriangles() { return this.ocean.water.geometry.index.count / 3; }
  dispose() {
    this.disposed = true; this.renderer.setAnimationLoop(null); window.removeEventListener('resize', this.resize);
    this.canvas.removeEventListener('pointerdown', this.pointerDown); this.canvas.removeEventListener('pointerup', this.pointerUp);
    this.canvas.removeEventListener('pointermove', this.pointerMove); this.canvas.removeEventListener('pointercancel', this.pointerCancel); this.canvas.removeEventListener('pointerleave', this.pointerCancel);
    this.exhaust.dispose(); this.ocean.dispose(); this.clearWorld(); this.scene.traverse(o => { o.geometry?.dispose(); }); this.materials.forEach(m => { m.map?.dispose(); m.dispose(); }); this.renderer.dispose();
  }
}
