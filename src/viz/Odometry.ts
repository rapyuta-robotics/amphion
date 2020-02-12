import { Math, Object3D, Quaternion, Vector3 } from 'three';
import {
  DEFAULT_OPTIONS_ODOMETRY,
  ODOMETRY_OBJECT_TYPES,
} from '../utils/constants';
import Arrow from '../primitives/Arrow';
import Group from '../primitives/Group';
import * as TransformUtils from '../utils/transform';
import Axes from '../primitives/Axes';
import {
  checkToleranceThresholdExceed,
  setObjectDimension,
} from '../utils/helpers';
import LiveCore from '../core/live';
import { DataSource } from '../data';

class Odometry extends LiveCore<RosMessage.Odometry, Group> {
  private objectPool: Object3D[] = [];
  private keepSize = 100;
  private currentObjectIndex = -1;

  constructor(
    source: DataSource<RosMessage.Odometry>,
    options = DEFAULT_OPTIONS_ODOMETRY,
  ) {
    super({
      sources: [source],
      options: {
        ...DEFAULT_OPTIONS_ODOMETRY,
        ...options,
      },
    });
    this.object = new Group();
  }

  setKeepSize(size: number) {
    let newKeepList = [];

    if (size === 0) {
      this.keepSize = 0;
      return;
    }

    if (size < this.keepSize && size < this.objectPool.length) {
      const removeCount = this.objectPool.length - size;
      for (let i = 0; i < removeCount; i++) {
        this.object?.remove(this.objectPool[i]);
      }

      const slicedList = this.objectPool.slice(
        this.objectPool.length - size,
        this.objectPool.length,
      );
      newKeepList = [...slicedList];
    } else {
      newKeepList = [...this.objectPool];
    }

    this.objectPool = newKeepList;
    this.keepSize = size;
    this.currentObjectIndex = this.objectPool.length - 1;
  }

  removeAllObjects() {
    this.objectPool.forEach((obj, index) => {
      obj.parent?.remove(obj);
      delete this.objectPool[index];
    });
    this.objectPool = [];
  }

  checkToleranceThresholdExceed(newPose: {
    position: Vector3;
    quaternion: Quaternion;
  }) {
    if (this.objectPool.length === 0) {
      return true;
    }

    const oldPose = {
      position: this.objectPool[this.currentObjectIndex].position,
      quaternion: this.objectPool[this.currentObjectIndex].quaternion,
    };

    return checkToleranceThresholdExceed(oldPose, newPose, this.options);
  }

  getObject() {
    const { type } = this.options;
    switch (type) {
      case ODOMETRY_OBJECT_TYPES.arrow:
        return new Arrow();
      case ODOMETRY_OBJECT_TYPES.axes:
        return new Axes();
    }

    return new Object3D();
  }

  changeObjectPoolType() {
    const tempObjectPool: Object3D[] = [];

    // remove prev type objects and push the new ones in place of them.
    this.objectPool.forEach((object, index) => {
      const { position, quaternion } = object;
      object.parent?.remove(object);
      delete this.objectPool[index];

      const newObj = this.getObject();
      newObj.position.set(position.x, position.y, position.z);
      newObj.quaternion.set(
        quaternion.x,
        quaternion.y,
        quaternion.z,
        quaternion.w,
      );
      tempObjectPool.push(newObj);
      this.object?.add(newObj);
      setObjectDimension(newObj, this.options);
    });

    this.objectPool = tempObjectPool;
  }

  updateOptions(options: { [p: string]: any }) {
    const { type: currentType } = this.options;
    super.updateOptions(options);
    const { keep, type } = this.options;

    if (type !== currentType) {
      this.changeObjectPoolType();
    }

    this.objectPool.forEach(object => {
      setObjectDimension(object, this.options);
    });

    this.setKeepSize(keep);
  }

  update(message: RosMessage.Odometry) {
    super.update(message);
    if (!this.keepSize) {
      this.removeAllObjects();
      return;
    }

    const {
      pose: {
        pose: { orientation, position },
      },
    } = message;
    const transform = {
      translation: position,
      rotation: orientation,
    };

    const newPose = {
      position: new Vector3(position.x, position.y, position.z),
      quaternion: new Quaternion(
        orientation.x,
        orientation.y,
        orientation.z,
        orientation.w,
      ),
    };
    const toleranceThresholdExceed = this.checkToleranceThresholdExceed(
      newPose,
    );

    if (toleranceThresholdExceed) {
      const newObject = this.getObject();
      setObjectDimension(newObject, this.options);

      this.objectPool.push(newObject);
      this.currentObjectIndex += 1;
      this.currentObjectIndex = Math.clamp(
        this.currentObjectIndex,
        0,
        this.keepSize - 1,
      );
      this.object?.add(newObject);
      TransformUtils.setTransform(newObject, transform);

      // remove excess object from object pool wrt to keepsize
      if (this.objectPool.length > this.keepSize) {
        const objToRemove = this.objectPool[0];
        this.object?.remove(objToRemove);
        delete this.objectPool[0];

        const newObjectPool = this.objectPool.slice(1);
        this.objectPool = [...newObjectPool];
      }
    }
  }
}

export default Odometry;
