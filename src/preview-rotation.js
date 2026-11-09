export function previewPair(items, start = 0) {
  return items.slice(0, Math.min(2, items.length)).map((_, offset) => items[(start + offset) % items.length]);
}

// Keep one bounded timer per rendered dock; never queue hidden or overlapping work.
export function createPreviewRotation({ items, prepare, show, canRotate = () => true, setTimer = setInterval, clearTimer = clearInterval }) {
  const controller = new AbortController();
  let start = 0, busy = false;
  const timer = items.length > 2 ? setTimer(async () => {
    if (busy || controller.signal.aborted || !canRotate()) return;
    busy = true;
    const next = (start + 2) % items.length, pair = previewPair(items, next);
    try {
      await prepare(pair);
      if (controller.signal.aborted || !canRotate()) return;
      start = next;
      await show(pair, controller.signal);
    } catch {
      // Skip failed thumbnails; keep the previous clickable pair intact.
      if (!controller.signal.aborted) start = next;
    } finally { busy = false; }
  }, 4000) : null;
  return { dispose() { controller.abort(); if (timer !== null) clearTimer(timer); } };
}

export function applyPreviewItem(slot, item) {
  slot.setAttribute(item.action, String(item.index));
  slot.setAttribute('aria-label', item.label);
  const image = slot.querySelector('img'); image.src = item.src; image.alt = item.alt;
  const title = slot.querySelector('[data-preview-title]'); if (title) title.textContent = item.title;
}

export async function fadePreviewPair(slots, pair, signal, reducedMotion = false) {
  if (signal.aborted) return;
  if (reducedMotion) { pair.forEach((item, i) => applyPreviewItem(slots[i], item)); return; }
  const animations = new Set();
  const cancel = () => { animations.forEach(animation => animation.cancel()); animations.clear(); };
  const fade = async (from, to) => {
    const active = slots.map(slot => slot.animate([{ opacity: from }, { opacity: to }], { duration: 220, easing: 'ease-in-out', fill: 'forwards' }));
    active.forEach(animation => animations.add(animation));
    await Promise.all(active.map(animation => animation.finished));
  };
  signal.addEventListener('abort', cancel, { once: true });
  try {
    await fade(1, 0);
    if (signal.aborted) return;
    pair.forEach((item, i) => applyPreviewItem(slots[i], item));
    cancel();
    await fade(0, 1);
  } finally { cancel(); signal.removeEventListener('abort', cancel); }
}
