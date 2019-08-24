import Core from '../core';
import {
  DEFAULT_OPTIONS_POINT,
  MESSAGE_TYPE_POINTSTAMPED,
} from '../utils/constants';
import Group from '../primitives/Group';
import Sphere from '../primitives/Sphere';

class Point extends Core {
  constructor(ros, topicName, options = DEFAULT_OPTIONS_POINT) {
    super(ros, topicName, MESSAGE_TYPE_POINTSTAMPED, options);
    this.object = new Group();
    this.sphere = new Sphere();
    this.object.add(this.sphere);
    this.updateOptions({
      ...DEFAULT_OPTIONS_POINT,
      ...options,
    });
  }

  updateOptions(options) {
    super.updateOptions(options);
    const { alpha, color, radius } = this.options;
    this.sphere.setColor(color);
    this.sphere.setAlpha(alpha);
    this.sphere.setScale({ x: radius, y: radius, z: radius });
  }

  update(message) {
    super.update(message);
    const {
      point: { x, y, z },
    } = message;
    this.object.position.set(x, y, z);
  }
}

export default Point;
