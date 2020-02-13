import {
  Color,
  Geometry,
  Points as ThreePoints,
  PointsMaterial,
  Vector3,
  VertexColors,
} from 'three';

import * as TransformUtils from '../utils/transform';

class Points extends ThreePoints {
  public readonly geometry: Geometry;
  public readonly material: PointsMaterial;

  constructor() {
    super();
    this.geometry = new Geometry();
    this.material = new PointsMaterial({
      vertexColors: VertexColors,
    });
  }

  setTransform(transform: TransformUtils.Transform) {
    TransformUtils.setTransform(this, transform);
  }

  updatePoints(
    points: RosMessage.Point[],
    colors: RosMessage.Color[],
    options: { scale: RosMessage.Point },
  ) {
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

  setScale(scale: RosMessage.Point | number) {
    if (typeof scale === 'number') {
      this.material.size = scale;
    } else {
      this.material.size = scale.x;
    }
  }
}

export default Points;
