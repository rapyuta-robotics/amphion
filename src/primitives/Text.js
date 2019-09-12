import * as THREE from 'three';

import Mesh from './Mesh';

class Text extends Mesh {
  constructor(text, options) {
    super();
    const loader = new THREE.FontLoader();
    this.options = options || {};

    loader.load(
      'https://raw.githubusercontent.com/mrdoob/three.js/dev/examples/fonts/helvetiker_regular.typeface.json',
      font => {
        this.geometry = new THREE.TextGeometry(text, {
          font,
          size: this.options.size || 0.05,
          height: this.options.height || 0.005,
          curveSegments: 12,
          bevelEnabled: false,
          bevelThickness: 10,
          bevelSize: 8,
          bevelSegments: 5,
        });
        this.material = new THREE.MeshBasicMaterial({
          color: this.options.color || 0xdddddd,
        });
      },
    );

    this.rotateX(Math.PI / 2);
    this.rotateY(Math.PI);
  }

  updateMatrixWorld(force) {
    if (this.options.syncOrientationWithCamera && this.options.camera) {
      this.options.camera.getWorldQuaternion(this.quaternion);
    }
    super.updateMatrixWorld(force);
  }
}

export default Text;
