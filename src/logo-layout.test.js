import test from 'node:test';
import assert from 'node:assert/strict';
import { logoContentBounds } from './logo-layout.js';

test('logo fitting removes uniform/transparent whitespace while retaining every visible mark inside the circle', () => {
  for (const bg of [[255,255,255,255],[20,20,20,255],[0,0,0,0]]) {
    const width=100,height=80,data=new Uint8ClampedArray(width*height*4);
    for(let i=0;i<data.length;i+=4)data.set(bg,i);
    for(let y=30;y<50;y++)for(let x=10;x<90;x++)data.set([180,40,100,255],(y*width+x)*4);
    const bounds=logoContentBounds({data,width,height});
    assert.deepEqual([bounds.x,bounds.y,bounds.width,bounds.height],[10,30,80,20]);
    assert.ok(bounds.radius>=Math.hypot(40,10));
    assert.ok(bounds.radius<Math.max(width,height)/2);
  }
});

test('blank or nonuniform-background artwork has a safe full-image fallback', () => {
  const width=10,height=10,data=new Uint8ClampedArray(width*height*4).fill(255);
  assert.deepEqual(logoContentBounds({data,width,height}),{x:0,y:0,width:10,height:10,radius:5});
  data.set([0,10,200,255],0);
  assert.equal(logoContentBounds({data,width,height}).width,10);
});
