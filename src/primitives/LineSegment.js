import * as THREE from 'three';
import * as TransformUtils from '../utils/transform';
import { DEFAULT_COLOR_LINE } from '../utils/constants';

class LineSegments extends THREE.LineSegments {
  constructor(color = DEFAULT_COLOR_LINE, linewidth = 5) {
    super();
    this.geometry = new THREE.Geometry();
    this.material = new THREE.LineBasicMaterial({ linewidth });
    this.material.vertexColors = THREE.VertexColors;
  }

  setColor(colors) {
    TransformUtils.setColor(this, colors);
  }

  updatePoints(points, colors) {
    this.geometry.vertices = points.map(
      ({ x, y, z }) => new THREE.Vector3(x, y, z),
    );
    this.geometry.verticesNeedUpdate = true;

    if (colors.length > 0) {
      this.geometry.colors = colors.map(
        ({ r, g, b }) => new THREE.Color(r, g, b),
      );
      this.geometry.colorsNeedUpdate = true;
    }
  }

  setTransform(transform) {
    TransformUtils.setTransform(this, transform);
  }
}

export default LineSegments;
