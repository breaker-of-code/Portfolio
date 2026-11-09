import test from 'node:test';
import assert from 'node:assert/strict';
import * as THREE from 'three';
import { CoastalScene } from './scene.js';
import { createCareerBuilding } from './career-building.js';
import { createRooftopSign } from './rooftop-sign.js';
import { batchStaticMeshes } from './mesh-batching.js';

test('round signs clear every roof and keep readable faces when buildings are batched', () => {
  const makeCanvas = () => ({ width: 0, height: 0, getContext: () => ({ measureText: t => ({ width: t.length * 28 }), fillText() {}, fillRect() {} }) });
  const b=Object.create(CoastalScene.prototype); b.world=new THREE.Group(); b.materials=new Map(); b.routeTextures=[];
  for (let variant=0; variant<5; variant++) {
    const model=createCareerBuilding(b,variant), roof=new THREE.Box3().setFromObject(model).max.y;
    const sign=createRooftopSign(b,model,{name:'No Borders Innovations'},makeCanvas);
    assert.ok(sign.position.y>roof);
    assert.equal(sign.userData.logoPlaceholder,true);
    const faces=sign.children.filter(child=>child.material?.map);
    assert.equal(faces.length,1);
    assert.equal(sign.scale.x,1.25);
    const before=new THREE.Box3().setFromObject(model);
    batchStaticMeshes(model,{cellSize:Infinity});
    const after=new THREE.Box3().setFromObject(model);
    assert.ok(before.max.distanceTo(after.max)<1e-5);
    assert.ok(faces.every(face=>face.parent===sign));
    model.traverse(obj=>obj.geometry?.dispose());
  }
  b.routeTextures.forEach(texture=>texture.dispose()); b.materials.forEach(material=>material.dispose());
});

test('provided logos retain aspect ratio and late loads cannot redraw disposed route textures', async () => {
  let draws=[];
  const makeCanvas=()=>({width:0,height:0,getContext:()=>({fillText(){},fillRect(){},clearRect(){},save(){},restore(){},beginPath(){},arc(){},clip(){},drawImage:(...args)=>draws.push(args)})});
  const b=Object.create(CoastalScene.prototype); b.world=new THREE.Group(); b.materials=new Map(); b.routeTextures=[];
  const image={naturalWidth:400,naturalHeight:200};
  const model=createCareerBuilding(b,0);
  const sign=createRooftopSign(b,model,{name:'Arkadium',logo:'/media/company-logos/arkadium.png'},makeCanvas,()=>image);
  assert.equal(image.src,'/media/company-logos/arkadium.png'); image.onload();
  await b.routeTextures[0].userData.ready;
  assert.equal(sign.userData.logoPlaceholder,false);
  const logoDraws=()=>draws.filter(args=>args.length===9);
  assert.equal(logoDraws().length,1); assert.equal(logoDraws()[0][7]/logoDraws()[0][8],2);
  const lateLoad=image.onload; b.routeTextures[0].dispose(); lateLoad();
  assert.equal(logoDraws().length,1); assert.equal(image.onload,null);
  model.traverse(obj=>obj.geometry?.dispose()); b.materials.forEach(material=>material.dispose());
});
