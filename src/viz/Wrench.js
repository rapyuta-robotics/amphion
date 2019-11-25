import { Group, Vector3, Quaternion } from 'three';

import Core from '../core';
import {
  DEFAULT_OPTIONS_WRENCH,
  MESSAGE_TYPE_WRENCHSTAMPED,
  WRENCH_OBJECT_TYPES,
} from '../utils/constants';
import Arrow from '../primitives/Arrow';
import ArrowWithCircle from '../primitives/ArrowWithCircle';
import { setObjectDimension } from '../utils/helpers';

class Wrench extends Core {
  constructor(ros, topicName, options = DEFAULT_OPTIONS_WRENCH) {
    super(ros, topicName, MESSAGE_TYPE_WRENCHSTAMPED, options);
    this.object = new Group();
    this.primitive1 = null;
    this.primitive2 = null;
    this.updateOptions({
      ...DEFAULT_OPTIONS_WRENCH,
      ...options,
    });
  }

  static getNewPrimitive(options) {
    const { type } = options;
    let newObject = null;

    switch (type) {
      case WRENCH_OBJECT_TYPES.arrow:
        newObject = new Arrow();
        break;
      case WRENCH_OBJECT_TYPES.arrowWithCircle:
        newObject = new ArrowWithCircle();
        break;
    }
    return newObject;
  }

  updatePrimitive(primitive) {
    if (primitive && primitive.type !== this.options.type) {
      this.object.remove(primitive);
      primitive = null;
    }

    if (!primitive) {
      primitive = Wrench.getNewPrimitive(this.options);
      this.object.add(primitive);
    }

    return primitive;
  }

  updateOptions(options) {
    super.updateOptions(options);
    this.options.type = WRENCH_OBJECT_TYPES.arrow;
    this.primitive1 = this.updatePrimitive(this.primitive1);
    this.options.type = WRENCH_OBJECT_TYPES.arrowWithCircle;
    this.primitive2 = this.updatePrimitive(this.primitive2);

    const forceOptions = {
      color: this.options.forceColor,
      alpha: this.options.alpha,
      headLength: this.options.headLength * this.options.forceArrowScale,
      headRadius: this.options.headRadius * this.options.arrowWidth,
      shaftLength: this.options.shaftLength * this.options.forceArrowScale,
      shaftRadius: this.options.shaftRadius * this.options.arrowWidth,
      type: WRENCH_OBJECT_TYPES.arrow,
    };

    const torqueOptions = {
      color: this.options.torqueColor,
      alpha: this.options.alpha,
      arc: this.options.arc,
      circleConeRadius: this.options.circleConeRadius * this.options.arrowWidth,
      circleConeLength: this.options.circleConeLength * this.options.arrowWidth,
      circleRadius: this.options.circleRadius * this.options.torqueArrowScale,
      headLength: this.options.headLength * this.options.torqueArrowScale,
      headRadius: this.options.headRadius * this.options.arrowWidth,
      shaftLength: this.options.shaftLength * this.options.torqueArrowScale,
      shaftRadius: this.options.shaftRadius * this.options.arrowWidth,
      tube: this.options.tube * this.options.arrowWidth,
      tubularSegments: this.options.tubularSegments,
      type: WRENCH_OBJECT_TYPES.arrowWithCircle,
    };

    setObjectDimension(this.primitive1, forceOptions);
    setObjectDimension(this.primitive2, torqueOptions);
  }

  update(message) {
    super.update(message);
    const {
      wrench: { force, torque },
    } = message;
    const translationVector = new Vector3(1, 0, 0);
    const forceVector = new Vector3(force.x, force.y, force.z).normalize();
    const torqueVector = new Vector3(torque.x, torque.y, torque.z).normalize();
    const forceQuaternion = new Quaternion().setFromUnitVectors(
      translationVector,
      forceVector,
    );
    const torqueQuaternion = new Quaternion().setFromUnitVectors(
      translationVector,
      torqueVector,
    );
    this.primitive1.setTransform({
      translation: { y: 0, x: 0, z: 0 },
      rotation: forceQuaternion,
    });
    this.primitive2.setTransform({
      translation: { y: 0, x: 0, z: 0 },
      rotation: torqueQuaternion,
    });
  }
}

export default Wrench;
