import * as THREE from 'three';
import Cylinder from '../primitives/Cylinder';
import {
  DEFAULT_COLOR_X_AXIS,
  DEFAULT_COLOR_Y_AXIS,
  DEFAULT_COLOR_Z_AXIS,
  DEFAULT_CYLINDER_HEIGHT
} from '../utils/defaults';
import { OBJECT_TYPE_AXES } from '../utils/constants';

class Axes extends THREE.Group {
  constructor(radius, height) {
    super();
    this.radius = radius;
    this.height = height;
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


  setTransform({
    translation: { x: posX, y: posY, z: posZ },
    rotation: {
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
}

export default Axes;
