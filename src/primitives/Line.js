import * as THREE from 'three';
import _ from 'lodash';

class Line extends THREE.Line {
  constructor(color, linewidth = 1) {
    super();
    this.geometry = new THREE.Geometry();
    this.material = new THREE.LineBasicMaterial({ color, linewidth });
  }

  updatePoints(points) {
    this.geometry.vertices = _.map(points, ({ x, y, z }) => new THREE.Vector3(x, y, z));
    this.geometry.verticesNeedUpdate = true;
  }
}

export default Line;
