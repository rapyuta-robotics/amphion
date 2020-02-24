import { Object3D, Vector3, WebGLRenderer } from 'three';
import { ResizeObserver as ResizeObserverPolyfill } from '@juggle/resize-observer';

import Scene from '../core/scene';
import { DEFAULT_OPTIONS_SCENE } from '../utils/constants';
import { assertIsDefined } from '../utils/helpers';

const ResizeObserver = (window as any).ResizeObserver || ResizeObserverPolyfill;

class Viewer {
  public options: object = {};
  public readonly scene: Scene;
  public previousWidth = 0;
  public previousHeight = 0;
  public ro: typeof ResizeObserver;
  public renderer?: WebGLRenderer;
  public camera: any;
  public container?: HTMLElement;
  public controls?: any;

  constructor(scene: Scene | null, options: object = {}) {
    this.options = {
      ...DEFAULT_OPTIONS_SCENE,
      ...options,
    };
    this.scene =
      scene || new Scene(this.options as typeof DEFAULT_OPTIONS_SCENE);

    this.animate = this.animate.bind(this);
    this.onWindowResize = this.onWindowResize.bind(this);
    this.onResizeCb = this.onResizeCb.bind(this);
  }

  initObserver() {
    this.ro = new ResizeObserver((entries: unknown[]) => {
      if (entries.length > 0) {
        this.onWindowResize();
      }
    });
  }

  onResizeCb() {}

  animate() {
    this.scene.stats.begin();
    this.scene.updateMatrixWorld();
    assertIsDefined(this.camera);
    this.renderer?.render(this.scene, this.camera);
    this.scene.stats.end();
    requestAnimationFrame(this.animate);
  }

  protected initCamera(camera: any) {
    this.camera = camera;
    this.camera.up = new Vector3(0, 0, 1);
    this.camera.lookAt(new Vector3());

    this.scene.add(this.camera);
  }

  setContainer(domNode: HTMLElement, controls: any) {
    this.container = domNode;
    this.initRenderer(domNode);
    // @ts-ignore
    this.controls = controls;
    this.controls.enableDamping = true;
    this.ro.observe(this.container);
    requestAnimationFrame(this.animate);
    this.onWindowResize();
  }

  initRenderer(domNode: HTMLElement) {
    const renderer = new WebGLRenderer({ antialias: true });
    renderer.autoClear = false;
    renderer.setPixelRatio(window.devicePixelRatio);
    assertIsDefined(this.container);
    renderer.setSize(this.container.offsetWidth, this.container.offsetHeight);
    this.renderer = renderer;
    this.container.appendChild(renderer.domElement);
  }

  updateOptions(options: object = {}) {
    this.options = {
      ...this.options,
      ...options,
    };
    this.scene.updateOptions(this.options);
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
      this.onResizeCb();

      this.camera.updateProjectionMatrix();
      this.renderer?.setSize(offsetWidth, offsetHeight);
      this.previousWidth = offsetWidth;
      this.previousHeight = offsetHeight;
    }
  }

  addVisualization(vizObject: { object: Object3D }) {
    this.scene.addVisualization(vizObject);
  }
}

export default Viewer;
