import * as THREE from 'three';

import Core from '../core';
import { MESSAGE_TYPE_POSESTAMPED, OBJECT_TYPE_ARROW, OBJECT_TYPE_AXES, OBJECT_TYPE_FLAT_ARROW } from '../utils/constants';
import Arrow from '../primitives/Arrow';
import Axes from '../primitives/Axes';
import LineArrow from '../primitives/LineArrow';
import { setObjectDimension } from '../utils/helpers';

export const POSE_VIZ_TYPES = {
  arrow: OBJECT_TYPE_ARROW,
  axes: OBJECT_TYPE_AXES,
  flatArrow: OBJECT_TYPE_FLAT_ARROW,
};

export const SHAFT_LENGTH = 1;
export const SHAFT_RADIUS = 0.05;

export const HEAD_LENGTH = 0.3;
export const HEAD_RADIUS = 0.1;

class Pose extends Core {
  constructor(ros, topicName, options = {}) {
    super(ros, topicName, MESSAGE_TYPE_POSESTAMPED);
    this.options = options;
    this.object = new THREE.Group();
    this.setVizType(POSE_VIZ_TYPES.arrow);
  }

  static getNewPrimitive(options) {
    const {
      type
    } = options;
    let newObject = null;

    switch (type) {
      case POSE_VIZ_TYPES.arrow:
        newObject = new Arrow();
        break;
      case POSE_VIZ_TYPES.axes:
        newObject = new Axes();
        break;
      case POSE_VIZ_TYPES.flatArrow:
        newObject = new LineArrow();
        break;
    }

    setObjectDimension(newObject, options);

    return newObject;
  }

  setVizType() {
    const newObject = Pose.getNewPrimitive(this.options);
    this.object.children.forEach((child) => {
      child.parent.remove(child);
    });
    this.object.add(newObject);
    Object.setPrototypeOf(this.object, Object.getPrototypeOf(newObject));
  }

  updateOptions(options) {
    this.options = options;

    const { type } = options;
    const currentObjType = this.object.children[0];

    if (type !== this.object.children[0]) {
      this.setVizType(type);
    }

    setObjectDimension(currentObjType, options);
  }

  update(message) {
    super.update(message);
    const { pose: { position, orientation } } = message;
    this.object.setTransform({
      translation: position,
      rotation: orientation
    });
  }
}

export default Pose;
