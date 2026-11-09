import * as THREE from 'three';

// Reuse a small particle pool; no new meshes or materials during animation.
export class JeepExhaust {
  constructor(scene) {
    this.group = new THREE.Group(); this.group.name = 'Soft white jeep exhaust'; scene.add(this.group);
    const canvas = document.createElement('canvas'); canvas.width = canvas.height = 64;
    const ctx = canvas.getContext('2d'), gradient = ctx.createRadialGradient(32, 32, 2, 32, 32, 31);
    gradient.addColorStop(0, 'rgba(255,255,255,.8)'); gradient.addColorStop(.4, 'rgba(255,255,255,.45)'); gradient.addColorStop(1, 'rgba(255,255,255,0)');
    ctx.fillStyle = gradient; ctx.fillRect(0, 0, 64, 64);
    this.texture = new THREE.CanvasTexture(canvas); this.texture.colorSpace = THREE.SRGBColorSpace;
    this.particles = Array.from({ length: 20 }, () => {
      const sprite = new THREE.Sprite(new THREE.SpriteMaterial({ map: this.texture, color: 0xffffff, transparent: true, depthWrite: false, toneMapped: false }));
      sprite.visible = false; this.group.add(sprite);
      return { sprite, age: 0, life: 1.5, velocity: new THREE.Vector3() };
    });
    this.origin = new THREE.Vector3(); this.direction = new THREE.Vector3(); this.clock = 0; this.next = 0; this.serial = 0;
  }
  reset() { this.clock = 0; for (const p of this.particles) p.sprite.visible = false; }
  update(dt, car, moving, reducedMotion) {
    if (reducedMotion) { this.reset(); return; }
    this.clock += dt;
    const interval = moving ? (this.movingInterval ?? .14) : .48;
    if (this.clock >= interval) {
      this.clock %= interval;
      const p = this.particles[this.next]; this.next = (this.next + 1) % this.particles.length;
      const phase = this.serial++ * 2.4;
      car.updateMatrixWorld(true);
      this.origin.copy(car.userData.exhaustOutlet).applyMatrix4(car.matrixWorld);
      this.direction.set(-1, 0, 0).transformDirection(car.matrixWorld);
      p.sprite.position.copy(this.origin); p.sprite.visible = true; p.age = 0; p.life = 1.65 + Math.sin(phase) * .15;
      p.velocity.copy(this.direction).multiplyScalar(moving ? .9 : .5); p.velocity.y = .36; p.velocity.z += Math.sin(phase) * .07;
      p.strength = moving ? .8 : .65;
    }
    for (const p of this.particles) {
      if (!p.sprite.visible) continue;
      p.age += dt;
      if (p.age >= p.life) { p.sprite.visible = false; continue; }
      const f = p.age / p.life;
      p.sprite.position.addScaledVector(p.velocity, dt);
      p.sprite.scale.setScalar(.16 + f * .8);
      p.sprite.material.opacity = p.strength * Math.min(1, f * 9) * (1 - f) ** 1.6;
    }
  }
  dispose() { this.group.removeFromParent(); this.particles.forEach(p => p.sprite.material.dispose()); this.texture.dispose(); }
}
