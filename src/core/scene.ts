// @ts-ignore
import Stats from 'stats-js';
import {
  AmbientLight,
  Color,
  DirectionalLight,
  GridHelper,
  Group,
  Object3D,
  Scene as ThreeScene,
} from 'three';

import { DEFAULT_OPTIONS_SCENE } from '../utils/constants';

class Scene extends ThreeScene {
  public readonly vizWrapper: Group;
  public readonly stats: Stats;
  private grid?: GridHelper;
  private options = DEFAULT_OPTIONS_SCENE;

  constructor(options = DEFAULT_OPTIONS_SCENE) {
    super();
    this.vizWrapper = new Group();
    this.add(this.vizWrapper);

    this.stats = new Stats();
    this.stats.showPanel(0);

    this.initLights();
    this.initGrid();
    this.updateOptions(options);
  }

  initLights() {
    [
      [-1, 0],
      [1, 0],
      [0, -1],
      [0, 1],
    ].forEach(positions => {
      const directionalLight = new DirectionalLight(0xffffff, 0.4);
      [directionalLight.position.x, directionalLight.position.y] = positions;
      directionalLight.position.z = 1;
      this.add(directionalLight);
    });
    const ambientLight = new AmbientLight(0xffffff, 0.2);
    this.add(ambientLight);
  }

  initGrid() {
    this.grid = new GridHelper(0, 0);
    this.add(this.grid);
  }

  addObject(object: Object3D) {
    this.vizWrapper.add(object);
  }

  addVisualization(args: { object?: Object3D }) {
    const { object } = args;
    if (!object) {
      return;
    }
    if (!this.vizWrapper.getObjectById(object.id)) {
      this.addObject(object);
    }
  }

  getObjectByName(name: string) {
    return this.vizWrapper.getObjectByName(name);
  }

  updateOptions(options = DEFAULT_OPTIONS_SCENE) {
    this.options = {
      ...DEFAULT_OPTIONS_SCENE,
      ...options,
    };

    const {
      backgroundColor,
      gridCenterlineColor,
      gridColor,
      gridDivisions,
      gridSize,
    } = this.options;

    this.grid?.copy(
      new GridHelper(gridSize, gridDivisions, gridCenterlineColor, gridColor),
    );
    this.grid?.rotateX(-Math.PI / 2);

    this.background = new Color(backgroundColor);
  }
}

export default Scene;
