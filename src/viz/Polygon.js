import * as THREE from 'three';

import Core from '../core';
import {
  DEFAULT_OPTIONS_POLYGON,
  MESSAGE_TYPE_POLYGONSTAMPED,
} from '../utils/constants';
import Group from '../primitives/Group';
import Line from '../primitives/Line';

class Polygon extends Core {
  constructor(ros, topicName, options = DEFAULT_OPTIONS_POLYGON) {
    super(ros, topicName, MESSAGE_TYPE_POLYGONSTAMPED, {
      ...DEFAULT_OPTIONS_POLYGON,
      ...options,
    });
    this.object = new Group();
    this.line = new Line(null, true);
    this.updateOptions({
      ...DEFAULT_OPTIONS_POLYGON,
      ...options,
    });
  }

  updateOptions(options) {
    super.updateOptions(options);
    const { alpha, color } = this.options;
    this.line.setColor(new THREE.Color(color));
    this.line.setAlpha(alpha);
  }

  update(message) {
    super.update(message);
    const {
      polygon: { points },
    } = message;
    points.push(points[0]);
    this.line.updatePoints(points);
    this.object.add(this.line);
  }
}

export default Polygon;
