import Cylinder from './Cylinder';
import {
  DEFAULT_COLOR_X_AXIS,
  DEFAULT_CYLINDER_HEIGHT,
  DEFAULT_COLOR_Y_AXIS,
  DEFAULT_COLOR_Z_AXIS,
  OBJECT_TYPE_AXES,
} from '../utils/constants';
import Group from './Group';

class Axes extends Group {
  constructor(radius, height) {
    super();
    this.x = new Cylinder(DEFAULT_COLOR_X_AXIS, radius, height);
    this.y = new Cylinder(DEFAULT_COLOR_Y_AXIS, radius, height);
    this.z = new Cylinder(DEFAULT_COLOR_Z_AXIS, radius, height);

    this.x.translateX((height || DEFAULT_CYLINDER_HEIGHT) / 2);
    this.y.translateZ(-(height || DEFAULT_CYLINDER_HEIGHT) / 2);
    this.z.translateY((height || DEFAULT_CYLINDER_HEIGHT) / 2);

    this.x.rotateZ(-Math.PI / 2);
    this.y.rotateX(Math.PI / 2);

    this.type = OBJECT_TYPE_AXES;
    this.add(this.x);
    this.add(this.y);
    this.add(this.z);
  }

  setLength(length) {
    length = parseFloat(length);
    [this.x, this.y, this.z].forEach(axis => {
      axis.position.set(0, 0, 0);
      axis.scale.setY(length);
    });

    this.x.translateY(length / 2);
    this.y.translateY(-length / 2);
    this.z.translateY(length / 2);
  }

  setRadius(radius) {
    this.children.forEach(child => {
      child.scale.setX(parseFloat(radius));
      child.scale.setZ(parseFloat(radius));
    });
  }
}

export default Axes;
