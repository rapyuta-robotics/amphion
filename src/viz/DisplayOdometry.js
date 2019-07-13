import * as THREE from 'three';

import Core from '../core';
import { MESSAGE_TYPE_ODOMETRY } from '../utils/constants';
import Arrow from '../primitives/Arrow';
import Group from '../primitives/Group';
import * as TransformUtils from '../utils/transform';
import { POSE_VIZ_TYPES } from './Pose';
import Axes from '../primitives/Axes';
import { checkToleranceThresholdExceed, setObjectDimension } from '../utils/helpers';

class DisplayOdometry extends Core {
  constructor(ros, topicName, options = {}) {
    super(ros, topicName, MESSAGE_TYPE_ODOMETRY);

    this.object = null;
    this.objectPool = [];
    this.keepSize = 100;
    this.currentObject = -1;
    this.options = options;
    this.setVizType(options.controlledObject);
  }

  setVizType(controlledObject) {
    if (controlledObject) {
      this.object = controlledObject;
    } else {
      this.object = new Group();
    }
  }

  setKeepSize(size) {
    let newKeepList = [];

    if (size === 0) {
      this.keepSize = 0;
      return;
    }

    if (size < this.keepSize && size < this.objectPool.length) {
      const removeCount = this.objectPool.length - size;
      for (let i = 0; i < removeCount; i++) {
        this.object.remove(this.objectPool[i]);
      }

      const slicedList = this.objectPool.slice(
        this.objectPool.length - size,
        this.objectPool.length
      );
      newKeepList = [...slicedList];
    } else {
      newKeepList = [...this.objectPool];
    }

    this.objectPool = newKeepList;
    this.keepSize = size;
    this.currentObject = this.objectPool.length - 1;
  }

  removeAllObjects() {
    this.objectPool.forEach((obj, index) => {
      obj.parent.remove(obj);
      delete this.objectPool[index];
    });
    this.objectPool = [];
  }

  checkToleranceThresholdExceed(newPose) {
    if (this.objectPool.length === 0) {
      return true;
    }

    const oldPose = {
      position: this.objectPool[this.currentObject].position,
      quaternion: this.objectPool[this.currentObject].quaternion,
    };


    return checkToleranceThresholdExceed(oldPose, newPose, this.options);
  }

  getObject() {
    const { type } = this.options;
    switch (type) {
      case POSE_VIZ_TYPES.arrow:
        return new Arrow();
      case POSE_VIZ_TYPES.axes:
        return new Axes();
    }

    return new THREE.Object3D();
  }

  changeObjectPoolType() {
    const tempObjectPool = [];

    // remove prev type objects and push the new ones in place of them.
    this.objectPool.forEach((object, index) => {
      const { position, quaternion } = object;
      object.parent.remove(object);
      delete this.objectPool[index];

      const newObj = this.getObject();
      newObj.position.set(position.x, position.y, position.z);
      newObj.quaternion.set(quaternion.x, quaternion.y, quaternion.z, quaternion.w);
      tempObjectPool.push(newObj);
      this.object.add(newObj);
      setObjectDimension(newObj, this.options);
    });

    this.objectPool = tempObjectPool;
  }

  updateOptions(options) {
    const { type: currentType } = this.options;
    const {
      type,
      keep,
    } = options;

    this.options = options;

    if (type !== currentType) {
      this.changeObjectPoolType();
    }

    this.objectPool.forEach((object) => {
      setObjectDimension(object, this.options);
    });

    this.setKeepSize(keep);
  }

  update(message) {
    super.update(message);
    if (!this.keepSize) {
      this.removeAllObjects();
      return;
    }

    const { pose: { pose: { position, orientation } } } = message;
    const transform = {
      translation: position,
      rotation: orientation
    };

    const newPose = {
      position: new THREE.Vector3(position.x, position.y, position.z),
      quaternion: new THREE.Quaternion(orientation.x, orientation.y, orientation.z, orientation.w),
    };
    const toleranceThresholdExceed = this.checkToleranceThresholdExceed(newPose);

    if (toleranceThresholdExceed) {
      const newObject = this.getObject();
      setObjectDimension(newObject, this.options);

      this.objectPool.push(newObject);
      this.currentObject += 1;
      this.currentObject = THREE.Math.clamp(this.currentObject, 0, this.keepSize - 1);
      this.object.add(newObject);
      TransformUtils.setTransform(newObject, transform);

      // remove excess object from object pool wrt to keepsize
      if (this.objectPool.length > this.keepSize) {
        const objToRemove = this.objectPool[0];
        this.object.remove(objToRemove);
        delete this.objectPool[0];

        const newObjectPool = this.objectPool.slice(1);
        this.objectPool = [...newObjectPool];
      }
    }
  }
}

export default DisplayOdometry;
