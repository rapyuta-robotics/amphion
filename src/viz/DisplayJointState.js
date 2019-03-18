import { URDFRobot } from 'urdf-loader/src/URDFClasses';
import Core from '../core';
import { MESSAGE_TYPE_DISPLAYJOINTSTATE } from '../utils/constants';

class DisplayJointState extends Core {
  constructor(ros, topicName, object) {
    super(ros, topicName, MESSAGE_TYPE_DISPLAYJOINTSTATE);
    this.object = object;
    Object.setPrototypeOf(this.object, new URDFRobot());
  }

  update(message) {
    super.update(message);
    this.object.setAngle(message.name, message.position);
  }
}

export default DisplayJointState;
