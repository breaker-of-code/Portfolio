// Opt-in local diagnostics; never sends data anywhere or adds UI to the site.
export function createPerformanceProbe(renderer, canvas) {
  const params = new URLSearchParams(location.search);
  if (!params.has('benchmark')) return null;
  let started, previous, firstFrameFinished, reported = false;
  const intervals = [], renderTimes = [], calls = [], triangles = [];
  return {
    frame(now, renderTime, metadata = {}) {
      if (reported || document.hidden) { previous = undefined; return; }
      started ??= now;
      firstFrameFinished ??= performance.now();
      const elapsed = now - started;
      if (elapsed > 2000 && previous !== undefined) {
        intervals.push(now - previous); renderTimes.push(renderTime);
        calls.push(renderer.info.render.calls); triangles.push(renderer.info.render.triangles);
      }
      previous = now;
      if (elapsed < 10000 || intervals.length < 30) return;
      reported = true;
      const percentile = (values, p) => [...values].sort((a, b) => a - b)[Math.min(values.length - 1, Math.floor(values.length * p))];
      const sum = values => values.reduce((total, value) => total + value, 0);
      const resources = performance.getEntriesByType('resource');
      console.info('[coastal-performance]', JSON.stringify({
        label: params.get('benchmark') || 'sample', viewport: [innerWidth, innerHeight],
        drawingBuffer: [canvas.width, canvas.height], pixelRatio: renderer.getPixelRatio(),
        fps: +(intervals.length * 1000 / sum(intervals)).toFixed(1),
        frameP50Ms: +percentile(intervals, .5).toFixed(2), frameP95Ms: +percentile(intervals, .95).toFixed(2),
        renderCpuP95Ms: +percentile(renderTimes, .95).toFixed(2),
        drawCallsMedian: percentile(calls, .5), trianglesMedian: percentile(triangles, .5),
        geometries: renderer.info.memory.geometries, textures: renderer.info.memory.textures,
        jsHeapMB: performance.memory ? +(performance.memory.usedJSHeapSize / 1048576).toFixed(1) : null,
        transferredKB: +(sum(resources.map(resource => resource.transferSize || 0)) / 1024).toFixed(1),
        firstFrameMs: +firstFrameFinished.toFixed(1), sampleDurationMs: +sum(intervals).toFixed(1), samples: intervals.length,
        sectionScripts: resources.filter(resource => /\/(career-building|project-icons)-/.test(resource.name)).map(resource => resource.name.split('/').at(-1)),
        ...metadata,
      }));
    },
  };
}
