import _ from 'lodash';
import * as TransformUtils from '../utils/transform';
import { DEFAULT_COLOR_LINE } from '../utils/defaults';
const { THREE } = window;

class Line extends THREE.Line {
  constructor(color = DEFAULT_COLOR_LINE, linewidth = 5) {
    super();
    this.geometry = new THREE.Geometry();
    this.material = new THREE.LineBasicMaterial({ linewidth, vertexColors: THREE.VertexColors });
  }

  setColor(colors) {
    TransformUtils.setColor(this, colors);
  }

  updatePoints(points, colors) {
    const color = [];

    this.geometry.vertices = _.map(points, ({ x, y, z }) => new THREE.Vector3(x, y, z));
    this.geometry.verticesNeedUpdate = true;

    if (colors.length >= 0) {
      _.each(colors, ({ r, g, b }) =>  {
        color.push(new THREE.Color(r, g, b));
      });

      this.geometry.colors = color;

      this.geometry.colorsNeedUpdate = true;
    }
  }

  setTransform(transform) {
    TransformUtils.setTransform(this, transform);
  }
}

export default Line;
