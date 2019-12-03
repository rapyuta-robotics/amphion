import { Vector3 } from 'three';

import Group from './Group';
import Line from './Line';
import { OBJECT_TYPE_FLAT_ARROW } from '../utils/constants';

class LineArrow extends Group {
  constructor() {
    super();
    this.type = OBJECT_TYPE_FLAT_ARROW;
    this.arrowTop = new Line(0xff0000, true);
    this.topPoints = [];
    this.topPoints.push(new Vector3(2, 1, 0));
    this.topPoints.push(new Vector3(3, 0, 0));
    this.topPoints.push(new Vector3(2, -1, 0));
    this.arrowTop.updatePoints(this.topPoints);
    this.add(this.arrowTop);

    this.arrowLength = new Line(0xff0000, true);
    this.arrowLength.updatePoints([new Vector3(0, 0, 0), new Vector3(3, 0, 0)]);
    this.add(this.arrowLength);

    this.scale.set(0.1, 0.1, 0.1);
  }

  setLength(length) {
    this.scale.set(length, length, length);
  }

  setColor(color) {
    const { b, g, r } = color;
    this.arrowTop.material.color.setRGB(r, g, b);
    this.arrowLength.material.color.setRGB(r, g, b);
  }
}

export default LineArrow;
