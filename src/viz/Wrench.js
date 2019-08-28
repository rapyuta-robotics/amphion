import * as THREE from 'three';

import Core from '../core';
import {
  DEFAULT_OPTIONS_WRENCH,
  MESSAGE_TYPE_WRENCHSTAMPED,
  WRENCH_OBJECT_TYPES,
  DEFAULT_OPTIONS_ARROW_WITH_CIRCLE
} from '../utils/constants';
import Arrow from '../primitives/Arrow';
import ArrowWithCircle from '../primitives/ArrowWithCircle';
import Axes from '../primitives/Axes';
import LineArrow from '../primitives/LineArrow';
import { setObjectDimension } from '../utils/helpers';

class Wrench extends Core {
  constructor(ros, topicName, options = DEFAULT_OPTIONS_WRENCH) {
    super(ros, topicName, MESSAGE_TYPE_WRENCHSTAMPED, options);
    this.object = new THREE.Group();
    this.primitive1 = null;
    this.primitive2 = null;
    this.updateOptions({
      ...DEFAULT_OPTIONS_WRENCH,
      ...options,
    });
  }

  static getNewPrimitive(options) {
    const {
      type
    } = options;
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
    if(primitive && (primitive.type !== type)) {
      this.object.remove(primitive);
      primitive = null;
    }

    if(!primitive) {
      primitive = Wrench.getNewPrimitive(this.options);
      this.object.add(primitive);
    }

    return primitive;
  }

  updateOptions(options) {
    super.updateOptions(options);
    this.primitive1 = this.updatePrimitive(this.primitive1);
    this.options.type = WRENCH_OBJECT_TYPES.arrowWithCircle;
    this.primitive2 = this.updatePrimitive(this.primitive2);

    var forceOptions = {
      color: options["forceColor"],
      alpha: options["alpha"],
      headLength: options["headLength"]*options["forceArrowScale"],
      headRadius: options["headRadius"]*options["arrowWidth"],
      shaftLength: options["shaftLength"]*options["forceArrowScale"],
      shaftRadius: options["shaftRadius"]*options["arrowWidth"],
      type: WRENCH_OBJECT_TYPES.arrow
    };

    var torqueOptions = {
      color: options["torqueColor"],
      alpha: options["alpha"],
      arc: options["arc"],
      circleConeRadius: options["circleConeRadius"]*options["arrowWidth"],
      circleConeLength: options["circleConeLength"]*options["arrowWidth"],
      circleRadius: options["circleRadius"]*options["torqueArrowScale"],
      headLength: options["headLength"]*options["torqueArrowScale"],
      headRadius: options["headRadius"]*options["arrowWidth"],
      shaftLength: options["shaftLength"]*options["torqueArrowScale"],
      shaftRadius: options["shaftRadius"]*options["arrowWidth"],
      tube: options["tube"] *options["arrowWidth"],
      tubularSegments: options["tubularSegments"],
      type: WRENCH_OBJECT_TYPES.arrowWithCircle
    };
    
    setObjectDimension(this.primitive1, forceOptions);
    setObjectDimension(this.primitive2, torqueOptions);
  }

  update(message) {
    super.update(message);
    const { wrench: { force, torque } } = message;
    var translationVector = new THREE.Vector3(1, 0, 0);
    var forceVector = new THREE.Vector3(force.x, force.y, force.z).normalize();
    var torqueVector = new THREE.Vector3(torque.x, torque.y, torque.z).normalize();
    var forceQuaternion = new THREE.Quaternion().setFromUnitVectors(translationVector, forceVector);
    var torqueQuaternion = new THREE.Quaternion().setFromUnitVectors(translationVector, torqueVector);
    this.primitive1.setTransform({
      translation: {y: 0, x: 0, z: 0},
      rotation: forceQuaternion
    });
    this.primitive2.setTransform({
      translation: {y: 0, x: 0, z: 0},
      rotation: torqueQuaternion
    });
  }
}

export default Wrench;
