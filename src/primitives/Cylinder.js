import {
  DEFAULT_CYLINDER_RADIUS,
  DEFAULT_CYLINDER_HEIGHT,
  DEFAULT_RADIAL_SEGMENTS,
  DEFAULT_COLOR_ARROW
} from '../utils/defaults';
import Mesh from './Mesh';

const { THREE } = window;

class Cylinder extends Mesh {
  constructor(
    color = DEFAULT_COLOR_ARROW,
    radius = DEFAULT_CYLINDER_RADIUS, height = DEFAULT_CYLINDER_HEIGHT
  ) {
    super();
    this.geometry = new THREE.CylinderGeometry(
      radius,
      radius,
      height,
      DEFAULT_RADIAL_SEGMENTS
    );
    this.material = new THREE.MeshStandardMaterial({ color });
    this.material.transparent = true;
    this.rotateX(Math.PI / 2);
  }
}

export default Cylinder;
