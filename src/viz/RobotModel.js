import ROSLIB from 'roslib';
import * as THREE from 'three';
import URDFLoader from 'urdf-loader';
import Group from '../primitives/Group';
import { DEFAULT_OPTIONS_ROBOTMODEL } from '../utils/constants';

const excludedObjects = [
  'PerspectiveCamera',
  'OrthographicCamera',
  'AmbientLight',
  'DirectionalLight',
  'HemisphereLight',
  'Light',
  'RectAreaLight',
  'SpotLight',
  'PointLight',
];

const removeExcludedObjects = mesh => {
  const objectArray = [mesh];
  while (Object.keys(objectArray).length > 0) {
    const currentItem = objectArray.shift();
    currentItem.children.forEach(child => {
      if (!child) {
        return;
      }
      if (excludedObjects.indexOf(child.type) > -1) {
        const { parent } = child;
        parent.children = parent.children.filter(c => c !== child);
      } else {
        objectArray.push(child);
      }
    });
  }
};

class RobotModel extends URDFLoader {
  constructor(ros, paramName, options = DEFAULT_OPTIONS_ROBOTMODEL) {
    super(THREE.DefaultLoadingManager);
    const { packages } = options;
    this.param = new ROSLIB.Param({
      ros,
      name: paramName,
    });
    this.object = new Group();
    this.packages = packages || {};
    this.updateOptions({
      ...DEFAULT_OPTIONS_ROBOTMODEL,
      ...options,
    });

    this.defaultLoadMeshCallback = this.defaultLoadMeshCallback.bind(this);
  }

  static onComplete(object) {
    removeExcludedObjects(object);
  }

  updateOptions() {}

  load(onComplete = RobotModel.onComplete, options = {}) {
    this.param.get(robotString => {
      this.loadRobot(robotString, onComplete, options);
    });
  }

  loadRobot(robotString, onComplete = RobotModel.onComplete, options = {}) {
    const robotModel = super.parse(robotString, {
      packages: this.packages,
      loadMeshCb: options.loadMeshCb || this.defaultLoadMeshCallback,
      fetchOptions: { mode: 'cors', credentials: 'same-origin' },
      ...options,
    });
    this.object.add(robotModel);
    this.object.name = robotModel.robotName;

    onComplete(this.object);
  }

  defaultLoadMeshCallback(path, ext, done) {
    super.defaultMeshLoader(path, ext, mesh => {
      removeExcludedObjects(mesh);
      done(mesh);
    });
  }

  getPackages(onComplete) {
    this.param.get(robotString => {
      const parser = new DOMParser();
      const urdf = parser.parseFromString(robotString, 'text/xml');
      const packages = [...urdf.querySelectorAll('mesh')].map(mesh => {
        const [targetPkg] = mesh
          .getAttribute('filename')
          .replace(/^package:\/\//, '')
          .split(/\/(.+)/);
        return targetPkg;
      });
      onComplete([...new Set(packages)]);
    });
  }

  destroy() {
    if (this.object.parent) {
      this.object.parent.remove(this.object);
    }
  }

  hide() {
    this.object.visible = false;
  }

  show() {
    this.object.visible = true;
  }
}

export default RobotModel;
