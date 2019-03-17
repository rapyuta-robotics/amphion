import * as THREE from 'three';
import Mesh from './Mesh';
import {
  DEFAULT_CONE_RADIUS,
  DEFAULT_CONE_HEIGHT,
  DEFAULT_RADIAL_SEGMENTS
} from '../utils/defaults';

class Cone extends Mesh {
  constructor(color) {
    super();
    this.geometry = new THREE.ConeBufferGeometry(
      DEFAULT_CONE_RADIUS,
      DEFAULT_CONE_HEIGHT / 4,
      DEFAULT_RADIAL_SEGMENTS
    );
    this.material = new THREE.MeshStandardMaterial({ color });
  }
}

export default Cone;
