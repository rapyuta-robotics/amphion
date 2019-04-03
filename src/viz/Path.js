import ROSLIB from 'roslib';
import Core from '../core';
import { MESSAGE_TYPE_PATH } from '../utils/constants';
import Group from '../primitives/Group';
import Cylinder from '../primitives/Cylinder';
import LineArrow from '../primitives/LineArrow';

class Path extends Core {
  constructor(ros, topicName) {
    super(ros, topicName, MESSAGE_TYPE_PATH);
    this.object = new Group();
  }

  update(message) {
    const { poses } = message;

    poses.forEach((poseData) => {
      const newObj = new LineArrow();
      const { pose: { position, orientation } } = poseData;

      newObj.setTransform({
        translation: position,
        rotation: orientation,
      });
      this.object.add(newObj);
    });
  }
}

export default Path;
