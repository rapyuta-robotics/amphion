import {
  DEFAULT_COLOR_X_AXIS,
  DEFAULT_CONE_HEIGHT,
  DEFAULT_CONE_RADIUS,
  DEFAULT_CYLINDER_HEIGHT,
  DEFAULT_CYLINDER_RADIUS,
} from '../utils/constants';
import Cylinder from './Cylinder';
import Cone from './Cone';
import * as TransformUtils from '../utils/transform';
import { Group } from 'three';

class Arrow extends Group {
  public readonly cone = new Cone(DEFAULT_COLOR_X_AXIS);
  public readonly cylinder = new Cylinder(DEFAULT_COLOR_X_AXIS);

  constructor() {
    super();
    this.cone.rotateZ(-Math.PI / 2);
    this.cylinder.rotateZ(-Math.PI / 2);

    this.cone.setScale({
      x: DEFAULT_CONE_RADIUS,
      y: DEFAULT_CONE_HEIGHT,
      z: DEFAULT_CONE_RADIUS,
    });
    this.cylinder.setScale({
      x: DEFAULT_CYLINDER_RADIUS,
      y: DEFAULT_CYLINDER_HEIGHT,
      z: DEFAULT_CYLINDER_RADIUS,
    });

    this.cylinder.translateY(this.cylinder.scale.y / 2);
    this.cone.translateY(this.cylinder.scale.y + this.cone.scale.y / 2);
    this.add(this.cone);
    this.add(this.cylinder);
  }

  setTransform(transform: {
    translation: RosMessage.Point;
    rotation: RosMessage.Quaternion;
  }) {
    TransformUtils.setTransform(this, transform);
  }

  setColor(color: { cone: RosMessage.Color; cylinder: RosMessage.Color }) {
    const { cone, cylinder } = color;

    if (cone) {
      this.cone.setColor(cone);
    }
    if (cylinder) {
      this.cylinder.setColor(cylinder);
    }
  }

  setHeadDimensions(dimensions: { radius?: number; length?: number }) {
    const { radius, length } = dimensions;
    if (radius) {
      const { y } = this.cone.scale;
      this.cone.setScale({ x: radius, y, z: radius });
    }

    if (length) {
      const { x, z } = this.cone.scale;
      this.cone.setScale({ x, y: length, z });
      this.cone.position.set(0, 0, 0);
      this.cone.translateY(this.cylinder.scale.y + length / 2);
    }
  }

  setShaftDimensions(dimensions: { radius?: number; length?: number }) {
    const { radius, length } = dimensions;

    if (radius) {
      const { y } = this.cylinder.scale;
      this.cylinder.setScale({ x: radius, y, z: radius });
    }

    if (length) {
      const { x, z } = this.cylinder.scale;
      this.cylinder.setScale({ x, y: length, z });
      this.cylinder.position.set(0, 0, 0);
      this.cylinder.translateY(length / 2);
      this.setHeadDimensions({ length: this.cone.scale.y });
    }
  }

  setAlpha(alpha: number) {
    this.cylinder.setAlpha(alpha);
    this.cone.setAlpha(alpha);
  }

  setScale(scale: RosMessage.Point) {
    const { x } = scale;
    const [y, z] = [x / 2, x / 2];
    TransformUtils.setScale(this, { x, y, z });
  }
}

export default Arrow;
