import test from 'node:test';
import assert from 'node:assert/strict';
import { CoastalScene } from './scene.js';

const deferred = () => { let resolve; const promise = new Promise(done => { resolve = done; }); return {promise, resolve}; };
function fixture() {
  const scene = Object.create(CoastalScene.prototype), calls = [];
  scene.route = 'career'; scene.routeItems = [{}]; scene.routeTextures = [];
  scene.canvas = {dataset: {}}; scene.scene = {}; scene.camera = {};
  scene.renderer = {getContext: () => ({isContextLost: () => false}), compileAsync: async () => { calls.push('compile'); }};
  scene.renderBudget = scene.shadowBudget = {invalidate() {}};
  scene.animate = (_now, force) => { assert.equal(force, true); calls.push('frame'); };
  return {scene, calls};
}

test('readiness waits for route textures and compiled shaders before presenting a real frame', async () => {
  const {scene, calls} = fixture(), logo = deferred(), shader = deferred();
  scene.routeTextures = [{userData: {ready: logo.promise}}];
  scene.renderer.compileAsync = async () => { calls.push('compile'); await shader.promise; };
  const ready = scene.renderReady();
  await Promise.resolve(); assert.deepEqual(calls, []); assert.equal(scene.canvas.dataset.firstFrame, undefined);
  logo.resolve(); await new Promise(resolve => setImmediate(resolve));
  assert.deepEqual(calls, ['compile']); assert.equal(scene.canvas.dataset.firstFrame, undefined);
  shader.resolve(); await ready;
  assert.deepEqual(calls, ['compile', 'frame']); assert.equal(scene.canvas.dataset.firstFrame, 'career');
});

test('a lost context or retired route cannot be marked as a ready island', async () => {
  const {scene, calls} = fixture(); scene.contextUnavailable = true;
  await assert.rejects(scene.renderReady(), /context/); assert.deepEqual(calls, []);
  scene.contextUnavailable = false;
  scene.renderer.compileAsync = async () => { scene.routeItems = [{}]; };
  await assert.rejects(scene.renderReady(), /changed/); assert.equal(scene.canvas.dataset.firstFrame, undefined);
  scene.renderer.compileAsync = async () => {};
  await scene.renderReady(); assert.equal(scene.canvas.dataset.firstFrame, 'career');
});

test('shader errors do not reveal a blank canvas as a ready island', async () => {
  const {scene, calls} = fixture();
  scene.renderer.compileAsync = async () => { scene.shaderError = new Error('Unsupported shader'); };
  await assert.rejects(scene.renderReady(), /Unsupported shader/);
  assert.deepEqual(calls, []); assert.equal(scene.canvas.dataset.firstFrame, undefined);
});
