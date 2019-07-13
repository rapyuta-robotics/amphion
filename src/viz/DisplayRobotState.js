import Core from '../core';
import { MESSAGE_TYPE_DISPLAYROBOTSTATE } from '../utils/constants';

class DisplayRobotState extends Core {
  constructor(ros, topicName, object) {
    super(ros, topicName, MESSAGE_TYPE_DISPLAYROBOTSTATE);
    this.object = object;
  }

  update(message) {
    super.update(message);
    const {
      state: {
        joint_state: jointStates,
        multi_dof_joint_state: multiDofJointStates,
      },
    } = message;
    jointStates.name.forEach((jointName, messageIndex) => {
      this.object.setAngle(jointName, jointStates.angles[messageIndex]);
    });
    multiDofJointStates.joint_names.forEach((jointName, messageIndex) => {
      this.setMultiDofJointAngle(jointName, multiDofJointStates.transforms[messageIndex]);
    });
  }

  setMultiDofJointAngle(jointName, {
    translation: { x, y, z },
    rotation: {
      x: rx, y: ry, z: rz, w: rw
    },
  }) {
    const joint = this.object.joints[jointName];
    if (joint) {
      joint.position.set(x, y, z);
      joint.quaternion.set(rx, ry, rz, rw);
    }
  }
}

export default DisplayRobotState;
