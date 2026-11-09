import test from 'node:test';
import assert from 'node:assert/strict';
import { createPerformanceProbe } from './performance-probe.js';

test('opt-in profiling reports bounded windows separately for each route', () => {
  const originals=Object.fromEntries(['location','document','innerWidth','innerHeight'].map(k=>[k,Object.getOwnPropertyDescriptor(globalThis,k)]));
  const info=console.info,reports=[];
  try {
    globalThis.document={hidden:false};globalThis.innerWidth=1440;globalThis.innerHeight=900;
    globalThis.location={search:''};assert.equal(createPerformanceProbe({},{}),null);
    globalThis.location={search:'?benchmark=test'};
    console.info=(label,value)=>reports.push(JSON.parse(value));
    const renderer={info:{render:{calls:600,triangles:200000},memory:{geometries:300,textures:12}},getPixelRatio:()=>1.5};
    const probe=createPerformanceProbe(renderer,{width:2160,height:1350});
    for(let i=0;i<=220;i++)probe.frame(i*100,4,{route:'hub',frameCpuMs:6});
    assert.equal(reports.length,2);assert.equal(reports[0].frameCpuP95Ms,6);
    assert.ok(reports.every(r=>r.samples<110));
    for(let i=221;i<=330;i++)probe.frame(i*100,5,{route:'projects',frameCpuMs:7});
    assert.equal(reports.length,3);assert.equal(reports[2].route,'projects');
  } finally {
    console.info=info;
    for(const [key,descriptor] of Object.entries(originals)) {if(descriptor)Object.defineProperty(globalThis,key,descriptor);else delete globalThis[key];}
  }
});
