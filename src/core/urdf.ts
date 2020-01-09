import { DefaultLoadingManager, LoadingManager, Mesh, Object3D } from 'three';
import { assertIsDefined, isHTMLElement, isObject3D } from '../utils/helpers';
import URDFLoader from 'urdf-js/src/URDFLoader';
import ROSLIB, { Ros } from 'roslib';
import { DEFAULT_OPTIONS_ROBOTMODEL } from '../utils/constants';

class URDFCore<V extends Object3D> extends URDFLoader {
  private readonly param: ROSLIB.Param;
  protected options: { [k: string]: any };
  protected excludedObjects: string[] = [];
  private readonly packages: { [packageName: string]: string } = {};
  public object?: V;

  constructor(
    ros: Ros,
    paramName: string,
    options: any = DEFAULT_OPTIONS_ROBOTMODEL,
  ) {
    super(DefaultLoadingManager);
    this.options = options;
    this.packages = options.packages;
    this.param = new ROSLIB.Param({
      ros,
      name: paramName,
    });

    this.updateOptions = this.updateOptions.bind(this);
    this.getPackages = this.getPackages.bind(this);
    this.defaultLoadMeshCallback = this.defaultLoadMeshCallback.bind(this);
    this.removeExcludedObjects = this.removeExcludedObjects.bind(this);
    this.onComplete = this.onComplete.bind(this);
    this.loadURDF = this.loadURDF.bind(this);
    this.loadFromParam = this.loadFromParam.bind(this);
  }

  onComplete(object: Object3D) {
    this.removeExcludedObjects(object);
  }

  loadFromParam(onComplete = this.onComplete, options = {}) {
    this.param.get(urdfString => {
      console.log('here');
      this.loadURDF(urdfString, onComplete, options);
    });
  }

  loadURDF(urdfString: string, onComplete = this.onComplete, options: any) {
    const urdfObject = super.parse(urdfString, {
      packages: options.packages || this.packages,
      loadMeshCb: options.loadMeshCb || this.defaultLoadMeshCallback,
      fetchOptions: { mode: 'cors', credentials: 'same-origin' },
      ...options,
    });
    assertIsDefined(this.object);
    this.object.add(urdfObject);
    this.object.name = urdfObject.robotName;

    onComplete(this.object);
  }

  removeExcludedObjects(mesh: Object3D) {
    const objectArray: Object3D[] = [mesh];
    while (Object.keys(objectArray).length > 0) {
      const currentItem = objectArray.shift();
      currentItem?.children.forEach(child => {
        if (!child) {
          return;
        }
        if (this.excludedObjects.indexOf(child.type) > -1) {
          const { parent } = child;
          const children = parent?.children.filter(c => c !== child);
          if (parent && children) {
            parent.children = children;
          }
        } else {
          objectArray.push(child);
        }
      });
    }
  }

  public defaultLoadMeshCallback(
    path: string,
    ext: LoadingManager,
    done: (mesh: Object3D) => void,
  ) {
    super.defaultMeshLoader(path, ext, mesh => {
      this.removeExcludedObjects(mesh);
      done(mesh);
    });
  }

  getPackages(onComplete: (packages: string[]) => void) {
    this.param.get(robotString => {
      const parser = new DOMParser();
      const urdf = parser.parseFromString(robotString, 'text/xml');
      const packages = [...Array.from(urdf.querySelectorAll('mesh'))].map(
        mesh => {
          const [targetPkg] = mesh
            ?.getAttribute('filename')
            ?.replace(/^package:\/\//, '')
            .split(/\/(.+)/);
          return targetPkg;
        },
      );
      onComplete([...new Set(packages)]);
    });
  }

  hide = () => {
    assertIsDefined(this.object);
    this.object.visible = false;
  };

  show = () => {
    assertIsDefined(this.object);
    this.object.visible = true;
  };

  destroy = () => {
    this.object?.parent?.remove(this.object);
    this.object = undefined;
  };

  reset = () => {};

  updateOptions(options: { [k: string]: any }) {
    this.options = {
      ...this.options,
      ...options,
    };
  }
}

export default URDFCore;
