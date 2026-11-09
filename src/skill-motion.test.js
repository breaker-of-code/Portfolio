import test from 'node:test';
import assert from 'node:assert/strict';
import { stepBadges } from './skill-motion.js';
test('badges bounce at walls and exchange approaching collision velocities', () => {
  const wall=[{x:11,y:30,vx:-40,vy:0}];stepBadges(wall,120,80,10,.1);
  assert.equal(wall[0].x,10);assert.equal(wall[0].vx,40);
  const pair=[{x:40,y:30,vx:30,vy:0},{x:59,y:30,vx:-30,vy:0}];stepBadges(pair,120,80,10,0);
  assert.equal(pair[0].vx,-30);assert.equal(pair[1].vx,30);
  assert.equal(pair[1].x-pair[0].x,20);
});
