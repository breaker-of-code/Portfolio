// A fixed design frame defines world-to-CSS-pixel scale. Resizing changes the
// visible area at manual zoom; automatic zoom fits Home to the current viewport.
// User-calibrated framing: the previous automatic 190% view becomes 200%.
export const DEFAULT_FRAME_FILL = 200 / 190;

export const DESIGN_FRAME = { width: 1280, height: 720, top: 185, bottom: 242, padding: 58 };

export function referenceHalfHeight({ left, rightEdge, bottom, top }) {
  const frame = DESIGN_FRAME;
  return Math.max(
    (rightEdge - left) * frame.height / (2 * (frame.width - frame.padding * 2)),
    (top - bottom) * frame.height / (2 * (frame.height - frame.top - frame.bottom)),
  );
}

export function viewportHalfHeight(height, reference, zoom = 150) {
  return reference * height / DESIGN_FRAME.height / (zoom / 100);
}

// Fit Home once as the scale reference, never the length of a scrolling route.
export function fittedZoom(bounds, { width, height, top, bottom, padding }) {
  const halfHeight = Math.max(
    (bounds.rightEdge - bounds.left) * height / (2 * Math.max(1, width - padding * 2)),
    (bounds.top - bounds.bottom) * height / (2 * Math.max(1, bottom - top)),
  );
  return viewportHalfHeight(height, referenceHalfHeight(bounds), 100) / halfHeight * 100;
}

export function routeCameraFocus(carX, islandLength, halfWidth) {
  const limit = Math.max(0, islandLength / 2 - halfWidth + 4);
  return limit === 0 ? 0 : Math.max(-limit, Math.min(limit, carX));
}
