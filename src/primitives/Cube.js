import * as THREE from 'three';
import Mesh from './Mesh';

class Cube extends Mesh {
  constructor(color, size = 1) {
    super();
    this.geometry = new THREE.BoxGeometry(size, size, size);
    this.material = new THREE.MeshStandardMaterial({ color });
    this.rotateX(Math.PI / 2);
  }
}

export default Cube;
