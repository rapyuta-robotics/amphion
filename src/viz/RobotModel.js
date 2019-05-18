import ROSLIB from 'roslib';
import URDFLoader from '../lib/URDFLoader';
import Group from '../primitives/Group';

const { THREE } = window;

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
      this.object.add(robotModel);
      this.object.name = robotModel.robotName;

      onComplete(this.object);
    });
  }

  destroy() {
    this.object.parent.remove(this.object);
  }

  hide() {
    this.object.visible = false;
  }

  show() {
    this.object.visible = true;
  }
}

export default RobotModel;
