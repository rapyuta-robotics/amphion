import Core from '../core';
import {
  DEFAULT_OPTIONS_MARKER,
  MESSAGE_TYPE_MARKER,
} from '../utils/constants';
import Group from '../primitives/Group';
import MarkerManager from '../utils/markerManager';

class Marker extends Core {
  constructor(ros, topicName, camera, options = DEFAULT_OPTIONS_MARKER) {
    super(ros, topicName, MESSAGE_TYPE_MARKER, {
      ...DEFAULT_OPTIONS_MARKER,
      ...options,
    });

    this.object = new Group();
    this.onChange = this.onChange.bind(this);

    const { queueSize } = options;
    this.markerManager = new MarkerManager(this.object, this.onChange, camera);
    this.queueSize = queueSize;
    this.updateOptions({
      ...DEFAULT_OPTIONS_MARKER,
      ...options,
    });
  }

  updateOptions(options) {
    super.updateOptions(options);
    this.markerManager.updateOptions(this.options, this);
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
