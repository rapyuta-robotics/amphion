import * as THREE from 'three';

import Core from '../core';
import { MESSAGE_TYPE_POSEARRAY } from '../utils/constants';
import Pose  from './Pose';
import * as TransformUtils from '../utils/transform';
import { setObjectDimension } from '../utils/helpers';

class PoseArray extends Core {
  constructor(ros, topicName, options = {}) {
    super(ros, topicName, MESSAGE_TYPE_POSEARRAY);
    this.object = new THREE.Group();
    this.options = options;
  }

  updateOptions(options) {
    this.options = options;
  }

  update(message) {
    super.update(message);
    this.object.children.forEach((obj, index) => {
      obj.parent.remove(obj);
    });
    this.object.children = [];

    for (let i = 0; i < message.poses.length; i++) {
      this.object.add(Pose.getNewPrimitive(this.options));
    }

    for (let i = 0; i < message.poses.length; i++) {
      TransformUtils.setTransform(this.object.children[i], {
        translation: message.poses[i].position,
        rotation: message.poses[i].orientation,
      });
      setObjectDimension(this.object.children[i], this.options);
    }
  }
}

export default PoseArray;
