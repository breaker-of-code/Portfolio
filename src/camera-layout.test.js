import test from 'node:test';
import assert from 'node:assert/strict';
import { referenceHalfHeight, viewportHalfHeight, routeCameraFocus, fittedZoom, DEFAULT_FRAME_FILL } from './camera-layout.js';

test('resizing preserves model size in CSS pixels, including mobile landscape', () => {
  const reference = referenceHalfHeight({ left: -26, rightEdge: 26, bottom: -8, top: 9 });
  const scales = [[1440, 900], [1000, 700], [844, 390]].map(([, height]) => height / (2 * viewportHalfHeight(height, reference, 150)));
  for (const scale of scales) assert.ok(Math.abs(scale - scales[0]) < 1e-9);
  assert.equal(viewportHalfHeight(700, reference, 300), viewportHalfHeight(700, reference, 150) / 2);
});

test('cropped home islands follow the car while a wide view remains centered', () => {
  assert.equal(routeCameraFocus(-16, 45, 30), 0);
  assert.ok(routeCameraFocus(-16, 45, 15) < 0);
  assert.ok(routeCameraFocus(16, 45, 15) > 0);
  assert.equal(routeCameraFocus(0, 45, 15), 0);
});


test('automatic zoom fits Home within safe horizontal and vertical space at different screen sizes', () => {
  const bounds = { left: -28, rightEdge: 28, bottom: -7, top: 10 };
  for (const [width, height, top, dock] of [[3572,1708,185,258], [1920,1080,185,258], [1280,720,185,258], [844,390,83,152]]) {
    const padding = Math.max(24, Math.min(70, width * .045));
    const zoom = fittedZoom(bounds, { width, height, top, bottom: height - dock, padding });
    const scale = height / (2 * viewportHalfHeight(height, referenceHalfHeight(bounds), zoom));
    assert.ok(zoom > 0 && Number.isFinite(zoom));
    assert.ok((bounds.rightEdge - bounds.left) * scale <= width - 2 * padding + 1e-8);
    assert.ok((bounds.top - bounds.bottom) * scale <= height - dock - top + 1e-8);
    assert.ok(Math.abs((bounds.rightEdge - bounds.left) * scale - (width - 2 * padding)) < 1e-8 || Math.abs((bounds.top - bounds.bottom) * scale - (height - dock - top)) < 1e-8);
  }
});


test('closer default framing maps 190% to 200% without changing manual pixel scale', () => {
  assert.equal(190 * DEFAULT_FRAME_FILL, 200);
  for (const zoom of [88, 134, 190, 204]) {
    const original = viewportHalfHeight(720, 20, zoom);
    const closer = viewportHalfHeight(720, 20, zoom * DEFAULT_FRAME_FILL);
    assert.ok(Math.abs(original / closer - 200 / 190) < 1e-9);
  }
});
