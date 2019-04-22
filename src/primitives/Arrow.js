import {
  DEFAULT_ARROW_HEIGHT,
  DEFAULT_ARROW_RADIUS,
  DEFAULT_COLOR_X_AXIS,
  DEFAULT_CONE_HEIGHT,
  DEFAULT_CONE_RADIUS,
  DEFAULT_CYLINDER_HEIGHT,
  DEFAULT_CYLINDER_RADIUS,
} from '../utils/defaults';
import Cylinder from './Cylinder';
import Cone from './Cone';
import { OBJECT_TYPE_ARROW } from '../utils/constants';
import Group from './Group';

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
      z: DEFAULT_CONE_RADIUS
    })

    this.cylinder.setScale({
      x: DEFAULT_CYLINDER_RADIUS,
      y: DEFAULT_CYLINDER_HEIGHT,
      z: DEFAULT_CYLINDER_RADIUS
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

  setHead({ radius, length }) {
    radius = parseFloat(radius);
    length = parseFloat(length);

    if (radius) {
      const { x, y, z } = this.cone.scale;
      this.cone.setScale({ x: radius, y, z: radius });
    }

    if (length) {
      const { x, y, z } = this.cone.scale;
      this.cone.setScale({ x, y: length, z });
      this.cone.position.set(0, 0, 0);
      this.cone.translateY(this.cylinder.scale.y + (length / 2));
    }
  }

  setShaft({ radius, length }) {
    radius = parseFloat(radius);
    length = parseFloat(length);

    if (radius) {
      const { x, y, z } = this.cylinder.scale;
      this.cylinder.setScale({ x: radius, y, z: radius });
    }

    if (length) {
      const { x, y, z } = this.cylinder.scale;
      this.cylinder.setScale({ x, y: length, z });
      this.cylinder.position.set(0, 0, 0);
      this.cylinder.translateY(length / 2);
      this.setHead({ length: this.cone.scale.y });
    }
  }

  setAlpha(alpha) {
    this.cylinder.setAlpha(alpha);
    this.cone.setAlpha(alpha);
  }
}

export default Arrow;
