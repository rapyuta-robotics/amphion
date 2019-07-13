import * as THREE from 'three';

import Mesh from './Mesh';

class TriangleList extends Mesh {
  constructor() {
    super();
    this.geometry = new THREE.Geometry();

    this.material = new THREE.MeshBasicMaterial({
      vertexColors: THREE.FaceColors,
    });
    this.material.side = THREE.DoubleSide;
  }

  updatePoints(points, colors = [], options) {
    const vertices = [];
    const faces = [];
    const { scale: { x, y, z } } = options;

    this.scale.set(x, y, z);
    for(let index = 0, l = points.length / 3; index < l; index++) {
      const verticesArray = [points[3 * index], points[3 * index + 1], points[3 * index + 2]];
      verticesArray.map((side) => {
        vertices.push(new THREE.Vector3(side.x, side.y, side.z));
      });

      const color = colors.length === 0 ? { r: 1, g: 0, b: 0 } : colors[3 * index];
      faces.push(new THREE.Face3(
        3 * index, 3 * index + 2, 3 * index + 1,
        new THREE.Vector3(),
        new THREE.Color(color.r, color.g, color.b)
      ));
    }

    this.geometry.vertices = vertices;
    this.geometry.faces = faces;

    this.geometry.computeFaceNormals();
    this.geometry.computeVertexNormals();
    this.geometry.elementsNeedUpdate = true;
    this.geometry.verticesNeedUpdate = true;
  }
}

export default TriangleList;
