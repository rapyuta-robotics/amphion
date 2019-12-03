import ROSLIB from 'roslib';
import { DefaultLoadingManager } from 'three';
import URDFLoader from 'urdf-js';
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
    super(DefaultLoadingManager);
    const { packages } = options;
    this.param = new ROSLIB.Param({
      ros,
      name: paramName,
    });
    // this.object is dummy in this viz
    // as soon as the RobotModel loads finishing, the "links" in it
    // are moved from this.object to their corresponding parent frames
    this.object = new Group();
    this.packages = packages || {};
    this.updateOptions({
      ...DEFAULT_OPTIONS_ROBOTMODEL,
      ...options,
    });

    this.defaultLoadMeshCallback = this.defaultLoadMeshCallback.bind(this);
    this.robotModel = null;
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
    this.robotModel = super.parse(robotString, {
      packages: this.packages,
      loadMeshCb: options.loadMeshCb || this.defaultLoadMeshCallback,
      fetchOptions: { mode: 'cors', credentials: 'same-origin' },
      ...options,
    });
    this.object.add(this.robotModel);
    this.object.name = this.robotModel.robotName;

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
    const robotModelParent = this.robotModel && this.robotModel.parent;
    if (robotModelParent) {
      // TODO: proper scene clear for all viz types
      // just parent.remove is not enough
      Object.values(this.robotModel.links).map(linkObj => {
        if (linkObj.parent) {
          linkObj.parent.remove(linkObj);
        }
      });
      robotModelParent.remove(this.robotModel);
    }
    this.robotModel = null;
    if (this.object.parent) {
      this.object.parent.remove(this.object);
    }
  }

  hide() {
    if (!this.robotModel) {
      return;
    }
    Object.values(this.robotModel.links).map(linkObj => {
      linkObj.visible = false;
    });
    this.object.visible = false;
  }

  show() {
    if (!this.robotModel) {
      return;
    }
    Object.values(this.robotModel.links).map(linkObj => {
      linkObj.visible = true;
    });
    this.object.visible = true;
  }
}

export default RobotModel;
