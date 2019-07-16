import * as THREE from 'three';
import Stats from "stats-js";

class Scene extends THREE.Scene {
  constructor() {
    super();

    this.vizWrapper = new THREE.Group();
    this.vizWrapper.rotateX(-Math.PI / 2);
    this.add(this.vizWrapper);
    this.background = new THREE.Color(0x000000);

    this.stats = new Stats();
    this.stats.showPanel(0);

    this.initLights();
    this.initGrid();
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
    const grid = new THREE.GridHelper(30, 30, 0x333333, 0x222222);

    this.add(grid);
    const { array } = grid.geometry.attributes.color;
    for (let i = 0; i < array.length; i += 60) {
      for (let j = 0; j < 12; j += 1) {
        array[i + j] = 0.26;
      }
    }
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

  setBackgroundColor() {

  }

  setGridSize() {

  }
}

export default Scene;
