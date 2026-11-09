import test from 'node:test';
import assert from 'node:assert/strict';
import { companyProjectGalleries } from './company-gallery.js';

test('company cards expose the entire associated project gallery and never infer unassigned work', () => {
  const projects=[{name:'One',images:['/one.jpg','/two.jpg','/three.jpg'],demo:false},{name:'Two',images:['/other.jpg'],demo:true}];
  assert.deepEqual(companyProjectGalleries({projectIndices:[]},projects),[]);
  const cards=companyProjectGalleries({projectIndices:[0,0,99,-1,1.5]},projects);
  assert.equal(cards.length,1); assert.equal(cards[0].title,'One');
  assert.deepEqual(cards[0].images,projects[0].images); assert.equal(cards[0].cover,'/one.jpg');
  assert.equal(cards[0].illustrative,false);
  assert.equal(companyProjectGalleries({projectIndices:[0]},[{...projects[0],thumbnails:['/small.webp']}])[0].cover,'/small.webp');
  cards[0].images.push('/four.jpg'); assert.equal(projects[0].images.length,3);
  assert.deepEqual(companyProjectGalleries({projectIndices:[0]},[{name:'No media',images:[]}]),[]);
});

test('single-project companies fill two slots with their own photos and retain gallery targets', async () => {
  const { companyPreviewImages } = await import('./company-gallery.js');
  const projects=[{name:'One',images:['/a','/b','/c'],thumbnails:['/ta','/tb','/tc']}];
  const previews=companyPreviewImages({projectIndices:[0]},projects);
  assert.deepEqual(previews.map(p=>p.cover),['/ta','/tb','/tc']);
  assert.ok(previews.every(p=>p.index===0));
  assert.equal(companyPreviewImages({projectIndices:[0]},[{name:'One photo',images:['/a']}]).length,2);
  assert.deepEqual(companyPreviewImages({projectIndices:[]},projects),[]);
});
