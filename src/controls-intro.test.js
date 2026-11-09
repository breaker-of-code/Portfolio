import test from 'node:test';
import assert from 'node:assert/strict';
import { createControlsIntro } from './controls-intro.js';

test('dismissing the hint cancels completed fill-forwards transforms before returning controls', async () => {
  const previous = { innerWidth: globalThis.innerWidth, innerHeight: globalThis.innerHeight, getComputedStyle: globalThis.getComputedStyle };
  globalThis.innerWidth = 1280; globalThis.innerHeight = 720;
  globalThis.getComputedStyle = () => ({ transform: 'matrix(1.9,0,0,1.9,300,200)', opacity: '1' });
  const element = () => ({ hidden: true, dataset: {}, textContent: '', animations: [],
    classList: { add() {}, remove() {} }, getBoundingClientRect: () => ({ left: 400, top: 70, width: 240, height: 20 }),
    querySelector() { return { textContent: '' }; },
    animate(frames, options) { const animation = { frames, options, finished: Promise.resolve(), cancelled: false, cancel() { this.cancelled = true; } }; this.animations.push(animation); return animation; },
  });
  const hint = element(), panel = element(), buttons = [element(), element()];
  const intro = createControlsIntro({ hint, panel, buttons, isMobile: () => false, reducedMotion: () => false });
  try {
    intro.show(); await Promise.resolve(); // Entry finished but still fills forwards.
    intro.dismiss();
    assert.equal(hint.animations[0].cancelled, true, 'the centered transform must release ownership');
    assert.equal(hint.animations[1].frames[1].transform, 'none');
    await Promise.resolve(); assert.equal(panel.hidden, true);
    intro.show(); assert.equal(hint.animations.length, 2, 'the introduction only appears once per page opening');
  } finally { intro.dispose(); Object.assign(globalThis, previous); }
});
