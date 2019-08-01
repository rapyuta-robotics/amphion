import Core from '../core';
import { DEFAULT_OPTIONS_MARKERARRAY, MESSAGE_TYPE_MARKERARRAY } from '../utils/constants';
import Group from '../primitives/Group';
import MarkerManager from '../utils/markerManager';

class MarkerArray extends Core {
  constructor(ros, topicName, options = DEFAULT_OPTIONS_MARKERARRAY) {
    super(ros, topicName, MESSAGE_TYPE_MARKERARRAY, options);

    this.object = new Group();
    this.onChange = this.onChange.bind(this);

    const { queueSize } = options;
    this.markerManager = new MarkerManager(this.object, this.onChange);
    this.queueSize = queueSize;
    this.updateOptions({
      ...DEFAULT_OPTIONS_MARKERARRAY,
      ...options,
    });
  }

  updateOptions(options) {
    super.updateOptions(options);
    this.markerManager.updateOptions(this.options, this);
  }

  onChange() {
    if (this.callback) {
      this.callback();
    }
  }

  onNamespaceChange(callback) {
    this.callback = callback;
  }

  update(message) {
    super.update(message);
    if (message.markers.length > 0) {
      message.markers.forEach((marker) => {
        this.markerManager.updateMarker(marker);
      });
    }
  }

  reset() {
    this.markerManager.reset();
  }
}

export default MarkerArray;
