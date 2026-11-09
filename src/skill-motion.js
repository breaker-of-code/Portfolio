export function stepBadges(items, width, height, radius, dt) {
  for (const p of items) {
    p.x += p.vx * dt; p.y += p.vy * dt;
    if (p.x < radius || p.x > width - radius) p.vx = p.x < radius ? Math.abs(p.vx) : -Math.abs(p.vx);
    if (p.y < radius || p.y > height - radius) p.vy = p.y < radius ? Math.abs(p.vy) : -Math.abs(p.vy);
    p.x = Math.max(radius, Math.min(width - radius, p.x));
    p.y = Math.max(radius, Math.min(height - radius, p.y));
  }
  for (let i = 0; i < items.length; i++) for (let j = i + 1; j < items.length; j++) {
    const a = items[i], b = items[j], dx = b.x - a.x, dy = b.y - a.y;
    const distance = Math.hypot(dx, dy);
    if (distance >= radius * 2) continue;
    const nx = distance ? dx / distance : 1, ny = distance ? dy / distance : 0;
    const overlap = (radius * 2 - distance) / 2;
    a.x -= nx * overlap; a.y -= ny * overlap; b.x += nx * overlap; b.y += ny * overlap;
    const approach = (a.vx - b.vx) * nx + (a.vy - b.vy) * ny;
    if (approach > 0) { a.vx -= approach * nx; a.vy -= approach * ny; b.vx += approach * nx; b.vy += approach * ny; }
  }
  for (const p of items) { p.x = Math.max(radius, Math.min(width-radius,p.x)); p.y = Math.max(radius,Math.min(height-radius,p.y)); }
}

export function createBadgeMotion(root) {
  const nodes = [...root.querySelectorAll('.tech-badge')];
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  let width = 0, height = 0, radius = 16, items = [], last = 0, frame;
  const resize = () => {
    if (!root.clientWidth || !root.clientHeight) return;
    const oldWidth = width, oldHeight = height;
    width = root.clientWidth; height = root.clientHeight;
    radius = Math.min(24, width / 7.2, height / 6.5);
    items = nodes.map((node, i) => {
      node.style.width = node.style.height = `${radius * 2}px`;
      const prior = items[i];
      return prior ? {...prior, x:prior.x * width / oldWidth, y:prior.y * height / oldHeight} : {
        x:width * ([.18,.5,.82,.26,.74,.3,.7][i]), y:height * (i < 3 ? .18 : i < 5 ? .5 : .82),
        vx:[37,-31,28,-35,32,34,-29][i], vy:[26,34,-29,-25,31,-33,27][i],
      };
    });
  };
  const draw = now => {
    const dt = last ? Math.min((now-last)/1000,.035) : 0; last=now;
    if (!document.hidden && !root.closest('[hidden]') && width && height) {
      if (!reduced.matches) stepBadges(items,width,height,radius,dt);
      nodes.forEach((node,i) => { node.style.transform=`translate(${items[i].x-radius}px,${items[i].y-radius}px)`; });
    }
    frame=requestAnimationFrame(draw);
  };
  const observer = new ResizeObserver(resize); observer.observe(root); resize(); frame=requestAnimationFrame(draw);
  return { dispose() { cancelAnimationFrame(frame); observer.disconnect(); } };
}
