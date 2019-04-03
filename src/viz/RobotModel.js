import * as THREE from 'three';
import ROSLIB from 'roslib';
import URDFLoader from '../lib/URDFLoader';
// import { URDFRobot } from '../lib/URDFClasses';
import Group from '../primitives/Group';

// const { URDFLoader } = window;

class RobotModel extends URDFLoader {
  constructor(ros, paramName) {
    super(THREE.DefaultLoadingManager);
    this.param = new ROSLIB.Param({
      ros,
      name: paramName,
    });
    this.object = new Group();
  }

  load(onComplete = () => {}, options) {
    this.param.get((robotString) => {
      const robotModel = super.parse(robotString, options);

      // this.object.urdfRobotNode = parsedSourceObject.urdfRobotNode;
      // this.object.robotName = parsedSourceObject.robotName;
      // this.object.links = parsedSourceObject.links;
      // this.object.joints = parsedSourceObject.joints;
      // this.object.geometry = parsedSourceObject.geometry;
      // this.object.material = parsedSourceObject.material;
      // if (this.object.geometry) {
      //   this.object.geometry.colorsNeedUpdate = true;
      // }
      // if (this.object.material) {
      //   this.object.material.needsUpdate = true;
      // }
      // parsedSourceObject.children.forEach((child) => {
      //   this.object.add(child);
      // });
      //
      // console.log(parsedSourceObject);
      // console.log(this.object);
      this.object.add(robotModel);
      this.object.name = robotModel.robotName;

      onComplete(this.object);
    });
  }
}

export default RobotModel;
