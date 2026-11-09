import test from 'node:test';
import assert from 'node:assert/strict';
import { projectMedia, nextGalleryImage, releaseGalleryVideo } from './project-media.js';

test('gallery separates small previews from originals and never preloads a video', () => {
  const project = {name:'Arthur VR',images:['/one.webp','/two.webp'],thumbnails:['/one-thumb.webp','/two-thumb.webp'],videos:[{src:'/clip.mp4',poster:'/poster.webp',title:'Whiteboard'}]};
  const items=projectMedia(project);
  assert.equal(items.length,3); assert.equal(items[0].thumb,'/one-thumb.webp');
  assert.equal(items[2].type,'video'); assert.equal(items[2].thumb,'/poster.webp');
  assert.equal(nextGalleryImage(items,0),'/two.webp');
  assert.equal(nextGalleryImage(items,1),null);
  assert.equal(nextGalleryImage(items,2),'/one.webp');
  assert.equal(nextGalleryImage([items[0]],0),null);
  assert.equal(project.videos[0].type,undefined);
});

test('closing or changing gallery media releases video playback and its source', () => {
  const calls=[];
  releaseGalleryVideo({pause:()=>calls.push('pause'),removeAttribute:a=>calls.push(a),load:()=>calls.push('load')});
  assert.deepEqual(calls,['pause','src','poster','load']);
});
