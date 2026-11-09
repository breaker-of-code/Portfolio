import test from 'node:test';
import assert from 'node:assert/strict';
import { trackedWidth, plaqueLayout, drawTrackedText, LABEL_TYPE } from './label-layout.js';

test('short labels retain a minimum plaque while long company names grow without text squeezing', () => {
  const ctx = { measureText: text => ({ width: text.length * 70 }) };
  for (const minWidth of [3.85, 4.5, 5]) {
    assert.equal(plaqueLayout(trackedWidth(ctx, 'Intro'), minWidth).width, Math.ceil(minWidth * 256) / 256);
    const textWidth = trackedWidth(ctx, 'No Borders Innovations');
    const long = plaqueLayout(textWidth, minWidth);
    assert.ok(long.width > minWidth);
    assert.ok(long.textX >= (0.12 + .78 + .18) * 256);
    assert.ok(long.textX + textWidth <= long.pixelWidth - .2 * 256 + 1e-9);
    assert.ok(Math.abs(long.badgeX + long.width / 2 - .51) < 1e-9);
  }
});

test('glyphs use identical spacing and no maximum-width argument on every label', () => {
  const calls=[];
  const ctx={measureText:()=>({width:70}),fillText:(...args)=>calls.push(args)};
  const text='Infinity Up';
  drawTrackedText(ctx,text,10,109);
  assert.equal(calls.length,text.length);
  assert.ok(calls.every(args=>args.length===3));
  assert.ok(calls.every((args,i)=>args[1]===10+i*(70+LABEL_TYPE.tracking)));
  assert.equal(trackedWidth(ctx,text),70*text.length+2*(text.length-1));
});
