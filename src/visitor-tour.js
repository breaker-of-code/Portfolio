// Car taps and the untouched-page tour share the same endpoint direction logic.
export function createBounceNavigator({ getIndex, getLength, isBusy, go }) {
  let direction = 1;
  return {
    reset() { direction = 1; },
    step() {
      if (isBusy() || getLength() < 2) return false;
      const index = getIndex();
      if (index >= getLength() - 1) direction = -1;
      else if (index <= 0) direction = 1;
      return go(index + direction);
    },
  };
}

// First interaction stops the tour for this page opening, rather than restarting
// it after later idle periods. Background/portrait time does not count down.
export function createIdleTour({ advance, canAdvance, delay = 30000, schedule = setTimeout, cancel = clearTimeout }) {
  let timer, started = false, interacted = false, paused = false, disposed = false;
  const clear = () => { if (timer !== undefined) cancel(timer); timer = undefined; };
  const arm = () => {
    clear();
    if (!started || interacted || paused || disposed) return;
    timer = schedule(() => {
      timer = undefined;
      if (canAdvance()) advance();
      arm();
    }, delay);
  };
  return {
    get interacted() { return interacted; },
    start() { if (started) return; started = true; arm(); },
    interact() { interacted = true; clear(); },
    setPaused(value) { if (paused === Boolean(value)) return; paused = Boolean(value); arm(); },
    dispose() { disposed = true; clear(); },
  };
}
