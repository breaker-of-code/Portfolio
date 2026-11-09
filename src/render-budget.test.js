import test from 'node:test';
import assert from 'node:assert/strict';
import { RenderBudget, ShadowBudget } from './render-budget.js';
test('render budget caps movement at 30 and settled idle at 20 without delaying invalidations', () => {
  const b=new RenderBudget();
  assert.equal(b.due(0,true),true);assert.equal(b.due(16,true),false);assert.equal(b.due(33,true),true);
  assert.equal(b.due(2000),true);assert.equal(b.interval,50);assert.equal(b.due(2033),false);assert.equal(b.due(2050),true);
  b.invalidate();assert.equal(b.due(2051),true);b.reset();assert.equal(b.due(2052),true);
});
test('moving shadows follow every rendered pose, refresh on arrival, and cache only while settled', () => {
  const b=new ShadowBudget();assert.equal(b.due(0,false),true);assert.equal(b.due(400,false),false);
  assert.equal(b.due(500,false),true);
  for (const frame of [533,566,599,632]) assert.equal(b.due(frame,true),true);
  assert.equal(b.due(665,false),true); // Parked pose, rather than the last travelling pose.
  assert.equal(b.due(698,false),false);assert.equal(b.due(1165,false),true);
  b.invalidate();assert.equal(b.due(1166,false),true);
});

test('dialog and transition pauses compose and stop the renderer loop without losing resume', async () => {
  const { CoastalScene }=await import('./scene.js');const s=Object.create(CoastalScene.prototype),loops=[];
  s.canvas={dataset:{}};s.renderer={setAnimationLoop:fn=>loops.push(fn)};s.animate=()=>{};
  s.renderBudget=new RenderBudget();s.qualityController={reset(){}};
  s.setPaused(true,'overlay');s.setPaused(true,'transition');s.setPaused(false,'overlay');
  assert.equal(s.paused,true);assert.equal(loops.length,1);assert.equal(loops[0],null);
  s.setPaused(false,'transition');assert.equal(s.paused,false);assert.equal(loops[1],s.animate);
  assert.equal(s.canvas.dataset.renderState,'running');
});

test('palm leaves instance across a spatial cell with original parent transforms preserved', async () => {
  const THREE=await import('three');const {CoastalScene}=await import('./scene.js');
  const s=Object.create(CoastalScene.prototype);s.world=new THREE.Group();s.palmLeaves=[];s.batching={savedDraws:0};
  const material=new THREE.MeshLambertMaterial();
  for(let tree=0;tree<2;tree++) {const group=new THREE.Group();group.position.set(tree*10,0,0);s.world.add(group);
    for(let i=0;i<4;i++){const leaf=new THREE.Mesh(new THREE.BoxGeometry(1,.1,1),material);leaf.position.set(i*.3,4,0);group.add(leaf);s.palmLeaves.push({leaf,phase:i});}}
  s.instancePalmLeaves();assert.equal(s.palmBatches.length,1);assert.equal(s.batching.savedDraws,7);
  const mesh=s.palmBatches[0].mesh,matrix=new THREE.Matrix4();mesh.getMatrixAt(4,matrix);
  assert.equal(new THREE.Vector3().setFromMatrixPosition(matrix).x,10);
  assert.ok(s.palmLeaves.every(({leaf})=>!leaf.visible));assert.equal(mesh.count,8);
  mesh.geometry.dispose();mesh.dispose();material.dispose();
});
