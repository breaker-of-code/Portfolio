// Continuous acceleration, cruise, and braking; starts and stops at zero speed.
export function drivingProgress(progress) {
  const p = Math.max(0, Math.min(1, progress));
  const acceleration = 0.34, braking = 0.25;
  const peak = 1 / (1 - (acceleration + braking) / 2);
  if (p < acceleration) return peak * p * p / (2 * acceleration);
  if (p <= 1 - braking) return peak * (p - acceleration / 2);
  return 1 - peak * (1 - p) ** 2 / (2 * braking);
}
