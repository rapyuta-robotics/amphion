import {
  Object3D,
  Vector3,
  WebGLRenderer,
  OrthographicCamera,
  PerspectiveCamera,
} from 'three';
import { ResizeObserver as ResizeObserverPolyfill } from '@juggle/resize-observer';

import { EditorControls } from '../utils/editorControls';
import { MapControls2D } from '../utils/2dControls';
import Scene from '../core/scene';
import { DEFAULT_OPTIONS_SCENE, VIEW_TYPES } from '../utils/constants';
import { assertIsDefined } from '../utils/helpers';

const ResizeObserver = (window as any).ResizeObserver || ResizeObserverPolyfill;

class Viewer {
  public options: object = {};
  public readonly scene: Scene;
  public previousWidth = 0;
  public previousHeight = 0;
  public ro: typeof ResizeObserver;
  public renderer?: WebGLRenderer;
  public camera?: OrthographicCamera | PerspectiveCamera;
  public container?: HTMLElement;
  // @ts-ignore
  public controls?: any;
  public viewType: any;

  constructor(scene: Scene | null, options: object = {}) {
    this.options = {
      ...DEFAULT_OPTIONS_SCENE,
      ...options,
    };
    this.scene =
      scene || new Scene(this.options as typeof DEFAULT_OPTIONS_SCENE);

    this.initCamera();

    this.animate = this.animate.bind(this);
    this.onWindowResize = this.onWindowResize.bind(this);
    this.onResizeCb = this.onResizeCb.bind(this);
    this.switchView = this.switchView.bind(this);
  }

  initObserver() {
    this.ro = new ResizeObserver((entries: unknown[]) => {
      if (entries.length > 0) {
        this.onWindowResize();
      }
    });
  }

  animate() {
    this.scene.stats.begin();
    this.scene.updateMatrixWorld();
    assertIsDefined(this.camera);
    this.renderer?.render(this.scene, this.camera);
    this.scene.stats.end();
    requestAnimationFrame(this.animate);
  }

  switchView(newViewType: number) {
    const { viewType } = this.options as typeof DEFAULT_OPTIONS_SCENE;

    if (newViewType === viewType) {
      return;
    }

    switch (newViewType) {
      case VIEW_TYPES.VIEW_2D: {
        this.camera = new OrthographicCamera(-100, 100, 100, -100, 0.1, 1000);
        this.camera.zoom = 0.5;
        this.camera.position.set(0, 0, 10);
        // @ts-ignore
        this.controls = new MapControls2D(this.camera, this.container);
        break;
      }
      case VIEW_TYPES.VIEW_3D:
      default: {
        this.camera = new PerspectiveCamera(50, 1, 0.01, 1000);
        this.camera.position.set(0, 5, 10);
        // @ts-ignore
        this.controls = new EditorControls(this.camera, this.container);
        break;
      }
    }
  }

  protected initCamera() {
    const { viewType } = this.options as typeof DEFAULT_OPTIONS_SCENE;

    let camera: OrthographicCamera | PerspectiveCamera | null = null;

    switch (viewType) {
      case VIEW_TYPES.VIEW_2D: {
        camera = new OrthographicCamera(-100, 100, 100, -100, 0.1, 1000);
        camera.zoom = 0.5;
        camera.position.set(0, 0, 10);
        break;
      }
      case VIEW_TYPES.VIEW_3D:
      default: {
        camera = new PerspectiveCamera(50, 1, 0.01, 1000);
        camera.position.set(0, 5, 10);
      }
    }

    camera.up = new Vector3(0, 0, 1);
    camera.lookAt(new Vector3());
    this.camera = camera;

    this.scene.add(this.camera);
  }

  setContainer(domNode: HTMLElement) {
    const { viewType } = this.options as typeof DEFAULT_OPTIONS_SCENE;

    switch (viewType) {
      case VIEW_TYPES.VIEW_2D: {
        // @ts-ignore
        this.controls = new MapControls2D(this.camera, this.container);
        break;
      }
      case VIEW_TYPES.VIEW_3D:
      default: {
        // @ts-ignore
        this.controls = new EditorControls(this.camera, this.container);
        break;
      }
    }

    this.container = domNode;
    this.initRenderer(domNode);

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

  onResizeCb() {
    const { viewType } = this.options as typeof DEFAULT_OPTIONS_SCENE;

    switch (viewType) {
      case VIEW_TYPES.VIEW_2D: {
        const { offsetWidth, offsetHeight } = this.container as HTMLElement;
        const [cameraWidth, cameraHeight] = [
          offsetWidth / 100,
          offsetHeight / 100,
        ];
        this.camera.left = -cameraWidth / 2;
        this.camera.right = cameraWidth / 2;
        this.camera.top = cameraHeight / 2;
        this.camera.bottom = -cameraHeight / 2;
        break;
      }
      case VIEW_TYPES.VIEW_3D:
      default: {
        const { offsetHeight, offsetWidth } = this.container as HTMLElement;
        this.camera.aspect = offsetWidth / offsetHeight;
        break;
      }
    }
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
