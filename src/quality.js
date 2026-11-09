export const QUALITY_LEVELS = ['low', 'medium', 'high'];
export const QUALITY_PROFILES = {
  low: { desktopDpr: 1, mobileDpr: 1, shadowSize: 512, nearStep: 2.5, farStep: 10, sceneryHz: 20, exhaustInterval: .25 },
  medium: { desktopDpr: 1.25, mobileDpr: 1.15, shadowSize: 1024, nearStep: 2, farStep: 8, sceneryHz: 30, exhaustInterval: .18 },
  high: { desktopDpr: 1.5, mobileDpr: 1.25, shadowSize: 2048, nearStep: 1.5, farStep: 6, sceneryHz: 60, exhaustInterval: .14 },
};

export function initialQuality({ mobile = false, memory, cores } = {}) {
  if (memory > 0 && memory <= 4 || cores > 0 && cores <= 4) return 'low';
  return mobile ? 'medium' : 'high';
}

export function cappedPixelRatio(deviceRatio, level, mobile) {
  const profile = QUALITY_PROFILES[level];
  return Math.min(Math.max(deviceRatio || 1, 1), mobile ? profile.mobileDpr : profile.desktopDpr);
}

// Use complete three-second windows, warmup and cooldowns to avoid chasing an
// isolated shader compile, resize, loading stall or background-tab interval.
export class AdaptiveQuality {
  constructor(level, now = 0) {
    this.level = level; this.reset(now); this.lastChange = now;
  }
  reset(now) { this.windowStarted = now; this.samples = []; this.warmUntil = now + 4000; this.fastWindows = 0; }
  sample(frameMs, now, visible = true) {
    if (!visible || frameMs <= 0 || frameMs > 1000) { this.reset(now); return null; }
    if (now < this.warmUntil) return null;
    this.samples.push(Math.min(frameMs, 250));
    if (now - this.windowStarted < 3000 || this.samples.length < 30) return null;
    const sorted = this.samples.sort((a, b) => a - b);
    const p75 = sorted[Math.floor(sorted.length * .75)];
    this.samples = []; this.windowStarted = now;
    const index = QUALITY_LEVELS.indexOf(this.level);
    const slow = p75 > (this.level === 'high' ? 23 : 30);
    this.fastWindows = p75 < 18 ? this.fastWindows + 1 : 0;
    const down = slow && index > 0 && now - this.lastChange >= 7000;
    const up = this.fastWindows >= 6 && index < 2 && now - this.lastChange >= 30000;
    if (!down && !up) return null;
    this.level = QUALITY_LEVELS[index + (down ? -1 : 1)];
    this.lastChange = now; this.reset(now);
    return this.level;
  }
}
