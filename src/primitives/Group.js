import * as THREE from 'three';

class Group extends THREE.Group {
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
}

export default Group;
