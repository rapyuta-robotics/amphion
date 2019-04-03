import * as THREE from 'three';
import ROSLIB from 'roslib';
import URDFLoader from '../lib/URDFLoader';
import { URDFRobot } from '../lib/URDFClasses';

// const { URDFLoader } = window;

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
      const parsedSourceObject = super.parse(robotString, options);
      console.log(parsedSourceObject);
      this.object.copy(parsedSourceObject, true);
      onComplete(this.object);
    });
  }
}

export default RobotModel;
