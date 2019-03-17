import Core from './Index';
import { MESSAGE_TYPE_POSESTAMPED } from './messages';
import Arrow from './Arrow';
import Axes from './Axes';

export const POSE_TYPE = {
  ARROW: 'ARROW',
  AXES: 'AXES'
};

class Pose extends Core {
  constructor(ros, topicName, scene) {
    super(ros, topicName, MESSAGE_TYPE_POSESTAMPED);
    this.scene = scene;

    this.type = POSE_TYPE.ARROW;
    this.arrow = new Arrow(scene);
    this.axes = new Axes(scene);
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
