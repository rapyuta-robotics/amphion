import * as THREE from 'three';
import ROSLIB from 'roslib';
import URDFLoader from 'urdf-loader';
import { URDFRobot } from 'urdf-loader/src/URDFClasses';

class RobotModel extends URDFLoader {
  constructor(ros, paramName) {
    super(THREE.DefaultLoadingManager);
    this.param = new ROSLIB.Param({
      ros,
      name: paramName,
    });
    this.object = new URDFRobot();
  }

  load(onComplete = () => {}, options) {
    this.param.get((robotString) => {
      this.object.copy(super.parse(robotString, options), true);
      onComplete(this.object);
    });
  }
  
}

export default RobotModel;
