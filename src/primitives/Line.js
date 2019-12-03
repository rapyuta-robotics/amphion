import {
  Line as ThreeLine,
  Geometry,
  Vector3,
  VertexColors,
  LineBasicMaterial,
  Color,
} from 'three';

import * as TransformUtils from '../utils/transform';

class Line extends ThreeLine {
  constructor(color, disableVertexColor) {
    super();
    this.geometry = new Geometry();
    this.geometry.vertices.push(new Vector3(0, 0, 0));
    const colorOptions = {};

    if (!disableVertexColor) {
      colorOptions.vertexColors = VertexColors;
    }

    this.material = new LineBasicMaterial({ ...colorOptions });
    this.material.transparent = true;
  }

  setColor(colors) {
    TransformUtils.setColor(this, colors);
  }

  updatePoints(points, colors = []) {
    this.geometry.vertices = points.map(({ x, y, z }) => new Vector3(x, y, z));
    this.geometry.verticesNeedUpdate = true;

    const color = [];
    colors.forEach(({ r, g, b }) => {
      color.push(new Color(r, g, b));
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
