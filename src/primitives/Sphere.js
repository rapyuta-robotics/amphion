import * as THREE from 'three';

import Mesh from './Mesh';
import { DEFAULT_RADIAL_SEGMENTS } from '../utils/constants';

class Sphere extends Mesh {
  constructor(color, size = 1) {
    super();
    this.geometry = new THREE.SphereGeometry(
      size,
      DEFAULT_RADIAL_SEGMENTS,
      DEFAULT_RADIAL_SEGMENTS
    );
    this.material = new THREE.MeshStandardMaterial();
  }
}

export default Sphere;
