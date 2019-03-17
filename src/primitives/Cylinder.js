import * as THREE from 'three';
import { DEFAULT_CYLINDER_RADIUS, DEFAULT_CYLINDER_HEIGHT, DEFAULT_RADIAL_SEGMENTS } from '../utils/defaults';
import Mesh from './Mesh';

class Cylinder extends Mesh {
  constructor(color) {
    super();
    this.geometry = new THREE.CylinderGeometry(
      DEFAULT_CYLINDER_RADIUS,
      DEFAULT_CYLINDER_RADIUS,
      DEFAULT_CYLINDER_HEIGHT,
      DEFAULT_RADIAL_SEGMENTS
    );
    this.material = new THREE.MeshStandardMaterial({ color });
  }
}

export default Cylinder;
