import { DefaultLoadingManager, LoadingManager, Object3D } from 'three';
import { assertIsDefined } from '../utils/helpers';
import ROSLIB, { Ros } from 'roslib';
import { DEFAULT_OPTIONS_ROBOTMODEL } from '../utils/constants';
// @ts-ignore
import URDFLoader from 'urdf-js/umd/URDFLoader';
// @ts-ignore
import { URDFLink, URDFRobot } from 'urdf-js/umd/URDFClasses';

class URDFCore<V extends Object3D> extends URDFLoader {
  private readonly param: ROSLIB.Param;
  protected options: { [k: string]: any };
  private urdfObject?: URDFRobot;
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
    this.onComplete = this.onComplete.bind(this);
    this.loadURDF = this.loadURDF.bind(this);
    this.loadFromParam = this.loadFromParam.bind(this);
  }

  onComplete(object: Object3D) {}

  loadFromParam(onComplete = this.onComplete, options = {}) {
    this.param.get(urdfString => {
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
    this.urdfObject = urdfObject;
    this.object.add(urdfObject);
    this.object.name = urdfObject.robotName;

    onComplete(this.object);
  }

  public defaultLoadMeshCallback(
    path: string,
    ext: LoadingManager,
    done: (mesh: Object3D) => void,
  ) {
    super.defaultMeshLoader(path, ext, (mesh: Object3D) => {
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
    Object.values(this.urdfObject?.links ?? []).forEach((link: URDFLink) => {
      link.hide();
    });
  };

  show = () => {
    assertIsDefined(this.object);
    Object.values(this.urdfObject?.links ?? []).forEach((link: URDFLink) => {
      link.show();
    });
  };

  destroy = () => {
    Object.values(this.urdfObject?.links ?? []).forEach((link: URDFLink) => {
      link.delete();
    });
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
