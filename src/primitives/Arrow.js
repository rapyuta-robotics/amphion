import {
  DEFAULT_ARROW_HEIGHT,
  DEFAULT_ARROW_RADIUS,
  DEFAULT_COLOR_ARROW,
  DEFAULT_CONE_HEIGHT,
  DEFAULT_CONE_RADIUS,
  DEFAULT_CYLINDER_HEIGHT,
  DEFAULT_CYLINDER_RADIUS,
} from '../utils/defaults';
import Cylinder from './Cylinder';
import Cone from './Cone';
import { OBJECT_TYPE_ARROW } from '../utils/constants';
// import Axes from './Axes';
import Group from './Group';

class Arrow extends Group {
  constructor(radius = DEFAULT_ARROW_RADIUS) {
    super();
    this.cone = new Cone(DEFAULT_COLOR_ARROW);
    this.cone.rotateZ(-Math.PI / 2);
    this.cone.setScale({
      x: radius / DEFAULT_CONE_RADIUS,
      y: 0.25 * DEFAULT_ARROW_HEIGHT / DEFAULT_CONE_HEIGHT,
      z: radius / DEFAULT_CONE_RADIUS,
    });
    this.cone.translateY(0.875 * DEFAULT_ARROW_HEIGHT / DEFAULT_CYLINDER_HEIGHT);

    this.cylinder = new Cylinder(DEFAULT_COLOR_ARROW);
    this.cylinder.rotateZ(-Math.PI / 2);
    this.cylinder.setScale({
      x: 0.5 * radius / DEFAULT_CYLINDER_RADIUS,
      y: DEFAULT_ARROW_HEIGHT * 0.75 / DEFAULT_CYLINDER_HEIGHT,
      z: 0.5 * radius / DEFAULT_CYLINDER_RADIUS
    });
    this.cylinder.translateY(0.375 * DEFAULT_ARROW_HEIGHT / DEFAULT_CYLINDER_HEIGHT);

    this.type = OBJECT_TYPE_ARROW;
    this.add(this.cone);
    this.add(this.cylinder);
  }

  setColor(color) {
    this.cone.setColor(color);
    this.cylinder.setColor(color);
  }
}

export default Arrow;
