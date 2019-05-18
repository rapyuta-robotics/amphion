import Core from '../core';
import { MESSAGE_TYPE_INTERACTIVEMARKER } from '../utils/constants';
import Cube from '../primitives/Cube';

const { THREE } = window;

const AXIS_MAP = {
  X: 'X',
  Y: 'Y',
  Z: 'Z',
};

const PLANE_MAP = {
  XY: 'XY',
  YZ: 'YZ',
  XZ: 'XZ',
  XYZ: 'XYZ',
};

const ROTATE_MAP = {
  XYZE: 'XYZE',
  E: 'E',
};

const SPACE = {
  LOCAL: 'local',
  WORLD: 'world',
}

class TransformControls {
  constructor(object, options) {
    const {
      domElement,
      camera,
      scene,
      orbitControls,
    } = options;

    this.object = object;
    this.domElement = domElement;
    this.camera = camera;
    this.scene = scene;
    this.orbitControls = orbitControls;

    this.initTransformControls();
    this.attachObject();
  }

  initTransformControls() {
    const transformControls = new THREE.TransformControls(
      this.camera,
      this.domElement.current,
    );

    transformControls.addEventListener('mouseDown', () => {
      this.orbitControls.enabled = false;
    });

    transformControls.addEventListener('mouseUp', () => {
      this.orbitControls.enabled = true;
    });

    this.transformControls = transformControls;
    this.scene.add(this.transformControls);
    this.transformControls.setMode('combined');
  }

  attachObject() {
    this.transformControls.attach(this.object);
  }

  detachObject() {
    this.transformControls.detach(this.object);
  }

  showTranslateGizmo(axis, flag) {
    switch (axis) {
      case AXIS_MAP.X:
        this.transformControls.showX = flag;
        break;
      case AXIS_MAP.Y:
        this.transformControls.showY = flag;
        break;
      case AXIS_MAP.Z:
        this.transformControls.showZ = flag;
        break;
      default:
        break;
    }
  }

  showPlaneTranslateGizmo(plane, flag) {
    switch (plane) {
      case PLANE_MAP.XY:
        this.transformControls.showXY = flag;
        break;
      case PLANE_MAP.YZ:
        this.transformControls.showYZ = flag;
        break;
      case PLANE_MAP.XZ:
        this.transformControls.showXZ = flag;
        break;
      case PLANE_MAP.XYZ:
        this.transformControls.showXYZ = flag;
        break;
      default:
        break;
    }
  }

  showRotateGizmo(axis, flag) {
    switch (axis) {
      case AXIS_MAP.X:
        this.transformControls.showRX = flag;
        break;
      case AXIS_MAP.Y:
        this.transformControls.showRY = flag;
        break;
      case AXIS_MAP.Z:
        this.transformControls.showRZ = flag;
        break;
      case ROTATE_MAP.E:
        this.transformControls.showRE = flag;
        break;
      case ROTATE_MAP.XYZE:
        this.transformControls.showRXYZE = flag;
        break;
      default:
        break;
    }
  }

  toggle3DMove(flag) {
    this.showPlaneTranslateGizmo(PLANE_MAP.XYZ, true);
  }

  toggle3DRotate(flag) {
    this.showRotateGizmo(ROTATE_MAP.XYZE, true);
  }

  showAllTranslateAxis() {
    this.showTranslateGizmo(AXIS_MAP.X, true);
    this.showTranslateGizmo(AXIS_MAP.Y, true);
    this.showTranslateGizmo(AXIS_MAP.Z, true);
  }

  showAllRotateAxis() {
    this.showRotateGizmo(AXIS_MAP.X, true);
    this.showRotateGizmo(AXIS_MAP.Y, true);
    this.showRotateGizmo(AXIS_MAP.Z, true);
  }

  enable6DOF(space) {
    this.transformControls.setSpace(space);
    this.showAllTranslateAxis();
    this.showAllRotateAxis();
  }
}

class InteractiveMarkers extends Core {
  constructor(ros, topicName, options = {}) {
    super(ros, topicName, MESSAGE_TYPE_INTERACTIVEMARKER);

    this.options = options;
    this.object = new THREE.Object3D();
    this.object.isInteractiveMarker = true;
    this.object.name = 'InteractiveMarker';

    const box = new Cube();
    box.setColor(new THREE.Color('#ff0000'));
    this.object.add(box);
    this.attachTransformControls(box);
  }

  attachTransformControls(object) {
    const transformControls = new TransformControls(object, this.options);
    transformControls.enable6DOF('local');
  }

  update(message) {
    console.log(message);
  }
}

export default InteractiveMarkers;
