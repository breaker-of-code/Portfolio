export function createHeldDrive({ step, canMove, schedule = queueMicrotask }) {
  const held = new Map();
  const direction = () => [...held.values()].at(-1);
  return {
    press(source, delta) {
      if (held.has(source)) return;
      held.set(source, Math.sign(delta));
      if (canMove()) step(direction());
    },
    release(source) { held.delete(source); },
    clear() { held.clear(); },
    arrive() { schedule(() => { if (held.size && canMove()) step(direction()); }); },
  };
}
