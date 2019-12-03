import {
  LineSegments as ThreeLineSegments,
  LineBasicMaterial,
  Geometry,
  Vector3,
  Color,
} from 'three';
import * as TransformUtils from '../utils/transform';

class LineSegments extends ThreeLineSegments {
  constructor(color, linewidth = 5) {
    super();
    this.geometry = new Geometry();
    this.material = new LineBasicMaterial({ linewidth });
    this.material.vertexColors = VertexColors;
  }

  setColor(colors) {
    TransformUtils.setColor(this, colors);
  }

  updatePoints(points, colors) {
    this.geometry.vertices = points.map(({ x, y, z }) => new Vector3(x, y, z));
    this.geometry.verticesNeedUpdate = true;

    if (colors.length > 0) {
      this.geometry.colors = colors.map(({ r, g, b }) => new Color(r, g, b));
      this.geometry.colorsNeedUpdate = true;
    }
  }

  setTransform(transform) {
    TransformUtils.setTransform(this, transform);
  }
}

export default LineSegments;
