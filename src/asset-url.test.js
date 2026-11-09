import test from 'node:test';
import assert from 'node:assert/strict';
import { assetUrl } from './asset-url.js';

test('public assets resolve at root and repository Pages URLs without double prefixes', () => {
  for (const path of ['/media/puzzle.jpg', 'media/puzzle.jpg', './media/puzzle.jpg']) {
    assert.equal(assetUrl(path, '/'), '/media/puzzle.jpg');
    assert.equal(assetUrl(path, '/portfolio/'), '/portfolio/media/puzzle.jpg');
  }
  assert.equal(assetUrl('/portfolio/audio/ui-click.m4a', '/portfolio/'), '/portfolio/audio/ui-click.m4a');
  assert.equal(assetUrl('/files/resume.pdf', '/portfolio/'), '/portfolio/files/resume.pdf');
});

test('external and browser-managed URLs remain unchanged', () => {
  for (const value of ['', 'https://example.com/a.jpg', '//cdn.example.com/a.jpg', 'mailto:me@example.com', 'data:image/png;base64,AA', 'blob:https://example.com/id', '#section', '?view=1']) {
    assert.equal(assetUrl(value, '/portfolio/'), value);
  }
});
