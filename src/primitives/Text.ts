import {
  FontLoader,
  Geometry,
  Material,
  MeshBasicMaterial,
  TextGeometry,
} from 'three';

import Mesh from './Mesh';

class Text extends Mesh {
  // @ts-ignore
  public geometry: TextGeometry | undefined;
  // @ts-ignore
  public material: MeshBasicMaterial | undefined;

  constructor(text: string) {
    super();
    const loader = new FontLoader();

    loader.load(
      'https://raw.githubusercontent.com/mrdoob/three.js/dev/examples/fonts/helvetiker_regular.typeface.json',
      font => {
        this.geometry = new TextGeometry(text, {
          font,
          size: 0.05,
          height: 0.005,
          curveSegments: 12,
          bevelEnabled: false,
          bevelThickness: 10,
          bevelSize: 8,
          bevelSegments: 5,
        });
        this.material = new MeshBasicMaterial({ color: 0xdddddd });
      },
    );

    this.rotateX(Math.PI / 2);
    this.rotateY(Math.PI);
  }
}

export default Text;
