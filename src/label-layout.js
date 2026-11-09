// Draw glyphs at a fixed size/tracking; grow the plaque instead of condensing text.
export const LABEL_TYPE = { font: '700 118px system-ui, sans-serif', tracking: 2, pixelsPerUnit: 256 };

export function trackedWidth(ctx, text, tracking = LABEL_TYPE.tracking) {
  const glyphs = Array.from(text);
  return glyphs.reduce((sum, glyph) => sum + ctx.measureText(glyph).width, 0)
    + Math.max(0, glyphs.length - 1) * tracking;
}

export function plaqueLayout(textWidth, minWidth = 5) {
  const ppu = LABEL_TYPE.pixelsPerUnit;
  const edge = .12, badgeWidth = .78, gap = .18, end = .2;
  const pixelWidth = Math.ceil(Math.max(minWidth, edge + badgeWidth + gap + textWidth / ppu + end) * ppu);
  const width = pixelWidth / ppu;
  const textStart = (edge + badgeWidth + gap) * ppu;
  return { width, pixelWidth, badgeX: -width / 2 + edge + badgeWidth / 2,
    numberX: (edge + badgeWidth / 2) * ppu,
    textX: textStart + (pixelWidth - end * ppu - textStart - textWidth) / 2 };
}

export function drawTrackedText(ctx, text, x, y, tracking = LABEL_TYPE.tracking) {
  ctx.textAlign = 'left';
  for (const glyph of Array.from(text)) {
    ctx.fillText(glyph, x, y);
    x += ctx.measureText(glyph).width + tracking;
  }
}
