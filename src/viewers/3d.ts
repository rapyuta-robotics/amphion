import { Object3D, PerspectiveCamera, Vector3, WebGLRenderer } from 'three';
import { ResizeObserver as ResizeObserverPolyfill } from '@juggle/resize-observer';
import { EditorControls } from '../utils/editorControls';

import Viewer from './viewer';
import Scene from '../core/scene';

class Viewer3d extends Viewer {
  constructor(scene: Scene | null, options: object = {}) {
    super(scene, options);
    super.initObserver(this.onResizeCb);
    this.initCamera();
    this.onResizeCb = this.onResizeCb.bind(this);
    this.initCamera = this.initCamera.bind(this);
    this.setContainer = this.setContainer.bind(this);
    this.addVisualization = this.addVisualization.bind(this);
  }

  initCamera() {
    const camera: PerspectiveCamera = new PerspectiveCamera(50, 1, 0.01, 1000);
    camera.position.set(0, 5, 10);
    super.initCamera(camera);
  }

  setContainer(domNode: HTMLElement) {
    // @ts-ignore
    const orbitalControls = new EditorControls(this.camera, this.container);
    super.setContainer(domNode, orbitalControls);
  }

  onResizeCb() {
    const { offsetHeight, offsetWidth } = this.container;
    this.camera.aspect = offsetWidth / offsetHeight;
  }

  addVisualization(vizObject: { object?: Object3D }) {
    this.scene.addVisualization(vizObject);
  }
}

export default Viewer3d;
