import ROSLIB from 'roslib';
import _ from 'lodash';
import * as THREE from 'three';
import URDFLoader from 'urdf-loader';
import Group from '../primitives/Group';

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

  getPackages(onComplete) {
    this.param.get((robotString) => {
      const parser = new DOMParser();
      const urdf = parser.parseFromString(robotString, 'text/xml');
      const packages = _.map(urdf.querySelectorAll('mesh'), (mesh) => {
        const [targetPkg] = mesh.getAttribute('filename').replace(/^package:\/\//, '').split(/\/(.+)/);
        return targetPkg;
      });
      onComplete(_.uniq(packages));
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
