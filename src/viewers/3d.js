import { PerspectiveCamera, Vector3, WebGLRenderer } from 'three';
import { ResizeObserver as ResizeObserverPolyfill } from '@juggle/resize-observer';
import { EditorControls } from '../utils/editorControls';

import Scene from '../core/scene';
import { DEFAULT_OPTIONS_SCENE } from '../utils/constants';

const ResizeObserver = window.ResizeObserver || ResizeObserverPolyfill;

class Viewer3d {
  constructor(scene, options = {}) {
    this.options = {
      ...DEFAULT_OPTIONS_SCENE,
      ...options,
    };
    this.scene = scene || new Scene(this.options);
    this.previousWidth = 0;
    this.previousHeight = 0;

    this.ro = new ResizeObserver(entries => {
      if (entries.length > 0) {
        this.onWindowResize();
      }
    });

    this.initCamera();
    this.animate = this.animate.bind(this);
    this.onWindowResize = this.onWindowResize.bind(this);
  }

  animate() {
    this.scene.stats.begin();
    this.scene.updateMatrixWorld();

    this.renderer.render(this.scene, this.camera);
    this.scene.stats.end();
    requestAnimationFrame(this.animate);
  }

  initCamera() {
    this.camera = new PerspectiveCamera(50, 1, 0.01, 1000);
    this.camera.position.set(0, 5, 10);
    this.camera.up = new Vector3(0, 0, 1);
    this.camera.lookAt(new Vector3());

    this.scene.add(this.camera);
  }

  setContainer(domNode) {
    this.container = domNode;
    this.initRenderer(domNode);
    this.controls = new EditorControls(this.camera, this.container);
    this.controls.enableDamping = true;
    this.ro.observe(this.container);
    requestAnimationFrame(this.animate);
    this.onWindowResize();
  }

  initRenderer() {
    const renderer = new WebGLRenderer({ antialias: true });
    renderer.autoClear = false;
    renderer.autoUpdateScene = false;
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setSize(this.container.offsetWidth, this.container.offsetHeight);
    this.renderer = renderer;
    this.container.appendChild(renderer.domElement);
  }

  updateOptions(options) {
    this.options = {
      ...this.options,
      ...options,
    };
    this.scene.updateOptions(this.options);
  }

  destroy() {
    this.ro.unobserve(this.container);
  }

  onWindowResize() {
    const { camera } = this;
    const { offsetHeight, offsetWidth } = this.container;
    if (
      Math.abs(offsetWidth - this.previousWidth) > 10 ||
      Math.abs(offsetHeight - this.previousHeight) > 10
    ) {
      camera.aspect = offsetWidth / offsetHeight;
      camera.updateProjectionMatrix();
      this.renderer.setSize(offsetWidth, offsetHeight);
      this.previousWidth = offsetWidth;
      this.previousHeight = offsetHeight;
    }
  }

  addVisualization(vizObject) {
    this.scene.addVisualization(vizObject);
  }
}

export default Viewer3d;
