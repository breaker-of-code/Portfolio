import test from 'node:test';
import assert from 'node:assert/strict';
import { createNavigation } from './navigation.js';

test('a long project route clamps movement and returns to the originating hub stop', () => {
  const nav = createNavigation();
  nav.go(2); nav.enter();
  assert.equal(nav.state.route, 'projects');
  nav.go(99); assert.equal(nav.state.index, 7);
  nav.move(1); assert.equal(nav.state.index, 7);
  nav.home(); assert.deepEqual(nav.state, { route: 'hub', index: 2, hubIndex: 2 });
});
test('career and project lengths stay independent, and invalid jumps do not poison state', () => {
  const nav = createNavigation({ hub: 5, career: 2, projects: 12 });
  nav.go(1); nav.enter(); nav.go(10);
  assert.equal(nav.state.index, 1);
  nav.go(NaN); assert.equal(nav.state.index, 1);
  nav.open('projects'); nav.go(10); assert.equal(nav.state.index, 10);
  nav.home(); assert.equal(nav.state.index, 2);
  nav.go(-2); assert.equal(nav.state.index, 0);
});

test('refresh restores each route and stop and returns to its correct Home gateway', () => {
  const lengths={hub:5,career:7,projects:11};
  for(const route of ['career','projects']) {
    const before=createNavigation(lengths);before.open(route);before.go(5);
    const after=createNavigation(lengths,JSON.parse(JSON.stringify(before.state)));
    assert.deepEqual(after.state,before.state);
    after.home();assert.equal(after.state.index,route==='career'?1:2);
  }
  assert.deepEqual(createNavigation(lengths,{route:'hub',index:4}).state,{route:'hub',index:4,hubIndex:4});
  assert.equal(createNavigation(lengths,{route:'projects',index:99}).state.index,10);
  assert.equal(createNavigation(lengths,{route:'career',index:-3}).state.index,0);
  for(const saved of [null,{}, {route:'unknown',index:2},{route:'career',index:'5'},{route:'__proto__',index:0},{route:{toString:null},index:1}])
    assert.deepEqual(createNavigation(lengths,saved).state,{route:'hub',index:0,hubIndex:0});
});
