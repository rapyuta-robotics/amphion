export default class MarkerLifetime {
  private readonly timeouts: { [p: string]: number } = {};
  private readonly onTimeout: (id: string) => void;

  constructor(onTimeout: (id: string) => void) {
    this.timeouts = {};
    this.onTimeout = onTimeout;
  }

  track(id: string, timeoutSecs: number) {
    clearInterval(this.timeouts[id]);
    if (timeoutSecs === 0) {
      return;
    }
    this.timeouts[id] = window.setTimeout(() => {
      this.onTimeout(id);
    }, timeoutSecs * 1000);
  }

  untrack(id: string) {
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
