import * as THREE from 'three';

export const PROJECT_LANDMARKS = {
  'arthur vr':'vr', 'arthur':'vr', 'xana':'metaverse', 'xana (metaverse)':'metaverse',
  'gods of chess':'chess', 'tap challenge':'tap', 'e.v.a.l':'eval', 'e.v.a.l.':'eval',
  'game changer':'boxing', 'shape jump':'jump', 'enter the dungeons':'dungeon',
  'hexagrids':'hex', 'hexagrids x':'hex', 'pong':'pong', 'pong 3d':'pong',
  'pet idle miner':'pet', 'wonderland runner':'race', 'endless runner':'race',
};
export function projectLandmarkType(type, project) {
  return PROJECT_LANDMARKS[project?.name?.toLowerCase().trim()] || type;
}

// Shared, lightweight procedural geometry; no remote models or startup assets.
export function createProjectLandmark(b, type) {
  const g = new THREE.Group(); g.name = `Project landmark: ${type}`;
  const ball = (radius, position, color, scale = [1,1,1]) => {
    const m=b.mesh(new THREE.SphereGeometry(radius,20,14),color,g);m.position.set(...position);m.scale.set(...scale);return m;
  };
  const ring = (radius, tube, position, color, arc=Math.PI*2) => {
    const m=b.mesh(new THREE.TorusGeometry(radius,tube,6,28,arc),color,g);m.position.set(...position);return m;
  };
  const base = () => b.cylinder(g,1.2,1.3,.15,[0,.09,0],0xe9ddbd,24);
  if(type==='pet') {
    base();
    for(const [x,color,dog] of [[-.58,0xf4ca88,false],[.58,0xe6e5d8,true]]) {
      ball(.43,[x,.62,0],color,[1,1,.82]);
      ball(.4,[x,1.24,.04],color,[1,.9,.85]);
      for(const side of [-1,1]) {
        if(dog) ball(.18,[x+side*.34,1.29,.03],0x805c40,[.7,1.5,.7]);
        else {const ear=b.mesh(new THREE.ConeGeometry(.17,.4,4),color,g);ear.position.set(x+side*.23,1.67,.03);}
        ball(.055,[x+side*.14,1.29,.37],0x173e49);
        ball(.14,[x+side*.23,.27,.17],color,[1,.6,1]);
      }
      ball(.06,[x,1.13,.4],dog?0x403e35:0xd27d7c);
    }
    for(let i=0;i<3;i++) b.cylinder(g,.3,.3,.12,[-.84,.2+i*.12,.8],0xffc757,20);
    b.box(g,[.85,.07,.46],[.5,.21,.87],0x478768,.02);
    b.box(g,[.85,.07,.46],[.5,.3,.87],0x65a678,.02);
    b.box(g,[.12,.03,.4],[.5,.35,.87],0xf4e8b5,.01);
  } else if(type==='vr') {
    base();
    b.box(g,[2.45,1.15,1.08],[0,1.55,0],0xf1eee0,.22);
    b.box(g,[2.22,.88,.18],[0,1.55,.57],0x173e49,.18);
    b.box(g,[1.88,.58,.06],[0,1.55,.68],0x35adbc,.16);
    for(const x of [-.48,.48]) {const lens=ring(.24,.055,[x,1.55,.73],0x8df1ee);lens.scale.y=.8;}
    const strap=ring(.94,.13,[0,1.57,-.44],0x234f58);strap.rotation.x=Math.PI/2;
    const top=b.mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3([new THREE.Vector3(0,1.96,.02),new THREE.Vector3(0,2.5,-.5),new THREE.Vector3(0,1.9,-1.15)]),18,.11,6,false),0x234f58,g);
    top.name='Head strap';
    for(const x of [-1.1,1.1]) {
      b.box(g,[.17,.65,.17],[x,.49,.9],0xe9eee3,.08);
      const controller=ring(.25,.065,[x,.87,.9],0x234f58);controller.rotation.x=-.35;
    }
  } else if(type==='eval') {
    base();ball(.86,[0,1.2,0],0xd8364b,[1.08,1.03,.8]);
    for(const x of [-.43,.43]) b.box(g,[.31,.33,.43],[x,.29,.08],0xc52e42,.14);
    for(const x of [-1,1]) ball(.24,[x,1,.05],0xd8364b,[.72,1,.85]);
    for(const x of [-.34,.34]) {
      ball(.265,[x,1.49,.57],0xfff3df,[1,1.1,.45]);
      ball(.14,[x+.035,1.48,.69],0x764330,[1,1.08,.38]);
      ball(.08,[x+.043,1.48,.73],0x29282c,[1,1.1,.32]);
      ball(.035,[x+.01,1.55,.76],0xffffff);
    }
    const smile=ring(.24,.048,[0,1.03,.67],0x712c36,Math.PI);smile.rotation.z=Math.PI;
  } else if(type==='chess') {
    b.box(g,[2.8,.16,2.5],[0,.12,0],0x8c6b47,.06);
    for(let x=0;x<8;x++)for(let z=0;z<8;z++)b.box(g,[.32,.04,.285],[(x-3.5)*.33,.22,(z-3.5)*.29],(x+z)%2?0x254d56:0xf4e4c5);
    for(const [x,z,color,king] of [[-.6,-.15,0xf6e4bc,true],[.6,.25,0x284953,false]]) {
      b.cylinder(g,.3,.4,.16,[x,.34,z],color,20);b.cylinder(g,.15,.26,.74,[x,.76,z],color,16);
      if(king){b.cylinder(g,.32,.22,.15,[x,1.2,z],color,16);b.box(g,[.12,.59,.12],[x,1.65,z],color,.03);b.box(g,[.43,.12,.12],[x,1.69,z],color,.03);}
      else ball(.26,[x,1.3,z],color);
    }
  } else if(type==='tap') {
    base();b.box(g,[1.63,2.45,.27],[0,1.35,0],0x204751,.16);b.box(g,[1.4,1.98,.045],[0,1.38,.16],0x43bdc1,.08);
    b.box(g,[.4,.05,.04],[0,2.41,.17],0xe9e4ce,.02);
    const button=b.cylinder(g,.43,.43,.13,[0,1.25,.26],0xffc451,28);button.rotation.x=Math.PI/2;
    for(const x of [-.45,0,.45])b.box(g,[.2,.09,.06],[x,2.04,.21],0xf7ecd1,.03);
    const finger=b.box(g,[.25,.91,.26],[.27,.84,.56],0xe8bd8e,.12);finger.rotation.z=-.3;
    ring(.58,.035,[0,1.25,.36],0xfff2c3);
  } else if(type==='boxing') {
    b.box(g,[2.7,.16,2.2],[0,.12,0],0x3974a0,.05);
    for(const x of [-1.2,1.2])for(const z of [-.95,.95])b.cylinder(g,.06,.06,1.2,[x,.8,z],0x234957,8);
    for(const y of [.5,.85,1.15])for(const z of [-.95,.95])b.beam(g,[-1.2,y,z],[1.2,y,z],.026,0xe9e8d4);
    for(const [x,color] of [[-.53,0x59b547],[.53,0xd7443f]]) {
      ball(.53,[x,1.47,0],color,[1,1.1,.8]);ball(.23,[x+(x<0?.3:-.3),1.23,.29],color);
      b.box(g,[.5,.37,.55],[x,.95,0],color,.1);
    }
  } else if(type==='hex') {
    base();for(let i=0;i<7;i++){
      const a=i*Math.PI/3,x=i===6?0:Math.cos(a)*.87,z=i===6?0:Math.sin(a)*.87;
      const color=[0x3bb6b6,0xf1bc4d,0xb887c7][i%3],height=i===6?1.05:.35;
      b.cylinder(g,.48,.48,height,[x,.2+height/2,z],color,6);b.cylinder(g,.35,.35,.025,[x,.22+height,z],0xf7e8c8,6);
    }
  } else if(type==='pong') {
    base();for(const x of [-.9,.9]){b.box(g,[.22,1.35,.5],[x,.95,0],x<0?0x45bbca:0xf5bd4d,.07);}
    ball(.23,[.05,1.08,.12],0xfff5d5);for(const x of [-.5,-.23,.36,.6])ball(.055,[x,1.08,.12],0xffdf8e);
  } else if(type==='jump') {
    base();for(const [x,y,color] of [[-.85,.42,0x48bec4],[0,1.13,0xffbd46],[.85,.42,0xd988a1]]){
      const block=b.box(g,[.6,.6,.6],[x,y,0],color,.06);if(x===0)block.rotation.z=.3;
    }
    for(let i=0;i<7;i++){const a=i/6*Math.PI;ball(.055,[Math.cos(a)*.9,.5+Math.sin(a)*1.3,-.05],0xf2e7c9);}
  } else if(type==='dungeon') {
    b.box(g,[2.6,.25,1.5],[0,.15,0],0x6c7b73,.04);
    for(const x of [-.83,.83]){b.box(g,[.67,1.8,.8],[x,1.1,0],0xbcb69e,.03);for(const dx of [-.23,.23])b.box(g,[.18,.3,.8],[x+dx,2.13,0],0xd4ccb4,.02);}
    b.box(g,[1,1.6,.7],[0,1,0],0xbcb69e,.03);b.box(g,[.74,1.3,.07],[0,.82,.4],0x263c3e,.12);
    for(const x of [-.65,.65]) {b.box(g,[.07,.38,.08],[x,1.1,.55],0x80613c);ball(.12,[x,1.4,.55],0xffba47,[.7,1.5,.7]);}
  } else if(type==='metaverse') {
    base();ball(.76,[0,1.3,0],0x39aab8);
    for(const axis of [0,1,2]){const r=ring(.81,.035,[0,1.3,0],0x97ece3);if(axis===1)r.rotation.y=Math.PI/2;if(axis===2)r.rotation.x=Math.PI/2;}
    for(const x of [-.95,.95]){ball(.19,[x,.85,.55],0xf1ce9c);b.box(g,[.32,.48,.25],[x,.45,.55],x<0?0xffbc4a:0x655694,.06);}
  } else return null;
  return g;
}
