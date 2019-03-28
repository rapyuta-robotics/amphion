import _ from 'lodash';
import Core from '../core';
import { MESSAGE_TYPE_ODOMETRY } from '../utils/constants';
import Arrow from '../primitives/Arrow';
import Group from '../primitives/Group';

class DisplayOdometry extends Core {
  constructor(ros, topicName, controlledObject) {
    super(ros, topicName, MESSAGE_TYPE_ODOMETRY);

    this.object = new Group();
    this.setVizType(controlledObject);
  }

  setVizType(controlledObject) {
    let newObject = null;
    if (!_.isNil(controlledObject)) {
      newObject = controlledObject;
    } else {
      newObject = new Arrow();
      newObject.setScale({ x: 1, y: 1, z: 1 });
    }
    this.object.add(newObject);
  }

  update(message) {
    const { pose: { pose } } = message;
    this.object.setTransform({
      translation: pose.position,
      rotation: pose.orientation
    });
  }
}

export default DisplayOdometry;
