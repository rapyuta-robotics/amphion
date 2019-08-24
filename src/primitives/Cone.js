import * as THREE from 'three';

import Mesh from './Mesh';
import {
  DEFAULT_CONE_RADIUS,
  DEFAULT_CONE_HEIGHT,
  DEFAULT_RADIAL_SEGMENTS,
} from '../utils/constants';

class Cone extends Mesh {
  constructor(color) {
    super();
    this.geometry = new THREE.ConeGeometry(
      DEFAULT_CONE_RADIUS,
      DEFAULT_CONE_HEIGHT,
      DEFAULT_RADIAL_SEGMENTS,
    );
    this.material = new THREE.MeshStandardMaterial({ color });
    this.material.transparent = true;
  }
}

export default Cone;
