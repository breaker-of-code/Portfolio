// One trip at a time. A single opposite command returns to its departure stop.
export function createDriveController({ getIndex, getLength, go, now = () => performance.now() }) {
  let trip = null, unlockAt = 0;
  const controller = {
    get busy() { return Boolean(trip) || now() < unlockAt; },
    get trip() { return trip ? { ...trip } : null; },
    reset() { trip = null; unlockAt = 0; },
    arrive() { if (trip) { trip = null; unlockAt = now() + 500; } },
    step(delta) {
      const direction = Math.sign(delta);
      if (!direction) return false;
      if (trip) {
        if (trip.reversed || direction === trip.direction) return false;
        trip = { ...trip, target: trip.origin, direction, reversed: true };
        go(trip.target);
        return true;
      }
      return controller.to(getIndex() + direction);
    },
    to(index) {
      if (!Number.isFinite(index)) return false;
      const target = Math.max(0, Math.min(getLength() - 1, Math.trunc(index)));
      if (trip) return target === trip.origin ? controller.step(-trip.direction) : false;
      if (now() < unlockAt || target === getIndex()) return false;
      trip = { origin: getIndex(), target, direction: Math.sign(target - getIndex()), reversed: false };
      go(target);
      return true;
    },
  };
  return controller;
}
