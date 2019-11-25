import { Color } from 'three';

import Core from '../core';
import { DEFAULT_OPTIONS_PATH, MESSAGE_TYPE_PATH } from '../utils/constants';
import Group from '../primitives/Group';
import Line from '../primitives/Line';

class Path extends Core {
  constructor(ros, topicName, options = DEFAULT_OPTIONS_PATH) {
    super(ros, topicName, MESSAGE_TYPE_PATH, {
      ...DEFAULT_OPTIONS_PATH,
      ...options,
    });
    this.object = new Group();
    this.line = new Line(null, true);
    this.updateOptions({
      ...DEFAULT_OPTIONS_PATH,
      ...options,
    });
  }

  updateOptions(options) {
    super.updateOptions(options);
    const { alpha, color } = this.options;
    this.line.setColor(new Color(color));
    this.line.setAlpha(alpha);
  }

  update(message) {
    super.update(message);
    const { poses } = message;
    const points = (poses || []).map(poseData => poseData.pose.position);

    this.line.updatePoints(points);
    this.object.add(this.line);
  }
}

export default Path;
