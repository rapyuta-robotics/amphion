import * as TransformUtils from '../utils/transform';

const { THREE } = window;

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

  setTransform(transform) {
    TransformUtils.setTransform(this, transform);
  }
}

export default Points;
