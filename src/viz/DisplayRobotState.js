import Core from '../core';

class DisplayRobotState extends Core {
  constructor({ ros, topicName, messageType }) {
    super(ros, topicName, 'moveit_msgs/DisplayRobotState');
    this.object = new THREE.Object3D;
  }
}

export default DisplayRobotState;
