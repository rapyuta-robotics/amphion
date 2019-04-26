import Core from '../core';
import { MESSAGE_TYPE_POSEARRAY } from '../utils/constants';
import Pose, { POSE_VIZ_TYPES } from './Pose';
import * as TransformUtils from '../utils/transform';

const { THREE } = window;

class PoseArray extends Core {
  constructor(ros, topicName, options) {
    super(ros, topicName, MESSAGE_TYPE_POSEARRAY);
    this.object = new THREE.Group();
    this.options = options || {};
  }

  updateShapeDimensions(object) {
    const { type } = this.options;

    switch (type) {
      case POSE_VIZ_TYPES.arrow: {
        const {
          alpha,
          shaftLength,
          shaftRadius,
          headLength,
          headRadius
        } = this.options;

        object.setHead({ radius: headRadius, length: headLength });
        object.setShaft({ radius: shaftRadius, length: shaftLength });
        object.setAlpha(alpha);
        break;
      }
      case POSE_VIZ_TYPES.axes: {
        const { axesLength, axesRadius } = this.options;

        object.setLength(axesLength);
        object.setRadius(axesRadius);
        break;
      }
      case POSE_VIZ_TYPES.flatArrow: {
        const { arrowLength } = this.options;

        object.setLength(arrowLength);
        break;
      }
    }
  }

  updateOptions(options) {
    const newOptions = { ...options };
    this.options = newOptions;
  }

  update(message) {
    const { type } = this.options;

    this.object.children.forEach((obj, index) => {
      obj.parent.remove(obj);
    });
    this.object.children = [];

    for (let i = 0; i < message.poses.length; i++) {
      this.object.add(Pose.getNewPrimitive(type));
    }

    for (let i = 0; i < message.poses.length; i++) {
      TransformUtils.setTransform(this.object.children[i], {
        translation: message.poses[i].position,
        rotation: message.poses[i].orientation,
      });
      this.updateShapeDimensions(this.object.children[i]);
    }
  }
}

export default PoseArray;
