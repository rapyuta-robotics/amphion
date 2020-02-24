import { Object3D, OrthographicCamera, Vector3, WebGLRenderer } from 'three';
import { ResizeObserver as ResizeObserverPolyfill } from '@juggle/resize-observer';
import { MapControls2D } from '../utils/2dControls';

import Viewer from './viewer';
import Scene from '../core/scene';
import { DEFAULT_OPTIONS_SCENE } from '../utils/constants';

class Viewer2d extends Viewer {
  constructor(scene: Scene, options: typeof DEFAULT_OPTIONS_SCENE) {
    super(scene, options);
    this.initCamera();
    this.onResizeCb = this.onResizeCb.bind(this);
    this.initCamera = this.initCamera.bind(this);
    this.setContainer = this.setContainer.bind(this);
    this.addVisualization = this.addVisualization.bind(this);
  }

  initCamera() {
    const camera: OrthographicCamera = new OrthographicCamera(
      -100,
      100,
      100,
      -100,
      0.1,
      1000,
    );
    camera.zoom = 0.5;
    camera.position.set(0, 0, 10);
    super.initCamera(camera);
  }

  setContainer(domNode: HTMLElement) {
    // @ts-ignore
    const controls2D = new MapControls2D(this.camera, this.container);
    super.setContainer(domNode, controls2D);
  }

  onResizeCb = () => {
    const { offsetWidth, offsetHeight } = this.container;
    const [cameraWidth, cameraHeight] = [offsetWidth / 100, offsetHeight / 100];
    this.camera.left = -cameraWidth / 2;
    this.camera.right = cameraWidth / 2;
    this.camera.top = cameraHeight / 2;
    this.camera.bottom = -cameraHeight / 2;
  };

  onWindowResize() {
    super.onWindowResize(this.onResizeCb);
  }

  addVisualization(vizObject: { object: Object3D }) {
    this.scene.addVisualization(vizObject);
  }
}

export default Viewer2d;
