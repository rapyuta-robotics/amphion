import Cylinder from './Cylinder';
import {
  DEFAULT_COLOR_X_AXIS,
  DEFAULT_COLOR_Y_AXIS,
  DEFAULT_COLOR_Z_AXIS,
  DEFAULT_CYLINDER_HEIGHT,
  DEFAULT_CYLINDER_RADIUS,
  OBJECT_TYPE_AXES,
} from '../utils/constants';
import Group from './Group';

class Axes extends Group {
  private readonly x: Cylinder;
  private readonly y: Cylinder;
  private readonly z: Cylinder;
  public readonly objectType = OBJECT_TYPE_AXES;

  constructor(
    radius = DEFAULT_CYLINDER_RADIUS,
    height = DEFAULT_CYLINDER_HEIGHT,
  ) {
    super();
    this.x = new Cylinder(DEFAULT_COLOR_X_AXIS, radius, height);
    this.y = new Cylinder(DEFAULT_COLOR_Y_AXIS, radius, height);
    this.z = new Cylinder(DEFAULT_COLOR_Z_AXIS, radius, height);

    this.x.translateX(height / 2);
    this.y.translateZ(-height / 2);
    this.z.translateY(height / 2);

    this.x.rotateZ(-Math.PI / 2);
    this.y.rotateX(Math.PI / 2);

    this.add(this.x);
    this.add(this.y);
    this.add(this.z);
  }

  setLength(length: number) {
    const parsedLength = +`${length}`;

    [this.x, this.y, this.z].forEach(axis => {
      axis.position.set(0, 0, 0);
      axis.scale.setY(parsedLength);
    });

    this.x.translateY(parsedLength / 2);
    this.y.translateY(-parsedLength / 2);
    this.z.translateY(parsedLength / 2);
  }

  setRadius(radius: number) {
    const parsedRadius = +`${radius}`;

    this.children.forEach(child => {
      child.scale.setX(parsedRadius);
      child.scale.setZ(parsedRadius);
    });
  }
}

export default Axes;
