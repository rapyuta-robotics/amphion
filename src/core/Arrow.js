import * as THREE from 'three';
import {
  DEFAULT_ARROW_HEIGHT,
  DEFAULT_ARROW_RADIUS,
  DEFAULT_COLOR_ARROW,
  DEFAULT_CONE_HEIGHT,
  DEFAULT_CONE_RADIUS,
  DEFAULT_CYLINDER_HEIGHT,
  DEFAULT_CYLINDER_RADIUS,
} from '../utils/defaults';
import Cylinder from '../primitives/Cylinder';
import Cone from '../primitives/Cone';
import { OBJECT_TYPE_ARROW } from '../utils/constants';

class Arrow extends THREE.Group {
  constructor() {
    super();
    this.cone = new Cone(DEFAULT_COLOR_ARROW);
    this.cone.setScale(
      DEFAULT_ARROW_RADIUS / DEFAULT_CONE_RADIUS,
      0.25 * DEFAULT_ARROW_HEIGHT / DEFAULT_CONE_HEIGHT,
      DEFAULT_ARROW_RADIUS / DEFAULT_CONE_RADIUS,
    );
    this.cone.translateY(0.875 * DEFAULT_ARROW_HEIGHT / DEFAULT_CYLINDER_HEIGHT);

    this.cylinder = new Cylinder(DEFAULT_COLOR_ARROW);
    this.cylinder.setScale(
      0.5 * DEFAULT_ARROW_RADIUS / DEFAULT_CYLINDER_RADIUS,
      DEFAULT_ARROW_HEIGHT * 0.75 / DEFAULT_CYLINDER_HEIGHT,
      0.5 * DEFAULT_ARROW_RADIUS / DEFAULT_CYLINDER_RADIUS
    );
    this.cylinder.translateY(0.375 * DEFAULT_ARROW_HEIGHT / DEFAULT_CYLINDER_HEIGHT);

    this.type = OBJECT_TYPE_ARROW;
    this.add(this.cone);
    this.add(this.cylinder);
  }

  setTransform({
    position: { x: posX, y: posY, z: posZ },
    orientation: {
      x: orientX,
      y: orientY,
      z: orientZ,
      w: orientW
    }
  }) {
    this.position.set(posX, posY, posZ);
    this.quaternion.set(orientX, orientY, orientZ, orientW);
  }

  setScale({ x, y, z }) {
    this.scale.set(x, y, z);
  }

  setColor(color) {
    this.cone.setColor(color);
    this.cylinder.setColor(color);
  }
}

export default Arrow;
