import { BoxGeometry, MeshLambertMaterial } from 'three';

import Mesh from './Mesh';

class Cube extends Mesh {
  public readonly geometry: BoxGeometry;
  public readonly material: MeshLambertMaterial;

  constructor() {
    super();
    this.geometry = new BoxGeometry();
    this.material = new MeshLambertMaterial();
  }
}

export default Cube;
