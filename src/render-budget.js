// Simulation runs only when a frame is due; deliberate caps are excluded from
// adaptive-quality timing so an idle budget cannot be mistaken for overload.
export class RenderBudget {
  constructor() { this.lastFrame = -Infinity; this.lastActive = -Infinity; this.force = true; this.interval = 1000 / 30; }
  invalidate() { this.force = true; }
  reset() { this.lastFrame = -Infinity; this.force = true; }
  due(now, active = false) {
    if (active) this.lastActive = now;
    this.interval = 1000 / (now - this.lastActive < 1600 ? 30 : 20);
    if (!this.force && now - this.lastFrame < this.interval - .8) return false;
    this.lastFrame = now; this.force = false; return true;
  }
}

export class ShadowBudget {
  constructor() { this.dirty = true; this.last = -Infinity; this.active = false; }
  invalidate() { this.dirty = true; }
  due(now, active) {
    // The Jeep and following light must share the rendered frame's pose.
    // Cache only when settled, and refresh once on arrival before caching again.
    const justStopped = this.active && !active;
    this.active = Boolean(active);
    if (!active && !justStopped && !this.dirty && now - this.last < 500) return false;
    this.dirty = false; this.last = now; return true;
  }
}
