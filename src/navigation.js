export const HUB_STOPS = ['intro', 'career', 'projects', 'skills', 'contact'];

export function createNavigation(lengths = { hub: 5, projects: 8, career: 4 }) {
  let state = { route: 'hub', index: 0, hubIndex: 0 };
  const listeners = new Set();
  const notify = () => { for (const fn of listeners) fn({ ...state }); return { ...state }; };
  return {
    get state() { return { ...state }; },
    subscribe(fn) { listeners.add(fn); return () => listeners.delete(fn); },
    go(index) {
      if (!Number.isFinite(index)) return { ...state };
      state.index = Math.max(0, Math.min(lengths[state.route] - 1, Math.trunc(index)));
      if (state.route === 'hub') state.hubIndex = state.index;
      return notify();
    },
    move(delta) { return this.go(state.index + delta); },
    enter() {
      if (state.route !== 'hub') return { ...state };
      const destination = HUB_STOPS[state.index];
      if (destination === 'projects' || destination === 'career') {
        state = { route: destination, index: 0, hubIndex: state.index };
        return notify();
      }
      return { ...state };
    },
    home() {
      state = { route: 'hub', index: state.hubIndex, hubIndex: state.hubIndex };
      return notify();
    },
    open(route) {
      if (route === 'hub') return this.home();
      if (!(route in lengths)) return { ...state };
      state = { route, index: 0, hubIndex: HUB_STOPS.indexOf(route) };
      return notify();
    },
  };
}
