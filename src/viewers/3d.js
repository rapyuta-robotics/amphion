import * as THREE from 'three';
import { ResizeObserver as Polyfill } from '@juggle/resize-observer';
import { EditorControls } from 'three/examples/jsm/controls/EditorControls';

import Scene from '../core/scene';
import { DEFAULT_OPTIONS_SCENE } from '../utils/constants';

const ResizeObserver = window.ResizeObserver || Polyfill;

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
    this.camera = new THREE.PerspectiveCamera(50, 1, 0.01, 1000);
    this.camera.position.set(0, 5, 10);
    this.camera.lookAt(new THREE.Vector3());

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
    const renderer = new THREE.WebGLRenderer({ antialias: true });
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
    // this.container.removeEventListener('resize', this.onWindowResize);
  }

  onWindowResize() {
    const { camera } = this;
    const { offsetWidth, offsetHeight } = this.container;
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
