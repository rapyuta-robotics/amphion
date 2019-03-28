import * as THREE from 'three';

class Mesh extends THREE.Mesh {
  setTransform({
    translation: { x: posX, y: posY, z: posZ },
    rotation: {
      x: orientX,
      y: orientY,
      z: orientZ,
      w: orientW
    }
  }) {
    this.position.set(posX, posY, posZ);
    this.quaternion.set(orientX, orientY, orientZ, orientW);
  }

  setScale({ x, y, z }) {
    this.scale.set(x, y, z);
  }

  setColor({ r, g, b }) {
    this.material.color.setRGB(r, g, b);
  }
}

export default Mesh;
