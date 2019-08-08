import * as THREE from 'three';

import Core from '../core';
import {
  DEFAULT_OPTIONS_POSEARRAY,
  MESSAGE_TYPE_POSEARRAY,
} from '../utils/constants';
import Pose from './Pose';
import * as TransformUtils from '../utils/transform';
import { setObjectDimension } from '../utils/helpers';

class PoseArray extends Core {
  constructor(ros, topicName, options = DEFAULT_OPTIONS_POSEARRAY) {
    super(ros, topicName, MESSAGE_TYPE_POSEARRAY, options);
    this.object = new THREE.Group();
    this.updateOptions({
      ...DEFAULT_OPTIONS_POSEARRAY,
      ...options,
    });
  }

  update(message) {
    super.update(message);
    this.object.children.forEach(obj => {
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
