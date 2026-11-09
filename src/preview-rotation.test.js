import test from 'node:test';
import assert from 'node:assert/strict';
import { previewPair, createPreviewRotation, applyPreviewItem, fadePreviewPair } from './preview-rotation.js';

const items=Array.from({length:5},(_,index)=>({index,src:`/thumb-${index}.webp`,alt:`Photo ${index}`,label:`Open ${index}`,action:'data-image'}));
function clock() { return {tick:null,cleared:[],setTimer(fn,ms){assert.equal(ms,4000);this.tick=fn;return 7;},clearTimer(id){this.cleared.push(id);}}; }
const options=c=>({setTimer:c.setTimer.bind(c),clearTimer:c.clearTimer.bind(c)});

test('two preview slots rotate through every image and wrap an odd count at four-second ticks', async()=>{
 const c=clock(),prepared=[],shown=[];
 const rotation=createPreviewRotation({items,...options(c),prepare:async pair=>prepared.push(pair.map(i=>i.index)),show:async pair=>shown.push(pair.map(i=>i.index))});
 assert.deepEqual(previewPair(items).map(i=>i.index),[0,1]);
 await c.tick();await c.tick();await c.tick();
 assert.deepEqual(shown,[[2,3],[4,0],[1,2]]);assert.deepEqual(prepared,shown);
 rotation.dispose();assert.deepEqual(c.cleared,[7]);
 for(const count of [0,1,2]) {
  const small=clock(),staticPreview=createPreviewRotation({items:items.slice(0,count),...options(small)});
  assert.equal(small.tick,null);staticPreview.dispose();
 }
});

test('hidden/dialog pauses do not fetch or advance; disposal and overlapping loads cannot update retired cards',async()=>{
 const c=clock();let allowed=false,finish,changes=0,loads=0;
 const rotation=createPreviewRotation({items,...options(c),canRotate:()=>allowed,prepare:()=>{loads++;return new Promise(resolve=>{finish=resolve;});},show:async()=>{changes++;}});
 await c.tick();assert.equal(loads,0);
 allowed=true;const pending=c.tick();await c.tick();assert.equal(loads,1);
 rotation.dispose();finish();await pending;assert.equal(changes,0);await c.tick();assert.equal(loads,1);
});

test('failed thumbnails retain the current clickable pair and allow later pairs to continue',async()=>{
 const c=clock(),shown=[];let first=true;
 createPreviewRotation({items,...options(c),prepare:async()=>{if(first){first=false;throw Error('missing image');}},show:async pair=>shown.push(pair.map(i=>i.index))});
 await c.tick();assert.deepEqual(shown,[]);await c.tick();assert.deepEqual(shown,[[4,0]]);
});

function slot(){const attributes={},image={},caption={};return {attributes,image,caption,animations:[],setAttribute(k,v){attributes[k]=v;},querySelector(q){return q==='img'?image:caption;},animate(frames){const a={frames,cancelled:false,cancel(){this.cancelled=true;},finished:Promise.resolve()};this.animations.push(a);return a;}};}
test('fades update project image indices and company gallery targets, labels and cover captions together',async()=>{
 const slots=[slot(),slot()],signal=new AbortController();
 await fadePreviewPair(slots,[items[2],items[3]],signal.signal);
 assert.equal(slots[0].attributes['data-image'],'2');assert.equal(slots[0].image.src,'/thumb-2.webp');
 assert.equal(slots[0].attributes['aria-label'],'Open 2');assert.equal(slots[0].animations.length,2);
 assert.ok(slots.every(s=>s.animations.every(a=>a.cancelled)));
 const company={index:11,src:'/cover.webp',action:'data-company-project',title:'Linked game',label:'Open Linked game',alt:'Linked game'};
 applyPreviewItem(slots[0],company);assert.equal(slots[0].attributes['data-company-project'],'11');assert.equal(slots[0].caption.textContent,'Linked game');
 const still=slot();await fadePreviewPair([still],[items[4]],signal.signal,true);assert.equal(still.animations.length,0);assert.equal(still.attributes['data-image'],'4');
 signal.abort();await fadePreviewPair([still],[items[0]],signal.signal);assert.equal(still.attributes['data-image'],'4');
});

test('leaving a card during fade cancels animations without changing retired click targets', async()=>{
 const slots=[slot(),slot()],controller=new AbortController();
 for(const s of slots)s.animate=()=>{let reject;const animation={finished:new Promise((_,r)=>{reject=r;}),cancel(){reject(Error('cancelled'));}};s.animations.push(animation);return animation;};
 const pending=fadePreviewPair(slots,[items[2],items[3]],controller.signal);
 controller.abort();await assert.rejects(pending,/cancelled/);
 assert.equal(slots[0].attributes['data-image'],undefined);
});
