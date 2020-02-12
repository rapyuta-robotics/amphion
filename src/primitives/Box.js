import { BoxGeometry, MeshStandardMaterial } from 'three';

import Mesh from './Mesh';

class Box extends Mesh {
  constructor() {
    super();
    this.geometry = new BoxGeometry();
    this.material = new MeshStandardMaterial();
  }
}

export default Box;
