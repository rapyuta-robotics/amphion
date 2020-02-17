import { BoxGeometry, MeshLambertMaterial } from 'three';

import Mesh from './Mesh';

class Box extends Mesh {
  public readonly geometry: BoxGeometry;
  public readonly material: MeshLambertMaterial;

  constructor() {
    super();
    this.geometry = new BoxGeometry();
    this.material = new MeshLambertMaterial();
  }
}

export default Box;
