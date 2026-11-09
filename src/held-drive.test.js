import test from 'node:test';
import assert from 'node:assert/strict';
import { createHeldDrive } from './held-drive.js';
test('held inputs advance on arrival without repeats and stop on release or lost focus', () => {
  const calls=[],pending=[]; let allowed=true;
  const hold=createHeldDrive({step:d=>calls.push(d),canMove:()=>allowed,schedule:f=>pending.push(f)});
  hold.press('right',1);hold.press('right',1);assert.deepEqual(calls,[1]);
  hold.arrive();pending.shift()();assert.deepEqual(calls,[1,1]);
  hold.press('touch',-1);hold.arrive();pending.shift()();assert.deepEqual(calls,[1,1,-1,-1]);
  hold.release('touch');hold.arrive();hold.release('right');pending.shift()();assert.equal(calls.length,4);
  hold.press('left',-1);hold.clear();hold.arrive();pending.shift()();assert.equal(calls.length,5);
  allowed=false;hold.press('right',1);hold.arrive();pending.shift()();assert.equal(calls.length,5);
});
