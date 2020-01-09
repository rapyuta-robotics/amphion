import { Ros } from 'roslib';
import { Object3D } from 'three';
import Group from '../primitives/Group';
import { DEFAULT_OPTIONS_ROBOTMODEL } from '../utils/constants';
import URDFCore from '../core/urdf';

class RobotModel extends URDFCore<Object3D> {
  constructor(
    ros: Ros,
    paramName: string,
    options = DEFAULT_OPTIONS_ROBOTMODEL,
  ) {
    super(ros, paramName, options);
    this.object = new Group();
    this.excludedObjects = [
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
    this.updateOptions({
      ...DEFAULT_OPTIONS_ROBOTMODEL,
      ...options,
    });
  }
}

export default RobotModel;
