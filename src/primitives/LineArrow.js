import * as THREE from 'three';
import _ from 'lodash';
import * as TransformUtils from '../utils/transform';
import Group from './Group';
import Line from './Line';

class LineArrow extends Group {
  constructor(color, linewidth = 1) {
    super();
    this.arrowTop = new Line(0xff0000);
    this.topPoints = [];
    this.topPoints.push(new THREE.Vector3(2, 1, 0));
    this.topPoints.push(new THREE.Vector3(3, 0, 0));
    this.topPoints.push(new THREE.Vector3(2, -1, 0));
    this.arrowTop.updatePoints(this.topPoints);
    this.add(this.arrowTop);

    this.arrowLength = new Line(0xff0000);
    this.arrowLength.updatePoints([new THREE.Vector3(0, 0, 0), new THREE.Vector3(3, 0, 0)]);
    this.add(this.arrowLength);

    this.scale.set(0.1, 0.1, 0.1);
  }

  setColor(colors) {
    TransformUtils.setColor(this, colors);
  }
}

export default LineArrow;
