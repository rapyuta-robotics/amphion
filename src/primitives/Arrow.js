import {
  DEFAULT_CONE_HEIGHT,
  DEFAULT_CONE_RADIUS,
  DEFAULT_CYLINDER_HEIGHT,
  DEFAULT_CYLINDER_RADIUS,
  DEFAULT_COLOR_X_AXIS,
  OBJECT_TYPE_ARROW,
} from '../utils/constants';
import Cylinder from './Cylinder';
import Cone from './Cone';
import Group from './Group';
import * as TransformUtils from '../utils/transform';

class Arrow extends Group {
  constructor() {
    super();

    this.cone = new Cone(DEFAULT_COLOR_X_AXIS);
    this.cone.rotateZ(-Math.PI / 2);

    this.cylinder = new Cylinder(DEFAULT_COLOR_X_AXIS);
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

    this.type = OBJECT_TYPE_ARROW;
    this.add(this.cone);
    this.add(this.cylinder);
  }

  setColor({ cone, cylinder }) {
    if (cone) {
      this.cone.setColor(cone);
    }

    if (cylinder) {
      this.cylinder.setColor(cylinder);
    }
  }

  setHeadDimensions({ radius, length }) {
    const parsedRadius = parseFloat(radius);
    const parsedLength = parseFloat(length);

    if (parsedRadius) {
      const { y } = this.cone.scale;
      this.cone.setScale({ x: radius, y, z: radius });
    }

    if (parsedLength) {
      const { x, z } = this.cone.scale;
      this.cone.setScale({ x, y: parsedLength, z });
      this.cone.position.set(0, 0, 0);
      this.cone.translateY(this.cylinder.scale.y + parsedLength / 2);
    }
  }

  setShaftDimensions({ radius, length }) {
    const parsedRadius = parseFloat(radius);
    const parsedLength = parseFloat(length);

    if (radius) {
      const { y } = this.cylinder.scale;
      this.cylinder.setScale({ x: parsedRadius, y, z: parsedRadius });
    }

    if (length) {
      const { x, z } = this.cylinder.scale;
      this.cylinder.setScale({ x, y: parsedLength, z });
      this.cylinder.position.set(0, 0, 0);
      this.cylinder.translateY(parsedLength / 2);
      this.setHeadDimensions({ length: this.cone.scale.y });
    }
  }

  setAlpha(alpha) {
    this.cylinder.setAlpha(alpha);
    this.cone.setAlpha(alpha);
  }

  setScale(scale) {
    const { x } = scale;
    const [y, z] = [x / 2, x / 2];
    TransformUtils.setScale(this, { x, y, z });
  }
}

export default Arrow;
