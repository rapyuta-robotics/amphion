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
    super(ros, topicName, MESSAGE_TYPE_POSEARRAY, {
      ...DEFAULT_OPTIONS_POSEARRAY,
      ...options,
    });
    this.object = new THREE.Group();
    this.updateOptions({
      ...DEFAULT_OPTIONS_POSEARRAY,
      ...options,
    });
    this.prevMessage = null;
  }

  update(message) {
    super.update(message);

    // let prevPoses =  this.object.children.reduce((acc, child,index) => {
    //   const vertex = child.children[1].geometry.vertices[0]
    //   const orientation = {
    //     x: child.quaternion.x,
    //     y:child.quaternion.y,
    //     z: child.quaternion.z,
    //     w:child.quaternion.w
    //   }
    //   let key = `${vertex.x}${vertex.y}${vertex.z}${orientation.x}${orientation.y}${orientation.z}${orientation.w}`
    //   return {
    //     ...acc,
    //     [key]: index
    //   }
    // }, {})

    if (this.object.children.length === 0) {
      for (let i = 0; i < message.poses.length; i++) {
        this.object.add(Pose.getNewPrimitive(this.options));
      }
    } else if (this.object.children.length > message.poses.length) {
      for (
        let i = this.object.children.length - 1;
        i >= message.poses.length;
        i--
      ) {
        this.object.remove(this.object.children[i]);
      }
    } else {
      for (let i = this.object.children.length; i < message.poses.length; i++) {
        this.object.add(Pose.getNewPrimitive(this.options));
      }
    }

    for (let i = 0; i < message.poses.length; i++) {
      TransformUtils.setTransform(this.object.children[i], {
        translation: message.poses[i].position,
        rotation: message.poses[i].orientation,
      });
    }
  }

  updateOptions(options) {
    super.updateOptions(options);
    // for (const key in this.objectMap) {
    //   // eslint-disable-next-line no-prototype-builtins
    //   if (this.objectMap.hasOwnProperty(key)) {
    //     const namespace = this.extractNameSpace(key);
    //     this.objectMap[key].visible = this.namespaces[namespace];
    //   }
    // }
    for (let i = 0; i < this.object.children.length; i++) {
      setObjectDimension(this.object.children[i], options);
    }
  }
}

export default PoseArray;
