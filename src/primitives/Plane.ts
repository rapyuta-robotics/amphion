import { MeshBasicMaterial, PlaneGeometry } from 'three';
import Mesh from './Mesh';

class Plane extends Mesh {
  constructor() {
    super();
    this.geometry = new PlaneGeometry();
    this.material = new MeshBasicMaterial();
  }
}

export default Plane;
