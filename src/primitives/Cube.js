import { BoxGeometry, MeshStandardMaterial } from 'three';

import Mesh from './Mesh';

class Cube extends Mesh {
  constructor() {
    super();
    this.geometry = new BoxGeometry();
    this.material = new MeshStandardMaterial();
  }

  setScale({ x }) {
    super.setScale({ x, y: x, z: x });
  }
}

export default Cube;
