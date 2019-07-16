import * as THREE from 'three';
import { EditorControls } from 'three/examples/jsm/controls/EditorControls';

import Scene from '../core/scene';

class Viewer3d {
  constructor(options = {}) {
    const { scene } = options;
    this.scene = scene || new Scene();
    this.previousWidth = 0;
    this.previousHeight = 0;

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
    window.addEventListener('resize', this.onWindowResize);
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

  destroy() {
    window.removeEventListener('resize', this.onWindowResize);
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
