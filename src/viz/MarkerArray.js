import Core from '../core';
import { MESSAGE_TYPE_MARKERARRAY } from '../utils/constants';
import Group from '../primitives/Group';
import MarkerManager from './MarkerManager';

class MarkerArray extends Core {
  constructor(ros, topicName, options) {
    super(ros, topicName, MESSAGE_TYPE_MARKERARRAY, options);

    this.object = new Group();
    this.onChange = this.onChange.bind(this);

    const { queueSize } = options;
    this.markerManager = new MarkerManager(this.object, this.onChange);
    this.queueSize = queueSize;
  }

  updateOptions(options) {
    this.markerManager.updateOptions(options, this);
  }

  onChange() {
    if (this.callback) {
      this.callback();
    }
  }

  setCallback(callback) {
    this.callback = callback;
  }

  update(message) {
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
