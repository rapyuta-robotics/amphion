import * as THREE from 'three';
import Mesh from './Mesh';

class Cube extends Mesh {
  constructor() {
    super();
    this.geometry = new THREE.BoxGeometry();
    this.material = new THREE.MeshStandardMaterial();
    this.rotateX(Math.PI / 2);
  }

  setScale({ x }) {
    super.setScale({ x, y: x, z: x });
  }
}

export default Cube;
