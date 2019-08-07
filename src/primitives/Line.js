import * as THREE from 'three';

import * as TransformUtils from '../utils/transform';
import { DEFAULT_COLOR_LINE } from '../utils/constants';

class Line extends THREE.Line {
  constructor(color = DEFAULT_COLOR_LINE, disableVertexColor) {
    super();
    this.geometry = new THREE.Geometry();
    this.geometry.vertices.push(new THREE.Vector3(0, 0, 0));
    const colorOptions = {};

    if (!disableVertexColor) {
      colorOptions.vertexColors = THREE.VertexColors;
    }

    this.material = new THREE.LineBasicMaterial({ ...colorOptions });
    this.material.transparent = true;
  }

  setColor(colors) {
    TransformUtils.setColor(this, colors);
  }

  updatePoints(points, colors = []) {
    this.geometry.vertices = points.map(
      ({ x, y, z }) => new THREE.Vector3(x, y, z),
    );
    this.geometry.verticesNeedUpdate = true;

    const color = [];
    colors.forEach(({ r, g, b }) => {
      color.push(new THREE.Color(r, g, b));
    });

    this.geometry.colors = color;
    this.geometry.colorsNeedUpdate = true;
  }

  setTransform(transform) {
    TransformUtils.setTransform(this, transform);
  }

  setAlpha(alpha) {
    this.material.opacity = alpha;
  }
}

export default Line;
