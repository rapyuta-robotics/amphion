import { Geometry, Vector3, Face3, MeshBasicMaterial, DoubleSide } from 'three';

import Mesh from './Mesh';

class Triangle extends Mesh {
  constructor(sides) {
    super();
    this.geometry = new Geometry();
    this.geometry.vertices = sides.map(
      side => new Vector3(side.x, side.y, side.z),
    );
    this.geometry.faces = [new Face3(0, 1, 2)];
    this.material = new MeshBasicMaterial();
    this.material.side = DoubleSide;
    this.rotateX(Math.PI / 2);
  }
}

export default Triangle;
