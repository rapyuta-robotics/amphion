import Core from '../core';
import { MESSAGE_TYPE_MARKER } from '../utils/constants';
import Group from '../primitives/Group';
import MarkerManager from './MarkerManager';

class Marker extends Core {
  constructor(ros, topicName, options = {}) {
    super(ros, topicName, MESSAGE_TYPE_MARKER, options);

    this.object = new Group();
    this.onChange = this.onChange.bind(this);

    const { queueSize } = options;
    this.markerManager = new MarkerManager(this.object, this.onChange);
    this.queueSize = queueSize;
  }

  updateOptions(options) {
    this.markerManager.updateOptions(options, this);
  }

  update(message) {
    super.update(message);
    this.markerManager.updateMarker(message);
  }

  onChange() {
    if (this.callback) {
      this.callback();
    }
  }

  onNamespaceChange(callback) {
    this.callback = callback;
  }

  reset() {
    this.markerManager.reset();
  }
}

export default Marker;
