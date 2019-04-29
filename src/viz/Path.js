import ROSLIB from 'roslib';
import Core from '../core';
import { MESSAGE_TYPE_PATH } from '../utils/constants';
import Group from '../primitives/Group';
import Line from '../primitives/Line';

class Path extends Core {
  constructor(ros, topicName, options = {}) {
    super(ros, topicName, MESSAGE_TYPE_PATH);
    this.options = options;
    this.object = new Group();
  }

  update(message) {
    const { poses } = message;
    const points = [];

    poses.forEach((poseData) => {
      const { pose: { position } } = poseData;
      points.push(position);
    });

    // remove previous line
    this.object.children.forEach((children) => {
      this.object.remove(children);
    });

    const line = new Line(0x00ff00);
    line.updatePoints(points);
    this.object.add(line);
  }
}

export default Path;
