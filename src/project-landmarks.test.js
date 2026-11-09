import test from 'node:test';
import assert from 'node:assert/strict';
import * as THREE from 'three';
import { CoastalScene } from './scene.js';
import { createProjectIcon } from './project-icons.js';
import { projectLandmarkType } from './project-landmarks.js';
import { batchStaticMeshes } from './mesh-batching.js';

test('project-specific icons remain finite, fit a platform and survive static batching', () => {
  const b=Object.create(CoastalScene.prototype);b.world=new THREE.Group();b.materials=new Map();
  for(const name of ['Arthur VR','XANA','Gods of Chess','Tap Challenge','E.V.A.L.','Game Changer','Shape Jump','Enter the Dungeons','Hexagrids X','Pong 3D','Wonderland Runner','Pet Idle Miner']) {
    const icon=createProjectIcon(b,'space',0,{name});
    const before=new THREE.Box3().setFromObject(icon),size=before.getSize(new THREE.Vector3());
    assert.ok(!before.isEmpty(),name);
    assert.ok([size.x,size.y,size.z].every(n=>Number.isFinite(n)&&n>0),name);
    assert.ok(size.x<3.8 && size.z<3.3,name);
    batchStaticMeshes(icon,{cellSize:Infinity});
    const after=new THREE.Box3().setFromObject(icon);
    assert.ok(before.max.distanceTo(after.max)<1e-5,name);
    icon.traverse(obj=>obj.geometry?.dispose());
  }
  assert.equal(projectLandmarkType('puzzle',{name:'Wonderland Runner'}),'race');
  assert.equal(projectLandmarkType('puzzle',{name:'Unknown'}),'puzzle');
  b.materials.forEach(m=>m.dispose());
});

test('project rocks clear wide icons even at their enlarged animated size', () => {
  const b=Object.create(CoastalScene.prototype);b.world=new THREE.Group();b.materials=new Map();b.rockFootprints=[];b.route='projects';b.contactShadow=()=>{};
  const root=new THREE.Group();root.position.set(0,1.8,-3.6);root.add(createProjectIcon(b,'puzzle'));b.world.add(root);b.stations=[{iconRoot:root}];
  for(const seed of [0,3,6,37]) {
    const rock=b.rock(-1.5,-6.2,3.8,seed);
    root.scale.setScalar(1.24);root.updateWorldMatrix(true,true);
    const a=new THREE.Box3().setFromObject(root),r=new THREE.Box3().setFromObject(rock);
    assert.ok(!(a.min.x<r.max.x&&a.max.x>r.min.x&&a.min.z<r.max.z&&a.max.z>r.min.z));
    assert.equal(b.rockFootprints.at(-1).z,rock.position.z);
    root.scale.setScalar(1);
  }
  b.world.traverse(obj=>obj.geometry?.dispose());b.materials.forEach(m=>m.dispose());
});
