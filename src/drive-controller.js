// One trip at a time. A single opposite command returns to its departure stop.
export function createDriveController({ getIndex, getLength, go }) {
  let trip = null;
  const controller = {
    get busy() { return Boolean(trip); },
    get trip() { return trip ? { ...trip } : null; },
    reset() { trip = null; },
    arrive() { trip = null; },
    approach() { if (trip && !trip.reversed) trip.ready = true; },
    passed(index) { if (trip && !trip.reversed && index !== trip.target) trip.origin = index; },
    selectStop(index) { return trip ? false : controller.to(index); },
    step(delta) {
      const direction = Math.sign(delta);
      if (!direction) return false;
      if (trip) {
        if (trip.reversed) return false;
        if (direction === trip.direction) {
          const target = trip.target + direction;
          if (!trip.ready || target < 0 || target >= getLength()) return false;
          trip = { ...trip, target, ready: false };
          go(target); return true;
        }
        trip = { ...trip, target: trip.origin, direction, reversed: true, ready: false };
        go(trip.target);
        return true;
      }
      return controller.to(getIndex() + direction);
    },
    to(index) {
      if (!Number.isFinite(index)) return false;
      const target = Math.max(0, Math.min(getLength() - 1, Math.trunc(index)));
      if (trip) {
        if (target === trip.origin) return controller.step(-trip.direction);
        return target === trip.target + trip.direction ? controller.step(trip.direction) : false;
      }
      if (target === getIndex()) return false;
      trip = { origin: getIndex(), target, direction: Math.sign(target - getIndex()), reversed: false, ready: false };
      go(target);
      return true;
    },
  };
  return controller;
}
