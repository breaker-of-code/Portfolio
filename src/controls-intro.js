// Animate the real controls, so the hint returns to their actual resting place.
export function createControlsIntro({ hint, buttons, panel, isMobile, reducedMotion }) {
  let active = false, shown = false;
  const animations = new Set();
  const animate = (element, frames, options) => {
    const animation = element.animate(frames, options); animations.add(animation);
    // Finished fill-forwards animations still own the transform until cancelled.
    animation.finished.then(() => { if (options.fill !== 'forwards') animations.delete(animation); }, () => animations.delete(animation));
    return animation;
  };
  const reset = () => {
    animations.forEach(animation => animation.cancel()); animations.clear();
    [hint, ...buttons].forEach(element => element.classList.remove('controls-intro-focus'));
  };
  return {
    show() {
      if (shown) return;
      shown = active = true; panel.hidden = false;
      const mobile = isMobile(), duration = reducedMotion() ? 0 : 650;
      panel.dataset.mode = mobile ? 'mobile' : 'desktop';
      panel.querySelector('h2').textContent = mobile ? 'Tap the arrows to move' : 'Press ← / → to move';
      animate(panel, [{ opacity: 0 }, { opacity: 1 }], { duration, fill: 'forwards' });
      if (mobile) {
        for (const button of buttons) {
          button.classList.add('controls-intro-focus');
          if (!reducedMotion()) animate(button, [{ transform: 'scale(1)' }, { transform: 'scale(1.18)' }, { transform: 'scale(1)' }], { duration: 1300, iterations: Infinity, easing: 'ease-in-out' });
        }
      } else {
        const rect = hint.getBoundingClientRect();
        const x = innerWidth / 2 - (rect.left + rect.width / 2), y = innerHeight / 2 - 30 - (rect.top + rect.height / 2);
        hint.classList.add('controls-intro-focus');
        animate(hint, [{ transform: 'none' }, { transform: `translate(${x}px, ${y}px) scale(1.9)` }], { duration, easing: 'cubic-bezier(.2,.8,.2,1)', fill: 'forwards' });
      }
    },
    dismiss() {
      if (!active) return;
      active = false;
      const transforms = [hint, ...buttons].map(element => [element, getComputedStyle(element).transform]);
      const opacity = getComputedStyle(panel).opacity;
      reset();
      const duration = reducedMotion() ? 0 : 350;
      for (const [element, transform] of transforms) {
        if (transform === 'none') continue;
        element.classList.add('controls-intro-focus');
        const animation = animate(element, [{ transform }, { transform: 'none' }], { duration, easing: 'cubic-bezier(.2,.8,.2,1)' });
        animation.finished.then(() => element.classList.remove('controls-intro-focus'), () => {});
      }
      animate(panel, [{ opacity }, { opacity: 0 }], { duration }).finished.then(() => { panel.hidden = true; }, () => {});
    },
    dispose() { active = false; reset(); panel.hidden = true; },
  };
}
