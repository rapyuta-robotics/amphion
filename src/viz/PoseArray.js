import * as THREE from 'three';

import Core from '../core';
import { MESSAGE_TYPE_POSEARRAY } from '../utils/constants';
import Pose, { POSE_VIZ_TYPES } from './Pose';
import * as TransformUtils from '../utils/transform';

class PoseArray extends Core {
  constructor(ros, topicName) {
    super(ros, topicName, MESSAGE_TYPE_POSEARRAY);
    this.object = new THREE.Group();
  }

  update(message) {
    for (let i = this.object.children.length - 1; i >= message.poses.length; i -= 1) {
      const child = this.object.children[i];
      child.parent.remove(child);
    }

    for (let i = this.object.children.length; i < message.poses.length; i++) {
      this.object.add(Pose.getNewPrimitive(POSE_VIZ_TYPES.arrow));
    }

    for (let i = 0; i < message.poses.length; i++) {
      TransformUtils.setTransform(this.object.children[i], {
        translation: message.poses[i].position,
        rotation: message.poses[i].orientation,
      });
    }
  }
}

export default PoseArray;
