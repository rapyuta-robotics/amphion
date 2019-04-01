import _ from 'lodash';
import Core from '../core';
import { MESSAGE_TYPE_ODOMETRY } from '../utils/constants';
import Arrow from '../primitives/Arrow';
import * as TransformUtils from '../utils/transform';

class DisplayOdometry extends Core {
  constructor(ros, topicName, controlledObject) {
    super(ros, topicName, MESSAGE_TYPE_ODOMETRY);

    this.object = null;
    this.setVizType(controlledObject);
  }

  setVizType(controlledObject) {
    if (!_.isNil(controlledObject)) {
      this.object = controlledObject;
    } else {
      this.object = new Arrow();
      this.object.setScale({ x: 1, y: 1, z: 1 });
    }
  }

  update(message) {
    const { pose: { pose: { position, orientation } } } = message;
    const transform = {
      translation: position,
      rotation: orientation
    };
    if (!_.isNil(this.object.setTransform)) {
      this.object.setTransform(transform);
    } else {
      TransformUtils.setTransform(this.object, transform);
    }
  }
}

export default DisplayOdometry;
