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
