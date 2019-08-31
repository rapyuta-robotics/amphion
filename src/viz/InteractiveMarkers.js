import Core from '../core';
import {
  DEFAULT_OPTIONS_INTERACTIVE_MARKER,
  MESSAGE_TYPE_INTERACTIVEMARKER,
} from '../utils/constants';
import Group from '../primitives/Group';
import InteractiveMarkerManager from '../utils/interactiveMarkerManager';

class InteractiveMarkers extends Core {
  constructor(ros, topicName, options = DEFAULT_OPTIONS_INTERACTIVE_MARKER) {
    super(ros, topicName, MESSAGE_TYPE_INTERACTIVEMARKER, {
      ...DEFAULT_OPTIONS_INTERACTIVE_MARKER,
      ...options,
    });

    this.object = new Group();

    const { queueSize } = options;
    this.interactiveMarkerManager = new InteractiveMarkerManager(this.object);
    this.queueSize = queueSize;
    this.updateOptions({
      ...DEFAULT_OPTIONS_INTERACTIVE_MARKER,
      ...options,
    });
  }

  updateOptions(options) {
    super.updateOptions(options);
    this.interactiveMarkerManager.updateOptions(this.options, this);
  }

  update(message) {
    super.update(message);
    if (message.markers.length > 0) {
      message.markers.forEach(interactiveMarker => {
        this.interactiveMarkerManager.updateMarker(interactiveMarker);
      });
    }
  }

  reset() {
    this.interactiveMarkerManager.reset();
  }
}

export default InteractiveMarkers;
