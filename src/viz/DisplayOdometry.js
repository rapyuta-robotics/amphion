import _ from 'lodash';
import Core from '../core';
import { MESSAGE_TYPE_ODOMETRY } from '../utils/constants';
import Arrow from '../primitives/Arrow';
import Group from '../primitives/Group';
import * as TransformUtils from '../utils/transform';

class DisplayOdometry extends Core {
  constructor(ros, topicName, controlledObject) {
    super(ros, topicName, MESSAGE_TYPE_ODOMETRY);

    this.object = null;
    this.objectPool = [];
    this.keepSize = 2;
    this.setVizType(controlledObject);
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
      this.removeAllObjects();
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

  update(message) {
    if (!this.keepSize) {
      this.removeAllObjects();
      return;
    }

    const newObject = new Arrow();
    newObject.setScale({ x: 0.5, y: 0.5, z: 0.5 });
    const { pose: { pose: { position, orientation } } } = message;
    const transform = {
      translation: position,
      rotation: orientation
    };

    this.objectPool.push(newObject);
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
