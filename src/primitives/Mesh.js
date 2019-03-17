import * as THREE from 'three';

class Mesh extends THREE.Mesh {
  setScale({ x, y, z }) {
    this.scale.set(x, y, z);
  }

  setColor({ r, g, b }) {
    this.material.color.setRGB(r, g, b);
  }
}

export default Mesh;
