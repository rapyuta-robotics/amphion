import {
  BufferAttribute,
  BufferGeometry,
  Object3D,
  Points as ThreePoints,
  PointsMaterial,
  TextureLoader,
  VertexColors,
} from 'three';
import { LASERSCAN_STYLES } from './constants';
import { assertIsDefined } from './helpers';

class Points {
  private readonly maxPts: number;
  public readonly rootObject: Object3D;
  public positions?: BufferAttribute;
  public colors?: BufferAttribute;
  private geometry?: BufferGeometry;
  private material?: PointsMaterial;
  private object?: ThreePoints;

  constructor(options: { max_pts?: number; rootObject?: Object3D } = {}) {
    this.maxPts = options.max_pts || 10000;
    this.rootObject = options.rootObject || new Object3D();
  }

  setup(type: string, size: number, alpha: number) {
    this.rootObject.children.forEach(child => {
      this.rootObject.remove(child);
    });

    this.positions = new BufferAttribute(
      new Float32Array(this.maxPts * 3),
      3,
      false,
    );
    this.colors = new BufferAttribute(
      new Float32Array(this.maxPts * 3),
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

    this.geometry = new BufferGeometry();
    this.geometry.addAttribute('position', this.positions.setDynamic(true));
    this.geometry.addAttribute('color', this.colors.setDynamic(true));

    this.material = new PointsMaterial({
      color: 0x888888,
      size,
      ...options,
    });
    this.material.vertexColors = VertexColors;
    this.material.transparent = true;
    this.material.opacity = alpha;

    this.object = new ThreePoints(this.geometry, this.material);
    this.rootObject.add(this.object);
  }

  update(l: number) {
    assertIsDefined(this.geometry);
    assertIsDefined(this.positions);
    assertIsDefined(this.colors);
    this.geometry.setDrawRange(0, l);
    this.positions.needsUpdate = true;
    this.colors.needsUpdate = true;
    this.positions.updateRange.count = l * this.positions.itemSize;
    this.colors.updateRange.count = l * this.colors.itemSize;
  }

  setAlpha(alpha: number) {
    assertIsDefined(this.material);
    this.material.opacity = alpha;
  }

  setSize(size: number) {
    assertIsDefined(this.material);
    this.material.size = size;
  }
}

export default Points;
