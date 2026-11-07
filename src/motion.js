// Continuous acceleration, cruise, and braking; starts and stops at zero speed.
export function drivingProgress(progress) {
  const p = Math.max(0, Math.min(1, progress));
  const acceleration = 0.34, braking = 0.25;
  const peak = 1 / (1 - (acceleration + braking) / 2);
  if (p < acceleration) return peak * p * p / (2 * acceleration);
  if (p <= 1 - braking) return peak * (p - acceleration / 2);
  return 1 - peak * (1 - p) ** 2 / (2 * braking);
}

// Velocity survives a destination extension, so chaining a stop never restarts acceleration.
export function advanceDriving(position, speed, destination, dt) {
  const distance = destination - position, direction = Math.sign(distance);
  const acceleration = 11, braking = 17, maximum = 7.8;
  if (Math.abs(distance) < 0.004 && Math.abs(speed) < 0.25) return { position: destination, speed: 0, arrived: true };
  const desired = direction * Math.min(maximum, Math.sqrt(2 * braking * Math.abs(distance)));
  const rate = speed * direction < 0 || Math.abs(desired) < Math.abs(speed) ? braking : acceleration;
  const nextSpeed = speed + Math.max(-rate * dt, Math.min(rate * dt, desired - speed));
  const next = position + (speed + nextSpeed) * 0.5 * dt;
  if ((destination - next) * distance <= 0) return { position: destination, speed: 0, arrived: true };
  return { position: next, speed: nextSpeed, arrived: false };
}
