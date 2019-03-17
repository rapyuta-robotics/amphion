import * as THREE from 'three';
import Cylinder from '../primitives/Cylinder';
import {
  DEFAULT_COLOR_X_AXIS,
  DEFAULT_COLOR_Y_AXIS,
  DEFAULT_COLOR_Z_AXIS,
  DEFAULT_CYLINDER_HEIGHT
} from '../utils/defaults';
import { OBJECT_TYPE_AXES } from '../utils/constants';

class Axes {
  constructor() {
    this.object = new THREE.Group();
    this.init();
  }

  init() {
    this.x = new Cylinder(DEFAULT_COLOR_X_AXIS);
    this.y = new Cylinder(DEFAULT_COLOR_Y_AXIS);
    this.z = new Cylinder(DEFAULT_COLOR_Z_AXIS);

    this.x.translateY(DEFAULT_CYLINDER_HEIGHT / 2);
    this.y.translateY(DEFAULT_CYLINDER_HEIGHT / 2);
    this.z.translateY(DEFAULT_CYLINDER_HEIGHT / 2);
    this.x.rotateZ(-Math.PI / 2);
    this.z.rotateX(Math.PI / 2);

    this.object = new THREE.Group();
    this.object.type = OBJECT_TYPE_AXES;
    this.object.add(this.x);
    this.object.add(this.y);
    this.object.add(this.z);
  }

  setPose({
    pose: {
      position: { x: posX, y: posY, z: posZ },
      orientation: {
        x: orientX,
        y: orientY,
        z: orientZ,
        w: orientW
      },
    }
  }) {
    this.object.position.set(posX, posY, posZ);
    this.object.quaternion.set(orientX, orientY, orientZ, orientW);
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
    this.object.position.set(posX, posY, posZ);
    this.object.quaternion.set(orientX, orientY, orientZ, orientW);
  }
}

export default Axes;
