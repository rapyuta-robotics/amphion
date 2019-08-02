import * as THREE from 'three';

import Mesh from './Mesh';

class Text extends Mesh {
  constructor(text) {
    super();
    this.loader = new THREE.FontLoader();

    this.material = new THREE.MeshBasicMaterial({ color: 0xff0000 });
    this.loader.load('https://raw.githubusercontent.com/mrdoob/three.js/dev/examples/fonts/helvetiker_regular.typeface.json', (font) => {
      this.geometry = new THREE.TextGeometry(text, {
        font,
        size: 5.05,
        height: 0.005,
        curveSegments: 12,
        bevelEnabled: false,
        bevelThickness: 10,
        bevelSize: 8,
        bevelSegments: 5
      });
    });



    this.rotateX(Math.PI / 2);
    this.rotateY(Math.PI);
  }
  setText(text) {
     this.loader.load('https://raw.githubusercontent.com/mrdoob/three.js/dev/examples/fonts/helvetiker_regular.typeface.json', (font) => {
            this.geometry = new THREE.TextGeometry(text, {
                font,
                size: 5.05,
                height: 0.005,
                curveSegments: 12,
                bevelEnabled: false,
                bevelThickness: 10,
                bevelSize: 8,
                bevelSegments: 5
            });
        });
    };
}

export default Text;
