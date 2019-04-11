import _ from 'lodash';

const { THREE } = window;

import Core from '../core';
import { MESSAGE_TYPE_POSESTAMPED, OBJECT_TYPE_ARROW, OBJECT_TYPE_AXES, OBJECT_TYPE_FLAT_ARROW } from '../utils/constants';
import Arrow from '../primitives/Arrow';
import Axes from '../primitives/Axes';
import LineArrow from '../primitives/LineArrow';

export const POSE_VIZ_TYPES = {
  arrow: OBJECT_TYPE_ARROW,
  axes: OBJECT_TYPE_AXES,
  flatArrow: OBJECT_TYPE_FLAT_ARROW,
};

class Pose extends Core {
  constructor(ros, topicName) {
    super(ros, topicName, MESSAGE_TYPE_POSESTAMPED);

    this.object = new THREE.Group();
    this.setVizType(POSE_VIZ_TYPES.arrow);
  }

  static getNewPrimitive(type) {
    let newObject = null;
    switch (type) {
      case POSE_VIZ_TYPES.arrow:
        newObject = new Arrow();
        newObject.setScale({ x: 1, y: 1, z: 1 });
        break;
      case POSE_VIZ_TYPES.axes:
        newObject = new Axes();
        break;
      case POSE_VIZ_TYPES.flatArrow:
        newObject = new LineArrow();
        break;
    }
    return newObject;
  }

  setVizType(type) {
    const newObject = Pose.getNewPrimitive(type);
    _.each(this.object.children, (child) => {
      child.parent.remove(child);
    });
    this.object.add(newObject);
    Object.setPrototypeOf(this.object, Object.getPrototypeOf(newObject));
  }

  update(message) {
    const { pose: { position, orientation } } = message;
    this.object.setTransform({
      translation: position,
      rotation: orientation
    });
  }
}

export default Pose;
