import * as TransformUtils from '../utils/transform';
import _ from 'lodash';
import { Vector3 } from 'three';
import { DEFAULT_COLOR_X_AXIS } from '../utils/defaults';

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

  updatePoints(points, colors) {
    const vertices = _.map(points, vertex => new THREE.Vector3(vertex.x, vertex.y, vertex.z));
    this.geometry.vertices = vertices;
    this.geometry.verticesNeedUpdate = true;

    if (colors.length > 0) {
      const newColors = _.map(colors, color => new THREE.Color(color.r, color.g, color.b));
      this.geometry.colors = newColors;
      this.geometry.colorsNeedUpdate = true;
    }
  }

  setScale({ x: size }) {
    this.material.size = size;
  }
}

export default Points;
