import { Object3D, PerspectiveCamera, Vector3, WebGLRenderer } from 'three';
import { ResizeObserver as ResizeObserverPolyfill } from '@juggle/resize-observer';
import { EditorControls } from '../utils/editorControls';

import Scene from '../core/scene';
import { DEFAULT_OPTIONS_SCENE } from '../utils/constants';
import { assertIsDefined } from '../utils/helpers';

const ResizeObserver = (window as any).ResizeObserver || ResizeObserverPolyfill;

class Viewer3d {
  public options = {};
  public readonly scene: Scene;
  private previousWidth = 0;
  private previousHeight = 0;
  private readonly ro: typeof ResizeObserver;
  public renderer?: WebGLRenderer;
  public camera?: PerspectiveCamera;
  private container?: HTMLElement;
  public controls?: any;

  constructor(scene: Scene | null, options = {}) {
    this.options = {
      ...DEFAULT_OPTIONS_SCENE,
      ...options,
    };
    this.scene =
      scene || new Scene(this.options as typeof DEFAULT_OPTIONS_SCENE);
    this.ro = new ResizeObserver((entries: unknown[]) => {
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
    assertIsDefined(this.camera);
    this.renderer?.render(this.scene, this.camera);
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

  setContainer(domNode: HTMLElement) {
    this.container = domNode;
    this.initRenderer();
    // @ts-ignore
    this.controls = new EditorControls(this.camera, this.container);
    this.controls.enableDamping = true;
    this.ro.observe(this.container);
    requestAnimationFrame(this.animate);
    this.onWindowResize();
  }

  initRenderer() {
    const renderer = new WebGLRenderer({ antialias: true });
    renderer.autoClear = false;
    renderer.setPixelRatio(window.devicePixelRatio);
    assertIsDefined(this.container);
    renderer.setSize(this.container.offsetWidth, this.container.offsetHeight);
    this.renderer = renderer;
    this.container.appendChild(renderer.domElement);
  }

  updateOptions(options = DEFAULT_OPTIONS_SCENE) {
    this.options = {
      ...this.options,
      ...options,
    };
    this.scene.updateOptions(this.options as typeof DEFAULT_OPTIONS_SCENE);
  }

  destroy() {
    this.ro.unobserve(this.container!);
  }

  onWindowResize() {
    assertIsDefined(this.container);
    assertIsDefined(this.camera);
    const { offsetHeight, offsetWidth } = this.container;
    if (
      Math.abs(offsetWidth - this.previousWidth) > 10 ||
      Math.abs(offsetHeight - this.previousHeight) > 10
    ) {
      this.camera.aspect = offsetWidth / offsetHeight;
      this.camera.updateProjectionMatrix();
      this.renderer?.setSize(offsetWidth, offsetHeight);
      this.previousWidth = offsetWidth;
      this.previousHeight = offsetHeight;
    }
  }

  addVisualization(vizObject: { object?: Object3D }) {
    this.scene.addVisualization(vizObject);
  }
}

export default Viewer3d;
