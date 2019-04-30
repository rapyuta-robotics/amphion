import * as TransformUtils from '../utils/transform';
import Group from './Group';
import Line from './Line';
import { OBJECT_TYPE_FLAT_ARROW } from '../utils/constants';

const { THREE } = window;

class LineArrow extends Group {
  constructor(color, linewidth = 1) {
    super();
    this.type = OBJECT_TYPE_FLAT_ARROW;
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

  setLength(length) {
    this.scale.set(length, length, length);
  }

  setColor(color) {
    const { r, g, b } = color;
    this.arrowTop.material.color.setRGB(r, g, b);
    this.arrowLength.material.color.setRGB(r, g, b);
  }
}

export default LineArrow;
