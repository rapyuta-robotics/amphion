import {
  BufferAttribute,
  TextureLoader,
  BufferGeometry,
  PointsMaterial,
  VertexColors,
  Object3D,
  Points as ThreePoints,
} from 'three';
import { LASERSCAN_STYLES } from './constants';

class Points {
  constructor(options = {}) {
    this.max_pts = options.max_pts || 10000;
    this.rootObject = options.rootObject || new Object3D();
  }

  setup(type, size, alpha) {
    this.rootObject.children.forEach(child => {
      this.rootObject.remove(child);
    });

    this.positions = new BufferAttribute(
      new Float32Array(this.max_pts * 3),
      3,
      false,
    );
    this.colors = new BufferAttribute(
      new Float32Array(this.max_pts * 3),
      3,
      false,
    );

    let options = {};

    if (type === LASERSCAN_STYLES.POINTS) {
      const sprite = new TextureLoader().load(
        'https://raw.githubusercontent.com/mrdoob/three.js/master/examples/textures/sprites/circle.png',
      );

      options = {
        map: sprite,
        alphaTest: 0.5,
      };
    }

    this.geomtry = new BufferGeometry();
    this.geomtry.addAttribute('position', this.positions.setDynamic(true));
    this.geomtry.addAttribute('color', this.colors.setDynamic(true));

    this.material = new PointsMaterial({
      color: 0x888888,
      size,
      ...options,
    });
    this.material.vertexColors = VertexColors;
    this.material.transparent = true;
    this.material.opacity = alpha;

    this.object = new ThreePoints(this.geomtry, this.material);
    this.rootObject.add(this.object);
  }

  update(data) {
    this.geomtry.setDrawRange(0, data);
    this.positions.needsUpdate = true;
    this.colors.needsUpdate = true;
    this.positions.updateRange.count = data * this.positions.itemSize;
    this.colors.updateRange.count = data * this.colors.itemSize;
  }

  setAlpha(alpha) {
    this.material.opacity = alpha;
  }

  setSize(size) {
    this.material.size = size;
  }
}

export default Points;
