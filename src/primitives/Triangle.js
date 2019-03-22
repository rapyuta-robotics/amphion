import * as THREE from 'three';
import Mesh from './Mesh';

class Triangle extends Mesh {
  constructor(color, sides) {
    super();
    const [side0, side1, side2] = sides;
    this.geometry = new THREE.Geometry();
    this.geometry.vertices = [
      new THREE.Vector3(side0.x, side0.y, side0.z),
      new THREE.Vector3(side1.x, side1.y, side1.z),
      new THREE.Vector3(side2.x, side2.y, side2.z)
    ];
    this.geometry.faces = [new THREE.Face3(0, 1, 2)];
    this.material = new THREE.MeshBasicMaterial({ color });
    this.material.side = THREE.DoubleSide;
    this.rotateX(Math.PI / 2);
  }
}

export default Triangle;
