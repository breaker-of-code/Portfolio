// The shader and scenery share one wave definition, so hulls follow the actual
// triangular surface rather than an unrelated bobbing animation.
import { oceanCell } from './ocean-grid.js';

export const OCEAN_GRID = { size: 600, columns: 240, rows: 240 };
const shoreWidth = 7.6;
const fadeStart = 0.4, fadeEnd = 8.5;
const waves = [
  { amplitude: 1.25, x: 0.13, z: 0.20, speed: 0.55, phase: 0 },
  { amplitude: 0.55, x: -0.21, z: 0.13, speed: 0.39, phase: 1.1 },
  { amplitude: 0.20, x: 0.38, z: 0.29, speed: 0.76, phase: 0 },
];

export function oceanVertexHeight(x, z, time, halfLength) {
  const distance = Math.hypot(Math.max(Math.abs(x) - halfLength, 0), Math.max(Math.abs(z) - shoreWidth, 0));
  const blend = Math.max(0, Math.min(1, (distance - fadeStart) / (fadeEnd - fadeStart)));
  const shelter = blend * blend * (3 - 2 * blend);
  return shelter * waves.reduce((height, wave) => height + wave.amplitude * Math.sin(x * wave.x + z * wave.z - time * wave.speed + wave.phase), 0);
}

export const oceanWaveGLSL = `
float oceanHeight(vec2 p) {
  vec2 shoreDistance = max(abs(p) - vec2(islandHalfLength, ${shoreWidth.toFixed(1)}), vec2(0.0));
  float shelter = smoothstep(${fadeStart.toFixed(1)}, ${fadeEnd.toFixed(1)}, length(shoreDistance));
  return shelter * (${waves.map(w => `${w.amplitude.toFixed(3)} * sin(p.x * ${w.x.toFixed(2)} + p.y * ${w.z.toFixed(2)} - oceanTime * ${w.speed.toFixed(2)} + ${w.phase.toFixed(1)})`).join(' + ')});
}
`;

export function oceanSurface(x, z, time, halfLength, grid) {
  const step = OCEAN_GRID.size / OCEAN_GRID.columns;
  const uniformCell = value => { const start = Math.floor((value + OCEAN_GRID.size / 2) / step) * step - OCEAN_GRID.size / 2; return [start, start + step]; };
  const [x0, x1] = grid ? oceanCell(grid.x, x) : uniformCell(x);
  const [z0, z1] = grid ? oceanCell(grid.z, z) : uniformCell(z);
  const dx = x1 - x0, dz = z1 - z0, u = (x - x0) / dx, v = (z - z0) / dz;
  const h00 = oceanVertexHeight(x0, z0, time, halfLength);
  const h10 = oceanVertexHeight(x0 + dx, z0, time, halfLength);
  const h01 = oceanVertexHeight(x0, z0 + dz, time, halfLength);
  const h11 = oceanVertexHeight(x0 + dx, z0 + dz, time, halfLength);
  // PlaneGeometry splits each cell along its bottom-left / top-right diagonal.
  const surface = u + v <= 1
    ? { height: h00 * (1 - u - v) + h10 * u + h01 * v, slopeX: (h10 - h00) / dx, slopeZ: (h01 - h00) / dz }
    : { height: h11 * (u + v - 1) + h01 * (1 - u) + h10 * (1 - v), slopeX: (h11 - h01) / dx, slopeZ: (h11 - h10) / dz };
  // Match the smoothly interpolated lighting normal used by the water shader.
  surface.slopeX = (oceanVertexHeight(x + 0.4, z, time, halfLength) - oceanVertexHeight(x - 0.4, z, time, halfLength)) / 0.8;
  surface.slopeZ = (oceanVertexHeight(x, z + 0.4, time, halfLength) - oceanVertexHeight(x, z - 0.4, time, halfLength)) / 0.8;
  return surface;
}
