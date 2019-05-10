import MarkerManager from '../viz/MarkerManager';

class ObjectCacher {
  constructor(objectPool) {
    this.objectPool = objectPool;
  }

  setObjectDimension(object, { x, y, z }, color, scale) {
    object.setColor(color);
    object.setScale(scale);
    object.position.set(x, y, z);
  }

  reusePool(points, colors, options) {
    const { scale } = options;
    const currentCount = points.length;

    for (let i = 0; i < currentCount; i++) {
      const currentChild = this.objectPool.children[i];
      this.setObjectDimension(currentChild, points[i], colors[i], scale);
    }

    for (let i = currentCount; i < this.objectPool.children.length; i++) {
      this.objectPool.children[i].visible = false;
    }
  }

  increasePool(points, colors, options) {
    const currentCount = this.objectPool.children.length;
    const { scale, subtype } = options;
    const newOptions = { type: subtype };

    for (let i = 0; i < currentCount; i++) {
      const currentChild = this.objectPool.children[i];
      this.setObjectDimension(currentChild, points[i], colors[i], scale);
    }

    for (let i = currentCount; i < points.length; i++) {
      const sphere = MarkerManager.getNewPrimitive(newOptions);
      const { x, y, z } = points[i];

      sphere.setColor(colors[i]);
      sphere.setScale(scale);
      sphere.position.set(x, y, z);
      this.objectPool.add(sphere);
    }
  }
}

export default ObjectCacher;
