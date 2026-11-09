import test from 'node:test';
import assert from 'node:assert/strict';
import { createRouteAssetLoader } from './route-assets.js';

test('section code stays unloaded until requested and concurrent requests share one load', async () => {
  let requests = 0;
  const loader = createRouteAssetLoader({ career: async () => { requests++; return (builder, type, variant) => variant; } });
  assert.ok(loader.has('hub')); assert.equal(loader.has('career'), false); assert.equal(requests, 0);
  assert.throws(() => loader.create('career'), /not ready/);
  await Promise.all([loader.prepare('career'), loader.prepare('career')]);
  assert.equal(requests, 1); assert.ok(loader.has('career'));
  assert.equal(loader.create('career', {}, 'building', 3), 3);
  await loader.prepare('career'); assert.equal(requests, 1);
});

test('failed section downloads can be retried without poisoning the route cache', async () => {
  let attempts = 0;
  const loader = createRouteAssetLoader({ projects: async () => { if (++attempts === 1) throw new Error('Offline'); return () => 'ready'; } });
  await assert.rejects(loader.prepare('projects'), /Offline/);
  assert.equal(loader.has('projects'), false);
  await loader.prepare('projects'); assert.equal(loader.create('projects'), 'ready');
});
