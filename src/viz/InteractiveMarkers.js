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
    // need a better way to handle interdependent topics
    const shouldSubscriptionChange =
      this.options.updateTopicName !== options.topicName && this.init;
    const guardAgainstOtherOptionsChange =
      this.topicName === this.options.updateTopicName;

    if (shouldSubscriptionChange && options.updateTopicName !== undefined) {
      const { messageType, name } = options.updateTopicName;
      this.changeTopic(name, messageType, true, true);
    } else if (shouldSubscriptionChange && guardAgainstOtherOptionsChange) {
      this.unsubscribe();
    }

    super.updateOptions(options);
    this.interactiveMarkerManager.updateOptions(this.options, this);
  }

  update(message) {
    super.update(message);
    if (message.markers.length > 0) {
      message.markers.forEach(interactiveMarker => {
        this.interactiveMarkerManager.initMarkers(interactiveMarker);
      });
      if (!this.init) {
        this.init = true;
        if (this.options.updateTopicName !== undefined) {
          const { messageType, name } = this.options.updateTopicName;
          this.changeTopic(name, messageType, true, true);
        } else {
          this.unsubscribe();
        }
      }
    }

    // for InteractiveMarkerPose sub-message
    if (message.poses && message.poses.length > 0) {
      message.poses.forEach(pose => {
        this.interactiveMarkerManager.updatePose(pose);
      });
    }
  }

  reset() {
    this.interactiveMarkerManager.reset(false);
  }
}

export default InteractiveMarkers;
