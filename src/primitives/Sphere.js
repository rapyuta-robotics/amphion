import * as THREE from 'three';
import Mesh from './Mesh';

class Sphere extends Mesh {
  constructor(color, size = 1) {
    super();
    this.geometry = new THREE.SphereGeometry(1, 16, 16);
    this.material = new THREE.MeshStandardMaterial({ color });
    this.rotateX(Math.PI / 2);
  }
}

export default Sphere;
