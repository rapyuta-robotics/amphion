import { Object3D, OrthographicCamera, Vector3, WebGLRenderer } from 'three';
import { ResizeObserver as ResizeObserverPolyfill } from '@juggle/resize-observer';
import { MapControls2D } from '../utils/2dControls';

import Scene from '../core/scene';
import { DEFAULT_OPTIONS_SCENE } from '../utils/constants';
import { assertIsDefined } from '../utils/helpers';

const ResizeObserver = (window as any).ResizeObserver || ResizeObserverPolyfill;

class Viewer2d {
  private options = DEFAULT_OPTIONS_SCENE;
  private readonly scene: Scene;
  private previousWidth = 0;
  private previousHeight = 0;
  private readonly ro: typeof ResizeObserver;
  private renderer?: WebGLRenderer;
  private camera?: OrthographicCamera;
  private container?: HTMLElement;
  private controls?: any;

  constructor(scene: Scene, options = DEFAULT_OPTIONS_SCENE) {
    this.options = {
      ...DEFAULT_OPTIONS_SCENE,
      ...options,
    };
    this.scene = scene || new Scene();
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
    this.camera = new OrthographicCamera(-100, 100, 100, -100, 0.1, 1000);
    this.camera.zoom = 0.5;
    this.camera.position.set(0, 0, 10);
    this.camera.up = new Vector3(0, 0, 1);
    this.camera.lookAt(new Vector3());

    this.scene.add(this.camera);
  }

  setContainer(domNode: HTMLElement) {
    this.container = domNode;
    this.initRenderer(domNode);
    // @ts-ignore
    this.controls = new MapControls2D(this.camera, this.container);
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

  updateOptions(options = DEFAULT_OPTIONS_SCENE) {
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
      const [cameraWidth, cameraHeight] = [
        offsetWidth / 100,
        offsetHeight / 100,
      ];
      this.camera.left = -cameraWidth / 2;
      this.camera.right = cameraWidth / 2;
      this.camera.top = cameraHeight / 2;
      this.camera.bottom = -cameraHeight / 2;
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

export default Viewer2d;
