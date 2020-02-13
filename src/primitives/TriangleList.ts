import {
  Color,
  DoubleSide,
  Face3,
  FaceColors,
  Geometry,
  MeshBasicMaterial,
  Vector3,
} from 'three';

import Mesh from './Mesh';

class TriangleList extends Mesh {
  public readonly geometry: Geometry;
  public readonly material: MeshBasicMaterial;

  constructor() {
    super();
    this.geometry = new Geometry();
    this.material = new MeshBasicMaterial({
      vertexColors: FaceColors,
    });
    this.material.side = DoubleSide;
  }

  updatePoints(
    points: RosMessage.Point[],
    colors: RosMessage.Color[] = [],
    options: { scale: RosMessage.Point },
  ) {
    const vertices: Vector3[] = [];
    const faces = [];
    const {
      scale: { x, y, z },
    } = options;

    this.scale.set(x, y, z);
    for (let index = 0, l = points.length / 3; index < l; index++) {
      const verticesArray = [
        points[3 * index],
        points[3 * index + 1],
        points[3 * index + 2],
      ];
      verticesArray.map(side => {
        vertices.push(new Vector3(side.x, side.y, side.z));
      });

      const color =
        colors.length === 0 ? { r: 1, g: 0, b: 0 } : colors[3 * index];
      faces.push(
        new Face3(
          3 * index,
          3 * index + 2,
          3 * index + 1,
          new Vector3(),
          new Color(color.r, color.g, color.b),
        ),
      );
    }

    this.geometry.vertices = vertices;
    this.geometry.faces = faces;

    this.geometry.computeFaceNormals();
    this.geometry.computeVertexNormals();
    this.geometry.elementsNeedUpdate = true;
    this.geometry.verticesNeedUpdate = true;
  }
}

export default TriangleList;
