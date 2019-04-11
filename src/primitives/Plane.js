import Mesh from './Mesh';

const { THREE } = window;

class Plane extends Mesh {
  constructor() {
    super();
    this.geometry = new THREE.PlaneGeometry();
    this.material = new THREE.MeshBasicMaterial();
  }
}

export default Plane;
