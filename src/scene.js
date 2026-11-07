import * as THREE from 'three';

const C = { sand: 0xf1c57b, shore: 0xffdf9d, rock: 0x9e968a, road: 0x52666b, aqua: 0x49f8ed, orange: 0xfa7406, dark: 0x183b44, green: 0x85ac42, cream: 0xfff4d9 };
const clamp = THREE.MathUtils.clamp;
const lerp = THREE.MathUtils.lerp;
const seeded = n => { const x = Math.sin(n * 127.1 + 311.7) * 43758.5453; return x - Math.floor(x); };
const pathZ = x => Math.sin(x * 0.155) * 0.78;

export class CoastalScene {
  constructor(canvas, { onStop, onMove, onReady, onError, reducedMotion = false } = {}) {
    this.canvas = canvas;
    this.onStop = onStop; this.onMove = onMove; this.reducedMotion = reducedMotion;
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0x138e9a);
    this.scene.fog = new THREE.Fog(0x138e9a, 65, 155);
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
      this.renderer.toneMappingExposure = 0.98;
      this.renderer.shadowMap.enabled = true;
      this.renderer.shadowMap.type = THREE.PCFShadowMap;
    } catch (error) { onError?.(error); throw error; }
    this.scene.add(new THREE.HemisphereLight(0xe9fcff, 0xb69d76, 1.85));
    const sunlight = new THREE.DirectionalLight(0xffedca, 2.7);
    sunlight.position.set(-12, 27, 11); sunlight.castShadow = true;
    sunlight.shadow.mapSize.set(2048, 2048);
    sunlight.shadow.camera.left = -45; sunlight.shadow.camera.right = 45;
    sunlight.shadow.camera.top = 28; sunlight.shadow.camera.bottom = -28;
    sunlight.shadow.normalBias = 0.03; sunlight.shadow.bias = -0.0004;
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
    if (!this.materials.has(key)) this.materials.set(key, new THREE.MeshStandardMaterial({ color, roughness: 0.88, flatShading: true, ...options }));
    return this.materials.get(key);
  }
  mesh(geometry, color, parent = this.world, options = {}) {
    const m = new THREE.Mesh(geometry, this.material(color, options)); m.castShadow = true; m.receiveShadow = true; parent.add(m); return m;
  }
  box(parent, size, position, color, bevel = 0) {
    let geo;
    if (bevel) {
      const [w, h, d] = size; const s = new THREE.Shape(); const r = Math.min(bevel, w / 3, h / 3);
      s.moveTo(-w / 2 + r, -h / 2); s.lineTo(w / 2 - r, -h / 2); s.quadraticCurveTo(w / 2, -h / 2, w / 2, -h / 2 + r);
      s.lineTo(w / 2, h / 2 - r); s.quadraticCurveTo(w / 2, h / 2, w / 2 - r, h / 2); s.lineTo(-w / 2 + r, h / 2);
      s.quadraticCurveTo(-w / 2, h / 2, -w / 2, h / 2 - r); s.lineTo(-w / 2, -h / 2 + r); s.quadraticCurveTo(-w / 2, -h / 2, -w / 2 + r, -h / 2);
      geo = new THREE.ExtrudeGeometry(s, { depth: d, bevelEnabled: false, curveSegments: 2 }); geo.translate(0, 0, -d / 2);
    } else geo = new THREE.BoxGeometry(...size);
    const m = this.mesh(geo, color, parent); m.position.set(...position); return m;
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
      const a = i / 60 * Math.PI * 2, n = 1 + (seeded(i + seed) - 0.5) * 0.055;
      const x = Math.sign(Math.cos(a)) * Math.pow(Math.abs(Math.cos(a)), 0.35) * length / 2 * n;
      const z = Math.sign(Math.sin(a)) * Math.pow(Math.abs(Math.sin(a)), 0.65) * width / 2 * n;
      if (i === 0) s.moveTo(x, z); else s.lineTo(x, z);
    }
    s.closePath(); return s;
  }
  createIsland(length) {
    const shape = this.islandShape(length, 15, 4);
    const bottom = this.mesh(new THREE.ExtrudeGeometry(shape, { depth: 1.05, bevelEnabled: true, bevelThickness: 0.24, bevelSize: 0.2, bevelSegments: 1, steps: 1 }), C.rock);
    bottom.rotation.x = -Math.PI / 2; bottom.position.y = -1.02;
    const rim = this.mesh(new THREE.ExtrudeGeometry(shape, { depth: 0.1, bevelEnabled: false }), C.shore);
    rim.rotation.x = -Math.PI / 2; rim.scale.set(1.015, 1.035, 1); rim.position.y = 0.12;
    const sand = this.mesh(new THREE.ExtrudeGeometry(shape, { depth: 0.15, bevelEnabled: true, bevelSize: 0.12, bevelThickness: 0.08, bevelSegments: 1 }), C.sand);
    sand.rotation.x = -Math.PI / 2; sand.position.y = 0.27;
    // A translucent pale shallow-water shelf, with the same faceted shoreline.
    const shelf = this.mesh(new THREE.ShapeGeometry(shape), 0x69d1c1, this.world, { transparent: true, opacity: 0.28, depthWrite: false });
    shelf.rotation.x = -Math.PI / 2; shelf.scale.set(1.08, 1.16, 1); shelf.position.y = -0.78; shelf.castShadow = false;
  }
  createWater() {
    const geo = new THREE.PlaneGeometry(450, 260, 80, 60); geo.rotateX(-Math.PI / 2);
    const colors = [], positions = geo.getAttribute('position');
    const deep = new THREE.Color(0x159caa), shallow = new THREE.Color(0x36c6c0);
    for (let i = 0; i < positions.count; i++) { const col = deep.clone().lerp(shallow, seeded(i) * 0.36); colors.push(col.r, col.g, col.b); }
    geo.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3));
    this.water = new THREE.Mesh(geo, new THREE.MeshBasicMaterial({ vertexColors: true, toneMapped: false }));
    this.water.position.y = -1.05; this.water.receiveShadow = true; this.scene.add(this.water);
    this.wavelets = new THREE.Group(); this.scene.add(this.wavelets);
    const waveGeo = new THREE.PlaneGeometry(0.65, 0.035); waveGeo.rotateX(-Math.PI / 2);
    const waveMaterial = new THREE.MeshBasicMaterial({ color: 0xd8fff3, transparent: true, opacity: 0.3, depthWrite: false });
    for (let i = 0; i < 125; i++) {
      const wave = new THREE.Mesh(waveGeo, waveMaterial); const x = (seeded(i + 1) - 0.5) * 150, z = (seeded(i + 190) - 0.5) * 85;
      wave.position.set(x, -0.97, z); wave.scale.x = 0.8 + seeded(i + 33) * 3; wave.userData.baseX = x; this.wavelets.add(wave);
    }
  }
  road(start, end) {
    const positions = [], uv = [], indices = [], n = Math.ceil((end - start) * 4);
    for (let i = 0; i <= n; i++) { const x = lerp(start, end, i / n), z = pathZ(x); positions.push(x, 0.56, z - 1.7, x, 0.56, z + 1.7); uv.push(i / n, 0, i / n, 1); if (i < n) { const k = i * 2; indices.push(k, k + 1, k + 2, k + 1, k + 3, k + 2); } }
    const geo = new THREE.BufferGeometry(); geo.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3)); geo.setAttribute('uv', new THREE.Float32BufferAttribute(uv, 2)); geo.setIndex(indices); geo.computeVertexNormals();
    const road = this.mesh(geo, C.road); road.castShadow = false;
    const points = Array.from({ length: 120 }, (_, i) => { const x = lerp(start, end, i / 119); return new THREE.Vector3(x, 0.595, pathZ(x)); });
    const glow = this.mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(points), 140, 0.055, 5, false), C.aqua, this.world, { emissive: C.aqua, emissiveIntensity: 0.7 });
    const lineMaterial = new THREE.MeshBasicMaterial({ color: 0x55fff0, toneMapped: false });
    this.materials.set('cyan-route', lineMaterial); glow.material = lineMaterial; glow.castShadow = false;
  }
  rock(x, z, size = 1.5, seed = 1) {
    const m = this.mesh(new THREE.DodecahedronGeometry(1, 0), [0xaaa496, 0xb7ac9d, 0x9f9e93][Math.floor(seeded(seed) * 3)]);
    m.position.set(x, 0.42 + size * 0.42, z); m.scale.set(size * 0.8, size, size * 0.7); m.rotation.set(seeded(seed + 2), seeded(seed + 4) * 3, 0.2); return m;
  }
  grass(x, z, seed) {
    const g = new THREE.Group(); g.position.set(x, 0.45, z); this.world.add(g);
    for (let i = 0; i < 5; i++) { const a = i * 2.4 + seed; const blade = this.mesh(new THREE.ConeGeometry(0.12, 0.65 + seeded(seed + i) * 0.4, 3), i % 2 ? 0xa9bd48 : 0x86a33e, g); blade.position.set(Math.cos(a) * 0.15, 0.3, Math.sin(a) * 0.15); blade.rotation.z = Math.cos(a) * 0.4; blade.rotation.x = Math.sin(a) * 0.4; }
  }
  palm(x, z, scale = 1, flip = false) {
    const g = new THREE.Group(); g.position.set(x, 0.4, z); g.scale.setScalar(scale); this.world.add(g);
    const lean = flip ? -0.45 : 0.45;
    for (let i = 0; i < 6; i++) this.beam(g, [lean * i / 6, i * 0.55, 0], [lean * (i + 1) / 6, (i + 1) * 0.55, 0], 0.18 - i * 0.012, i % 2 ? 0xb47a42 : 0xcf9151, 6);
    for (let i = 0; i < 7; i++) {
      const a = i / 7 * Math.PI * 2; const points = [[0, 0, 0], [0.8, 0.45, -0.25], [1.9, -0.1, 0], [0.8, 0.45, 0.25], [0.8, 0.58, 0]];
      const p = points.flat(); const geo = new THREE.BufferGeometry(); geo.setAttribute('position', new THREE.Float32BufferAttribute(p, 3)); geo.setIndex([0, 1, 4, 1, 2, 4, 2, 3, 4, 3, 0, 4]); geo.computeVertexNormals();
      const leaf = this.mesh(geo, i % 2 ? 0xa3bd3d : 0x83ad35, g, { side: THREE.DoubleSide }); leaf.position.set(lean, 3.3, 0); leaf.rotation.y = a;
    }
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
    this.box(g, [0.4, 0.4, 0.4], [0, 1.25, 0], 0xffd781);
    this.box(g, [0.48, 0.12, 0.48], [0, 1.5, 0], 0x8f713f);
  }
  makeIcon(type, parent) {
    const g = new THREE.Group(); parent.add(g); g.position.y = 0.45;
    if (type === 'hello') {
      this.box(g, [2.6, 1.15, 0.2], [0, 1.05, 0], 0xc78a4b, 0.08);
      this.text(g, 'HELLO', [0, 1.07, 0.13], 2.4, 0.8, { background: '#c78a4b', color: '#fff3d4', fontSize: 70 });
      for (const x of [-1, 1]) this.box(g, [0.14, 1.4, 0.2], [x, 0.35, 0], 0xa8743f);
      this.mesh(new THREE.IcosahedronGeometry(0.22, 0), 0xf2a2a6, g).position.set(1.5, 0.3, 0.3);
    } else if (type === 'case') {
      this.box(g, [2, 1.3, 0.65], [0, 0.8, 0], 0xbb813f, 0.12);
      this.box(g, [2.04, 0.45, 0.67], [0, 1.1, 0], 0xdca257, 0.04);
      this.box(g, [0.3, 0.35, 0.08], [0, 0.88, 0.38], 0xffd076);
      this.box(g, [0.75, 0.15, 0.18], [0, 1.75, 0], 0x956538);
      for (const x of [-0.3, 0.3]) this.box(g, [0.14, 0.35, 0.18], [x, 1.58, 0], 0x956538);
    } else if (type === 'game') {
      this.box(g, [2.4, 1.05, 0.55], [0, 0.8, 0], 0xfff3d5, 0.3);
      for (const [x, y, col] of [[0.7, 0.92, 0xffb949], [0.95, 0.7, 0xea8b83], [0.45, 0.7, 0x71c8d2]]) this.cylinder(g, 0.14, 0.14, 0.1, [x, y, 0.34], col).rotation.x = Math.PI / 2;
      this.box(g, [0.65, 0.18, 0.1], [-0.6, 0.8, 0.34], 0x415359); this.box(g, [0.18, 0.65, 0.1], [-0.6, 0.8, 0.34], 0x415359);
    } else if (type === 'blocks' || type === 'puzzle') {
      for (const [x, y, col] of [[-0.5, 0.45, 0x44bcd4], [0.5, 0.45, 0xec91aa], [0, 1.4, 0xffcf45]]) { this.box(g, [0.92, 0.92, 0.92], [x, y, 0], col, 0.05); this.box(g, [0.4, 0.4, 0.035], [x, y, 0.48], col === 0xffcf45 ? 0xefb631 : col === 0x44bcd4 ? 0x35a9c2 : 0xd97f9a); }
      if (type === 'puzzle') {
        for (const side of [-1, 1]) this.box(g, [0.35, 1.6, 0.4], [side * 1.3, 1, -0.35], 0xd9c59d);
        const arch = this.mesh(new THREE.TorusGeometry(1.3, 0.22, 4, 8, Math.PI), 0xe1cda4, g); arch.position.set(0, 1.8, -0.35);
      }
    } else if (type === 'mail') {
      this.box(g, [2.15, 1.45, 0.3], [0, 0.9, 0], C.cream, 0.1);
      const geo = new THREE.BufferGeometry(); geo.setAttribute('position', new THREE.Float32BufferAttribute([-1.02, 1.6, 0.17, 1.02, 1.6, 0.17, 0, 0.8, 0.2], 3)); geo.computeVertexNormals(); this.mesh(geo, 0xf6b84b, g, { side: THREE.DoubleSide });
    } else if (type === 'space') {
      this.cylinder(g, 0.42, 0.5, 1.65, [0, 1.2, 0], 0xfff6df, 8);
      this.mesh(new THREE.ConeGeometry(0.43, 0.75, 8), C.orange, g).position.set(0, 2.4, 0);
      const glass = this.cylinder(g, 0.25, 0.25, 0.08, [0, 1.4, 0.5], 0x58cad7, 12); glass.rotation.x = Math.PI / 2;
      for (const x of [-0.6, 0.6]) { const wing = this.box(g, [0.32, 0.85, 0.45], [x, 0.65, 0], C.orange); wing.rotation.z = -Math.sign(x) * 0.25; }
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
      this.box(g, [2.4, 1.6, 1.3], [0, 1, 0], 0xf5e9d0);
      this.box(g, [1.6, 0.8, 1.25], [-0.1, 2.1, 0], 0xfff3dc);
      for (const x of [-0.75, 0, 0.75]) this.box(g, [0.5, 0.46, 0.03], [x, 1.4, 0.67], 0x72b7c7);
      this.box(g, [1.4, 0.15, 0.6], [0, 0.9, 0.9], 0xf1b744);
      this.box(g, [0.65, 0.8, 0.05], [0, 0.45, 0.67], 0x72b7c7);
    }
    return g;
  }
  station(x, index, item) {
    const group = new THREE.Group(); group.userData.stop = index; group.position.set(x, 0.5, 0); this.world.add(group);
    const z = pathZ(x);
    const pad = this.box(group, [2.3, 0.13, 1.75], [0, 0.14, z], 0x75eddf, 0.14);
    this.box(group, [1.98, 0.05, 1.48], [0, 0.23, z], 0xbdf4d9, 0.1);
    const platformZ = z - 3.6;
    this.box(group, [3.5, 0.6, 2.45], [0, 0.3, platformZ], 0xa7a18d, 0.12);
    this.box(group, [3.58, 0.14, 2.5], [0, 0.68, platformZ], 0xc6bd9f, 0.1);
    const light = this.box(group, [2.45, 0.12, 0.06], [0, 0.43, platformZ + 1.25], C.orange);
    light.material = this.material(C.orange, { emissive: C.orange, emissiveIntensity: 0.3 });
    const iconRoot = new THREE.Group(); iconRoot.position.set(0, 0.75, platformZ); group.add(iconRoot);
    this.makeIcon(item.icon || item.visual || 'building', iconRoot);
    this.text(group, `${this.route === 'hub' ? '' : `${String(index + 1).padStart(2, '0')} / `}${item.name}`, [0, 0.46, z + 1.95], this.route === 'hub' ? 3.1 : 4.9, 0.9, { fontSize: this.route === 'hub' ? 100 : 74 });
    const marker = this.mesh(new THREE.ConeGeometry(0.25, 0.42, 3), C.aqua, group, { emissive: C.aqua, emissiveIntensity: 0.6 });
    marker.rotation.z = Math.PI; marker.position.set(0, 4.65, platformZ); marker.visible = index === this.index;
    this.stations.push({ group, marker, pad, light, anchor: new THREE.Vector3(x, 4, platformZ) });
  }
  clearWorld() {
    this.world.traverse(obj => { if (obj.geometry) obj.geometry.dispose(); if (obj.material?.map) { obj.material.map.dispose(); obj.material.dispose(); } });
    this.world.clear(); this.routeTextures = [];
  }
  setRoute(route, items, selected = 0, immediate = false) {
    if (this.route === route && this.routeItems === items && this.stations?.length) { this.go(selected, immediate); return; }
    this.clearWorld(); this.route = route; this.routeItems = items; this.index = selected; this.stations = [];
    this.spacing = route === 'hub' ? 8 : 9.5;
    this.positions = items.map((_, i) => (i - (items.length - 1) / 2) * this.spacing);
    const length = Math.max(45, (items.length - 1) * this.spacing + 13);
    this.createIsland(length); this.road(-length / 2 + 1, length / 2 - 1);
    items.forEach((item, i) => this.station(this.positions[i], i, item));
    for (let i = 0; i < Math.ceil(length / 5); i++) {
      const x = -length / 2 + 2 + i * 5;
      if (i % 2 === 0) this.fence(x, 5.5, 3.3);
      if (i % 3 === 0) this.lamp(x + 1.8, 5.45);
      this.grass(x + seeded(i + 100), -5.8, i + 3);
      if (i % 3 === 1) this.palm(x, -5.85, 0.9 + seeded(i) * 0.25, i % 2 === 0);
      if (i % 2 === 0) this.rock(x - 1.2, -5.8, 1 + seeded(i + 2) * 1.3, i);
      if (i % 3 === 0) this.rock(x, 6.1, 0.55, i + 20);
      this.grass(x + 1, 4.6, i + 23);
    }
    this.palm(-length / 2 + 2, -3.5, 1.1);
    this.rock(-length / 2 + 4.4, -4.8, 2.6, 55);
    this.createPier(length / 2 - 3);
    this.carX = this.positions[selected]; this.destinationX = this.carX; this.moving = false;
    this.go(selected, true); this.resize();
    this.focusX = route === 'hub' && !this.mobile ? 0 : this.carX;
    this.visualZoom = route === 'hub' && !this.mobile ? this.baseHalfHeight : this.mobile ? 11.3 : Math.min(this.baseHalfHeight, 10.5);
  }
  createPier(x) {
    const g = new THREE.Group(); g.position.set(x, 0.2, 4.4); this.world.add(g);
    for (let i = 0; i < 9; i++) this.box(g, [2.6, 0.14, 0.34], [0, 0, i * 0.38], 0xc28e4f);
    for (const z of [0, 2.8]) for (const side of [-1, 1]) this.cylinder(g, 0.13, 0.16, 1.9, [side * 1.4, -0.1, z], 0xa4713a);
    if (this.route !== 'hub') this.text(g, 'END OF THE ROUTE', [0, 1, 3], 2.8, 0.65, { fontSize: 36 });
  }
  createCar() {
    this.car = new THREE.Group(); this.scene.add(this.car);
    this.box(this.car, [2.25, 0.55, 1.14], [0, 0.63, 0], C.orange, 0.12);
    this.box(this.car, [2.05, 0.1, 1.2], [0, 0.35, 0], 0xd98514, 0.04);
    this.box(this.car, [1.35, 0.72, 1.02], [-0.2, 1.14, 0], 0xffb82c, 0.11);
    // Inset windows, roof pillars, little trim, and wheel pivots.
    for (const z of [-0.521, 0.521]) {
      this.box(this.car, [0.51, 0.47, 0.025], [-0.55, 1.16, z], 0x315660, 0.045);
      this.box(this.car, [0.48, 0.47, 0.025], [0.06, 1.16, z], 0x8fc4c4, 0.045);
      this.box(this.car, [0.2, 0.035, 0.035], [-0.45, 0.86, z * 1.12], 0x815519);
      this.box(this.car, [0.2, 0.035, 0.035], [0.2, 0.86, z * 1.12], 0x815519);
      this.box(this.car, [2, 0.055, 0.03], [0, 0.46, z * 1.1], 0xffcf58);
    }
    this.box(this.car, [0.025, 0.48, 0.85], [0.49, 1.16, 0], 0x9bc5bd, 0.02);
    this.box(this.car, [0.025, 0.45, 0.85], [-0.89, 1.16, 0], 0x416570, 0.02);
    this.box(this.car, [0.1, 0.16, 1.1], [1.15, 0.39, 0], 0x626665, 0.02);
    this.box(this.car, [0.1, 0.15, 1.1], [-1.15, 0.39, 0], 0x626665, 0.02);
    for (const z of [-0.4, 0.4]) {
      this.box(this.car, [0.04, 0.22, 0.25], [1.145, 0.65, z], 0xfff5cc, 0.03);
      this.box(this.car, [0.035, 0.2, 0.18], [-1.14, 0.63, z], 0xc5553b, 0.02);
    }
    this.box(this.car, [0.045, 0.18, 0.38], [1.16, 0.56, 0], 0x3d5050);
    for (const x of [-0.75, 0.75]) for (const z of [-0.62, 0.62]) {
      const pivot = new THREE.Group(); pivot.position.set(x, 0.32, z); this.car.add(pivot);
      const wheel = this.cylinder(pivot, 0.32, 0.32, 0.25, [0, 0, 0], 0x29373b, 12); wheel.rotation.x = Math.PI / 2;
      const hub = this.cylinder(pivot, 0.18, 0.18, 0.27, [0, 0, 0], 0xb6b9a9, 10); hub.rotation.x = Math.PI / 2;
      this.box(pivot, [0.07, 0.28, 0.28], [0, 0, 0], 0x7d8883); this.wheels.push(pivot);
    }
    this.car.scale.setScalar(1.12);
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
    if (immediate || this.reducedMotion) this.carX = this.destinationX;
    this.stations?.forEach((s, i) => {
      s.marker.visible = i === index;
      s.light.material = this.material(i === index ? C.aqua : C.orange, { emissive: i === index ? C.aqua : C.orange, emissiveIntensity: 0.4 });
      s.pad.material = this.material(i === index ? 0x52f9e8 : 0x83e6d6, { emissive: C.aqua, emissiveIntensity: i === index ? 0.35 : 0.05 });
    });
  }
  resize() {
    const w = window.innerWidth, h = window.innerHeight; this.mobile = w < 700; this.aspect = w / h;
    this.renderer.setSize(w, h); this.baseHalfHeight = this.mobile ? 13.2 : clamp(26 / this.aspect, 12, 22);
    if (this.mobile) this.renderer.setPixelRatio(Math.min(devicePixelRatio, 1.5));
    this.camera.updateProjectionMatrix();
  }
  getAnchor() {
    const a = this.stations?.[this.index]?.anchor; if (!a) return { x: innerWidth / 2, y: innerHeight / 2 };
    const p = a.clone().project(this.camera); return { x: (p.x + 1) * innerWidth / 2, y: (-p.y + 1) * innerHeight / 2 };
  }
  animate(now) {
    if (this.disposed) return;
    const dt = Math.min((now - this.lastTime) / 1000, 0.05); this.lastTime = now; const t = now / 1000;
    const previousX = this.carX; const remaining = this.destinationX - this.carX;
    this.carX = Math.abs(remaining) < 0.012 ? this.destinationX : lerp(this.carX, this.destinationX, 1 - Math.exp(-dt * 3.5));
    const moving = Math.abs(remaining) > 0.05;
    if (moving !== this.moving) { this.moving = moving; this.onMove?.(moving); }
    const delta = this.carX - previousX;
    this.car.position.set(this.carX, 0.63 + (moving && !this.reducedMotion ? Math.sin(t * 24) * 0.013 : 0), pathZ(this.carX));
    this.car.rotation.y = -Math.atan(Math.cos(this.carX * 0.155) * 0.78 * 0.155);
    this.wheels.forEach(w => { w.rotation.z -= delta / 0.32; });
    const focus = this.route === 'hub' && !this.mobile ? 0 : this.carX;
    this.focusX = lerp(this.focusX, focus, 1 - Math.exp(-dt * 3));
    const halfH = this.route === 'hub' && !this.mobile ? this.baseHalfHeight : this.mobile ? 11.3 : Math.min(this.baseHalfHeight, 10.5);
    this.visualZoom = lerp(this.visualZoom, halfH, 1 - Math.exp(-dt * 3));
    this.camera.left = -this.visualZoom * this.aspect; this.camera.right = this.visualZoom * this.aspect;
    this.camera.top = this.visualZoom; this.camera.bottom = -this.visualZoom; this.camera.updateProjectionMatrix();
    // Offset the look target toward sea: the car stays below the compact card.
    const look = new THREE.Vector3(this.focusX, 0, this.mobile ? -8.5 : -3.1);
    this.camera.position.copy(look).add(new THREE.Vector3(9, 25, 31)); this.camera.lookAt(look);
    this.sun.position.set(this.focusX - 12, 27, 11); this.sun.target.position.set(this.focusX, 0, 0); this.sun.target.updateMatrixWorld();
    this.stations?.forEach(s => { if (s.marker.visible) s.marker.position.y = 4.65 + (this.reducedMotion ? 0 : Math.sin(t * 2.5) * 0.12); });
    if (!this.reducedMotion) {
      this.wavelets.children.forEach((w, i) => { w.position.x = w.userData.baseX + Math.sin(t * 0.3 + i) * 0.35; });
      this.birds.children.forEach((b, i) => { const a = t * 0.08 + b.userData.phase; b.position.set(this.focusX + Math.sin(a) * 17, 8 + i * 0.65, -13 + Math.cos(a) * 7); b.rotation.y = -a; b.rotation.z = Math.sin(t * 1.7 + i) * 0.07; });
    }
    this.renderer.render(this.scene, this.camera);
  }
  dispose() {
    this.disposed = true; this.renderer.setAnimationLoop(null); window.removeEventListener('resize', this.resize);
    this.canvas.removeEventListener('pointerdown', this.pointerDown); this.canvas.removeEventListener('pointerup', this.pointerUp);
    this.clearWorld(); this.scene.traverse(o => { o.geometry?.dispose(); }); this.materials.forEach(m => m.dispose()); this.renderer.dispose();
  }
}
