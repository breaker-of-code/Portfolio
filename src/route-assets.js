const defaultLoaders = {
  career: () => import('./career-building.js').then(module => (builder, type, variant, company) => module.createCareerBuilding(builder, variant, company)),
  projects: () => import('./project-icons.js').then(module => module.createProjectIcon),
};

export function createRouteAssetLoader(loaders = defaultLoaders) {
  const loaded = new Map([['hub', null]]), pending = new Map();
  return {
    has: route => loaded.has(route),
    prepare(route) {
      if (loaded.has(route)) return Promise.resolve();
      if (!loaders[route]) return Promise.reject(new Error(`Unknown island: ${route}`));
      if (!pending.has(route)) {
        const request = Promise.resolve().then(loaders[route]).then(factory => { loaded.set(route, factory); })
          .finally(() => pending.delete(route));
        pending.set(route, request);
      }
      return pending.get(route);
    },
    create(route, ...args) {
      const factory = loaded.get(route);
      if (!factory) throw new Error(`Island assets are not ready: ${route}`);
      return factory(...args);
    },
  };
}
