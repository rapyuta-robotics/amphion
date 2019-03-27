import * as THREE from 'three';

class Points extends THREE.Points {
  constructor(points) {
    super();
    this.geometry = new THREE.Geometry();
    if (points) {
      for (let i = 0; i < points.length; i++) {
        const { x, y, z } = points[i];
        this.geometry.vertices.push(new THREE.Vector3(x, y, z));
      }
    }
    this.material = new THREE.PointsMaterial();
  }
}

export default Points;
