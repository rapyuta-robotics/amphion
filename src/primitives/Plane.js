import * as THREE from 'three';

import Mesh from './Mesh';

class Plane extends Mesh {
  constructor() {
    super();
    this.geometry = new THREE.PlaneGeometry();
    this.material = new THREE.MeshBasicMaterial();
  }
}

export default Plane;
