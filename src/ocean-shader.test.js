import test from 'node:test';
import assert from 'node:assert/strict';
import * as THREE from 'three';
import { CoastalOcean } from './ocean.js';

test('ocean shader preserves preprocessor line boundaries', () => {
  const ocean = new CoastalOcean({ scene: new THREE.Scene() });
  for (const material of [ocean.waterMaterial]) {
    const shader = { vertexShader: THREE.ShaderLib.basic.vertexShader, fragmentShader: THREE.ShaderLib.basic.fragmentShader, uniforms: {} };
    material.onBeforeCompile(shader);
    for (const source of [shader.vertexShader, shader.fragmentShader]) {
      assert.ok(!/[^\n\r\t ][\t ]*#include/.test(source), 'a chunk include must start on its own line');
    }
    assert.equal(shader.uniforms.oceanTime, ocean.time);
  }
  ocean.dispose();
});
