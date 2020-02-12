import {
  Color,
  Geometry,
  Line as ThreeLine,
  LineBasicMaterial,
  Vector3,
  VertexColors,
} from 'three';

import * as TransformUtils from '../utils/transform';
import { assertIsMaterial } from '../utils/helpers';
import { DEFAULT_COLOR_LINE } from '../utils/constants';

class Line extends ThreeLine {
  public readonly geometry: Geometry;
  public readonly material: LineBasicMaterial;

  constructor(
    color: string | number | null | RosMessage.Color = DEFAULT_COLOR_LINE,
    disableVertexColor: boolean = false,
  ) {
    super();
    this.geometry = new Geometry();
    this.geometry.vertices.push(new Vector3(0, 0, 0));
    const colorOptions: { vertexColors?: any } = {};

    if (!disableVertexColor) {
      colorOptions.vertexColors = VertexColors;
    }

    this.material = new LineBasicMaterial({ ...colorOptions });
    this.material.transparent = true;
    this.setColor(color);
  }

  setColor(color: string | number | null | RosMessage.Color) {
    if (!color) {
      return;
    }
    TransformUtils.setColor(this, color);
  }

  updatePoints(
    points: RosMessage.Point[],
    colors: Array<string | number | null | RosMessage.Color> = [],
  ) {
    this.geometry.vertices = points.map(({ x, y, z }) => new Vector3(x, y, z));
    this.geometry.verticesNeedUpdate = true;

    const color: Color[] = [];
    colors.forEach(c => {
      if (typeof c === 'string' || typeof c === 'number') {
        color.push(new Color(c));
      } else if (c) {
        const { r, g, b } = c;
        color.push(new Color(r, g, b));
      }
    });

    this.geometry.colors = color;
    this.geometry.colorsNeedUpdate = true;
  }

  setTransform(transform: TransformUtils.Transform) {
    TransformUtils.setTransform(this, transform);
  }

  setAlpha(alpha: number) {
    assertIsMaterial(this.material);
    this.material.opacity = alpha;
  }
}

export default Line;
