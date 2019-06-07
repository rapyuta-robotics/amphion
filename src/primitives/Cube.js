import Mesh from './Mesh';

const { THREE } = window;

class Cube extends Mesh {
  constructor() {
    super();
    this.geometry = new THREE.BoxGeometry();
    this.material = new THREE.MeshStandardMaterial();
  }

  setScale({ x }) {
    super.setScale({ x, y: x, z: x });
  }
}

export default Cube;
