export default class MarkerLifetime {
  constructor(onTimeout) {
    this.timeouts = {};
    this.onTimeout = onTimeout;
  }

  track(id, timeoutSecs) {
    clearInterval(this.timeouts[id]);
    this.timeouts[id] = setTimeout(() => {
      this.onTimeout(id);
    }, timeoutSecs * 1000);
  }

  untrack(id) {
    clearInterval(this.timeouts[id]);
    delete this.timeouts[id];
  }

  destroy() {
    const ids = Object.keys(this.timeouts);
    for (const id of ids) {
      clearInterval(this.timeouts[id]);
      delete this.timeouts[id];
    }
  }
}
