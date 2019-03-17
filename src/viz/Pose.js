import Core from '../core';
import { MESSAGE_TYPE_POSESTAMPED } from '../utils/constants';
import Arrow from '../core/Arrow';
import Axes from '../core/Axes';

export const POSE_TYPE = {
  ARROW: 'ARROW',
  AXES: 'AXES'
};

class Pose extends Core {
  constructor(ros, topicName) {
    super(ros, topicName, MESSAGE_TYPE_POSESTAMPED);

    this.type = POSE_TYPE.ARROW;
    this.arrow = new Arrow();
    this.axes = new Axes();
    this.axes.object.visible = false;

    this.objectInstance = this.arrow;
  }

  setArrowType() {
    this.objectInstance.object.visible = false;
    this.objectInstance = this.arrow;
    this.objectInstance.object.visible = true;
  }

  setAxesType() {
    this.objectInstance.object.visible = false;
    this.objectInstance = this.axes;
    this.objectInstance.object.visible = true;
  }

  update(message) {
    this.objectInstance.setPose(message);
  }
}

export default Pose;
