import Mesh from './Mesh';
import { DEFAULT_RADIAL_SEGMENTS } from '../utils/defaults';

const { THREE } = window;

class Sphere extends Mesh {
  constructor(color, size = 1) {
    super();
    this.geometry = new THREE.SphereGeometry(size, DEFAULT_RADIAL_SEGMENTS, DEFAULT_RADIAL_SEGMENTS);
    this.material = new THREE.MeshStandardMaterial({ color });
    this.rotateX(Math.PI / 2);
  }
}

export default Sphere;
