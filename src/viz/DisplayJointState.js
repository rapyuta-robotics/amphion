import Core from '../core';
import { MESSAGE_TYPE_DISPLAYJOINTSTATE } from '../utils/constants';

class DisplayJointState extends Core {
  constructor(ros, topicName, object) {
    super(ros, topicName, MESSAGE_TYPE_DISPLAYJOINTSTATE);
    this.object = object;
  }

  update(message) {
    super.update(message);
    message.name.forEach((jointName, messageIndex) => {
      this.object.setAngle(jointName, message.position[messageIndex]);
    });
  }
}

export default DisplayJointState;
