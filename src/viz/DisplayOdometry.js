import _ from 'lodash';
import Core from '../core';
import { MESSAGE_TYPE_ODOMETRY } from '../utils/constants';
import Arrow from '../primitives/Arrow';
import Group from '../primitives/Group';
import * as TransformUtils from '../utils/transform';
import { HEAD_LENGTH, HEAD_RADIUS, POSE_VIZ_TYPES, SHAFT_LENGTH, SHAFT_RADIUS } from './Pose';
import Axes from '../primitives/Axes';

const { THREE } = window;

class DisplayOdometry extends Core {
  constructor(ros, topicName, options) {
    super(ros, topicName, MESSAGE_TYPE_ODOMETRY);

    this.object = null;
    this.objectPool = [];
    this.keepSize = 100;
    this.currentObject = -1;
    this.options = options || {};
    this.setVizType(options.controlledObject);
  }

  setVizType(controlledObject) {
    if (!_.isNil(controlledObject)) {
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

    if (size < this.keepSize) {
      const removeCount = this.keepSize - size;
      for (let i = 0; i < removeCount; i++) {
        this.object.remove(this.objectPool[i]);
      }

      const slicedList = this.objectPool.slice(this.keepSize - size, this.objectPool.length);
      newKeepList = [...slicedList];
    } else {
      newKeepList = [...this.objectPool];
    }

    this.objectPool = newKeepList;
    this.keepSize = size;
  }

  removeAllObjects() {
    this.objectPool.forEach((obj, index) => {
      obj.parent.remove(obj);
      delete this.objectPool[index];
    });
    this.objectPool = [];
  }

  checkTolerance(position, rotation) {
    const { positionTolerance, angleTolerance } = this.options;
    if (this.objectPool.length === 0) {
      return false;
    }

    const positionToleranceBool = this.objectPool[this.currentObject]
      .position.distanceTo(position) < positionTolerance;
    const angleToleranceBool = this.objectPool[this.currentObject]
      .quaternion.angleTo(rotation) < angleTolerance;
    if (positionToleranceBool && angleToleranceBool) {
      return true;
    }

    return false;
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

  setObjectTransform(object) {
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
    }
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
      this.setObjectTransform(newObj);
    });

    this.objectPool = tempObjectPool;
  }

  updateOptions(options) {
    const { type: currentType } = this.options;
    const {
      type,
      positionTolerance,
      angleTolerance,
      keep,
      alpha,
      shaftLength,
      shaftRadius,
      headLength,
      headRadius
    } = options;

    this.options = options;

    if (type !== currentType) {
      this.changeObjectPoolType();
    }

    this.objectPool.forEach((object) => {
      this.setObjectTransform(object);
    });

    this.setKeepSize(keep);
  }

  update(message) {
    if (!this.keepSize) {
      this.removeAllObjects();
      return;
    }

    const { pose: { pose: { position, orientation } } } = message;
    const transform = {
      translation: position,
      rotation: orientation
    };

    const checkTolerance = this.checkTolerance(
      new THREE.Vector3(position.x, position.y, position.z),
      new THREE.Quaternion(orientation.x, orientation.y, orientation.z, orientation.w)
    );
    if (checkTolerance) {
      return;
    }

    const newObject = this.getObject();
    this.setObjectTransform(newObject);

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

export default DisplayOdometry;
