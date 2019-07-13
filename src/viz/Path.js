import * as THREE from 'three';

import Core from '../core';
import { MESSAGE_TYPE_PATH } from '../utils/constants';
import Group from '../primitives/Group';
import Line from '../primitives/Line';

class Path extends Core {
  constructor(ros, topicName, options = {}) {
    super(ros, topicName, MESSAGE_TYPE_PATH);
    this.options = options;
    this.object = new Group();
    this.line = null;
  }

  updateOptions(options) {
    this.options = options;
  }

  update(message) {
    super.update(message);
    const { poses } = message;
    const { color } = this.options;
    const points = (poses || []).map(poseData => poseData.pose.position);

    if (this.line) {
      this.object.remove(this.line);
    }

    this.line = new Line(null, 5, true);
    this.line.setColor(new THREE.Color(color));
    this.line.updatePoints(points);
    this.object.add(this.line);
  }
}

export default Path;
