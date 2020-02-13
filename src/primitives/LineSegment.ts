import {
  Color,
  Geometry,
  LineBasicMaterial,
  LineSegments as ThreeLineSegments,
  Vector3,
  VertexColors,
} from 'three';
import * as TransformUtils from '../utils/transform';
import { DEFAULT_COLOR_LINE } from '../utils/constants';

class LineSegments extends ThreeLineSegments {
  public readonly material: LineBasicMaterial;
  public readonly geometry: Geometry;

  constructor(color = DEFAULT_COLOR_LINE, linewidth = 5) {
    super();
    this.geometry = new Geometry();
    this.material = new LineBasicMaterial({ linewidth });
    this.material.vertexColors = VertexColors;
  }

  setColor(color: string | number | RosMessage.Color) {
    TransformUtils.setColor(this, color);
  }

  updatePoints(points: RosMessage.Point[], colors: RosMessage.Color[]) {
    this.geometry.vertices = points.map(({ x, y, z }) => new Vector3(x, y, z));
    this.geometry.verticesNeedUpdate = true;

    if (colors.length > 0) {
      this.geometry.colors = colors.map(({ r, g, b }) => new Color(r, g, b));
      this.geometry.colorsNeedUpdate = true;
    }
  }

  setTransform(transform: TransformUtils.Transform) {
    TransformUtils.setTransform(this, transform);
  }
}

export default LineSegments;
