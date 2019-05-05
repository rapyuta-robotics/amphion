import _ from 'lodash';
import * as TransformUtils from '../utils/transform';
import { DEFAULT_COLOR_LINE } from '../utils/defaults';

const { THREE } = window;

class LineSegments extends THREE.LineSegments {
  constructor(color = DEFAULT_COLOR_LINE, linewidth = 5) {
    super();
    this.geometry = new THREE.Geometry();
    this.material = new THREE.LineBasicMaterial({ linewidth });
    this.material.vertexColors = THREE.VertexColors;
  }

  setColor(colors) {
    return;
    TransformUtils.setColor(this, colors);
  }

  updatePoints(points, colors) {
    console.log(points, colors);
    this.geometry.vertices = _.map(points, ({ x, y, z }) => new THREE.Vector3(x, y, z));
    this.geometry.colors = _.map(colors, ({ r, g, b }) => new THREE.Color(r, g, b));
    this.geometry.verticesNeedUpdate = true;
    this.geometry.colorsNeedUpdate = true;
  }

  setTransform(transform) {
    TransformUtils.setTransform(this, transform);
  }
}

export default LineSegments;
