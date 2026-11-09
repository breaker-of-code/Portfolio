// Find actual artwork, ignoring transparent or uniform corner-colored margins.
// Return its furthest visible point so fitting to a circle doesn't clip the mark.
export function logoContentBounds({ data, width, height }) {
  const pixel = (x, y) => (y * width + x) * 4;
  const corners = [pixel(0, 0), pixel(width - 1, 0), pixel(0, height - 1), pixel(width - 1, height - 1)];
  const first = corners[0];
  const transparent = corners.every(i => data[i + 3] <= 12);
  const uniform = corners.every(i => [0, 1, 2, 3].every(c => Math.abs(data[i + c] - data[first + c]) <= 22));
  if (!transparent && !uniform) return { x: 0, y: 0, width, height, radius: Math.max(width, height) / 2 };
  const visible = i => data[i + 3] > 12 && (transparent || [0, 1, 2].some(c => Math.abs(data[i + c] - data[first + c]) > 22));
  let left = width, right = -1, top = height, bottom = -1;
  for (let y = 0; y < height; y++) for (let x = 0; x < width; x++) {
    if (!visible(pixel(x, y))) continue;
    left = Math.min(left, x); right = Math.max(right, x); top = Math.min(top, y); bottom = Math.max(bottom, y);
  }
  if (right < left) return { x: 0, y: 0, width, height, radius: Math.max(width, height) / 2 };
  const cx = (left + right + 1) / 2, cy = (top + bottom + 1) / 2;
  let radius = 1;
  for (let y = top; y <= bottom; y++) for (let x = left; x <= right; x++) {
    if (visible(pixel(x, y))) radius = Math.max(radius, Math.hypot(Math.abs(x + .5 - cx) + .5, Math.abs(y + .5 - cy) + .5));
  }
  return { x: left, y: top, width: right - left + 1, height: bottom - top + 1, radius };
}
