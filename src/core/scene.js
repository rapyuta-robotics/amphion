import * as THREE from 'three';
import Stats from 'stats-js';

import { DEFAULT_OPTIONS_SCENE } from '../utils/constants';

class Scene extends THREE.Scene {
  constructor(options = {}) {
    super();
    this.vizWrapper = new THREE.Group();
    this.vizWrapper.rotateX(-Math.PI / 2);
    this.add(this.vizWrapper);

    this.stats = new Stats();
    this.stats.showPanel(0);

    this.initLights();
    this.initGrid();
    this.updateOptions(options);
  }

  initLights() {
    [[-1, 0], [1, 0], [0, -1], [0, 1]].forEach(positions => {
      const directionalLight = new THREE.DirectionalLight(0xffffff, 0.4);
      [directionalLight.position.x, directionalLight.position.z] = positions;
      directionalLight.position.y = 1;
      this.add(directionalLight);
    });
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.2);
    this.add(ambientLight);
  }

  initGrid() {
    this.grid = new THREE.GridHelper(0, 0);
    this.add(this.grid);
  }

  addObject(object) {
    this.vizWrapper.add(object);
  }

  addVisualization({ object }) {
    if (!this.vizWrapper.getObjectById(object.id)) {
      this.addObject(object);
    }
  }

  getObjectByName(name) {
    return this.vizWrapper.getObjectByName(name);
  }

  updateOptions(options) {
    this.options = {
      ...DEFAULT_OPTIONS_SCENE,
      ...options,
    };

    const {
      backgroundColor,
      gridSize,
      gridDivisions,
      gridColor,
      gridCenterlineColor,
    } = this.options;

    this.grid.copy(new THREE.GridHelper(gridSize, gridDivisions, gridCenterlineColor, gridColor));

    this.background = new THREE.Color(backgroundColor);

  }
}

export default Scene;
