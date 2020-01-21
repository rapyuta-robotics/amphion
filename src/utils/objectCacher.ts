import { Object3D } from 'three';
import Mesh from '../primitives/Mesh';

class ObjectCacher {
  private readonly objectPool: Object3D;
  private readonly Primitive: any;

  constructor(objectPool: Object3D, Primitive: any) {
    this.objectPool = objectPool;
    this.Primitive = Primitive;
  }

  setObjectDimension(
    object: Mesh,
    position: RosMessage.Point,
    color: RosMessage.Color | null,
    scale?: RosMessage.Point,
  ) {
    const { x, y, z } = position;
    object.setColor(color);
    object.setScale(scale);
    object.position.set(x, y, z);
  }

  reusePool(
    points: RosMessage.Point[],
    colors: Array<RosMessage.Color | null>,
    options: { scale?: RosMessage.Point },
  ) {
    const { scale } = options;
    const currentCount = points.length;

    for (let i = 0; i < currentCount; i++) {
      const currentChild = this.objectPool.children[i];
      this.setObjectDimension(
        currentChild as Mesh,
        points[i],
        colors[i],
        scale,
      );
    }

    for (let i = currentCount; i < this.objectPool.children.length; i++) {
      this.objectPool.children[i].visible = false;
    }
  }

  increasePool(
    points: RosMessage.Point[],
    colors: Array<RosMessage.Color | null>,
    options: { scale?: RosMessage.Point },
  ) {
    const currentCount = this.objectPool.children.length;
    const { scale } = options;

    for (let i = 0; i < currentCount; i++) {
      const currentChild = this.objectPool.children[i];
      this.setObjectDimension(
        currentChild as Mesh,
        points[i],
        colors[i],
        scale,
      );
    }

    for (let i = currentCount; i < points.length; i++) {
      const sphere = new this.Primitive();
      const { x, y, z } = points[i];

      sphere.setColor(colors[i]);
      sphere.setScale(scale);
      sphere.position.set(x, y, z);
      this.objectPool.add(sphere);
    }
  }
}

export default ObjectCacher;
