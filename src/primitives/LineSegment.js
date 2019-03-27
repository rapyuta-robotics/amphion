import * as THREE from 'three';
import _ from 'lodash';

class LineSegments extends THREE.LineSegments {
  constructor(color, linewidth = 5) {
    super();
    this.geometry = new THREE.Geometry();
    this.material = new THREE.LineBasicMaterial({ color, linewidth });
  }

  setColor({ r, g, b }) {
    this.material.color.setRGB(r, g, b);
  }

  updatePoints(points) {
    this.geometry.vertices = _.map(points, ({ x, y, z }) => new THREE.Vector3(x, y, z));
    this.geometry.verticesNeedUpdate = true;
  }
}

export default LineSegments;
