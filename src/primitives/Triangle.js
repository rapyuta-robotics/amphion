import * as THREE from 'three';
import _ from 'lodash';
import Mesh from './Mesh';

class Triangle extends Mesh {
  constructor(sides) {
    super();
    this.geometry = new THREE.Geometry();
    this.geometry.vertices = _.map(sides, side => new THREE.Vector3(side.x, side.y, side.z));
    this.geometry.faces = [new THREE.Face3(0, 1, 2)];
    this.material = new THREE.MeshBasicMaterial();
    this.material.side = THREE.DoubleSide;
    this.rotateX(Math.PI / 2);
  }
}

export default Triangle;
