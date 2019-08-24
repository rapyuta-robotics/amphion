import * as THREE from 'three';

import Mesh from './Mesh';

class Box extends Mesh {
  constructor() {
    super();
    this.geometry = new THREE.BoxGeometry();
    this.material = new THREE.MeshStandardMaterial();
  }
}

export default Box;
