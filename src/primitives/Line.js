import * as THREE from 'three';
import _ from 'lodash';
import * as TransformUtils from '../utils/transform';

class Line extends THREE.Line {
  constructor(color, linewidth = 1) {
    super();
    this.geometry = new THREE.Geometry();
    this.material = new THREE.LineBasicMaterial({ color, linewidth });
  }

  setColor(colors) {
    TransformUtils.setColor(this, colors);
  }

  updatePoints(points) {
    this.geometry.vertices = _.map(points, ({ x, y, z }) => new THREE.Vector3(x, y, z));
    this.geometry.verticesNeedUpdate = true;
  }
}

export default Line;
