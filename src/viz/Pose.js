import _ from 'lodash';

import Core from '../core';
import { MESSAGE_TYPE_POSESTAMPED, OBJECT_TYPE_ARROW, OBJECT_TYPE_AXES } from '../utils/constants';
import Arrow from '../core/Arrow';
import Axes from '../core/Axes';

const POSE_VIZ_TYPES = {
  arrow: OBJECT_TYPE_ARROW,
  axes: OBJECT_TYPE_AXES,
};

class Pose extends Core {
  constructor(ros, topicName) {
    super(ros, topicName, MESSAGE_TYPE_POSESTAMPED);

    this.object = new THREE.Group();
    this.setVizType(POSE_VIZ_TYPES.arrow);
  }

  setVizType(type) {
    let newObject = null;
    switch (type) {
      case POSE_VIZ_TYPES.arrow:
        newObject = new Arrow();
        break;
      case POSE_VIZ_TYPES.axes:
        newObject = new Axes();
        break;
    }
    _.each(this.object.children, (child) => {
      child.parent.remove(child);
    });
    _.each(newObject.children, (child) => {
      this.object.add(child);
    });
    Object.setPrototypeOf(this.object, newObject);
  }

  update(message) {
    this.object.setTransform(message);
  }
}

export default Pose;
