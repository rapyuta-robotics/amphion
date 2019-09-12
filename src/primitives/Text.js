import * as THREE from 'three';

import Mesh from './Mesh';

class Text extends Mesh {
  constructor(text) {
    super();
    const loader = new THREE.FontLoader();

    loader.load(
      'https://raw.githubusercontent.com/mrdoob/three.js/dev/examples/fonts/helvetiker_regular.typeface.json',
      font => {
        this.geometry = new THREE.TextGeometry(text, {
          font,
          size: 0.05,
          height: 0.005,
          curveSegments: 12,
          bevelEnabled: false,
          bevelThickness: 10,
          bevelSize: 8,
          bevelSegments: 5,
        });
        this.material = new THREE.MeshBasicMaterial({ color: 0xdddddd });
      },
    );

    this.rotateX(Math.PI / 2);
    this.rotateY(Math.PI);
  }
}

export default Text;
