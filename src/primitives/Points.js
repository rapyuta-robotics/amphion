import * as TransformUtils from '../utils/transform';
import _ from 'lodash';

const { THREE } = window;

class Points extends THREE.Points {
  constructor() {
    super();
    this.geometry = new THREE.Geometry();
    this.material = new THREE.PointsMaterial({ vertexColors: THREE.VertexColors });
  }

  setTransform(transform) {
    TransformUtils.setTransform(this, transform);
  }

  updatePoints(points, colors, options = {}) {
    const { scale: { x } } = options;

    this.material.size = x;
    this.geometry.vertices = _.map(points,
      vertex => new THREE.Vector3(vertex.x, vertex.y, vertex.z));
    this.geometry.verticesNeedUpdate = true;

    if (colors.length > 0) {
      this.geometry.colors = _.map(colors, color => new THREE.Color(color.r, color.g, color.b));
      this.geometry.colorsNeedUpdate = true;
    }
  }

  setScale({ x: size }) {
    this.material.size = size;
  }
}

export default Points;
