import {
  Points as ThreePoints,
  Geometry,
  PointsMaterial,
  VertexColors,
  Vector3,
  Color,
} from 'three';

import * as TransformUtils from '../utils/transform';

class Points extends ThreePoints {
  constructor() {
    super();
    this.geometry = new Geometry();
    this.material = new PointsMaterial({
      vertexColors: VertexColors,
    });
  }

  setTransform(transform) {
    TransformUtils.setTransform(this, transform);
  }

  updatePoints(points, colors, options = {}) {
    const {
      scale: { x },
    } = options;

    this.material.size = x;
    this.geometry.vertices = points.map(
      vertex => new Vector3(vertex.x, vertex.y, vertex.z),
    );
    this.geometry.verticesNeedUpdate = true;

    if (colors.length > 0) {
      this.geometry.colors = colors.map(
        color => new Color(color.r, color.g, color.b),
      );
      this.geometry.colorsNeedUpdate = true;
    }
  }

  setScale({ x: size }) {
    this.material.size = size;
  }
}

export default Points;
