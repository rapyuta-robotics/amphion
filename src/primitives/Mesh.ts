import { Math, Mesh as THREEMesh } from 'three';

import * as TransformUtils from '../utils/transform';

class Mesh extends THREEMesh {
  setTransform(transform: {
    translation: RosMessage.Point;
    rotation: RosMessage.Quaternion;
  }) {
    TransformUtils.setTransform(this, transform);
  }

  setScale(scale?: RosMessage.Point) {
    if (scale) {
      TransformUtils.setScale(this, scale);
    }
  }

  setColor(colors: RosMessage.Color | string | null) {
    if (colors) {
      TransformUtils.setColor(this, colors);
    }
  }

  setAlpha(alpha: number) {
    if (Array.isArray(this.material)) {
      this.material.forEach(material => {
        material.opacity = Math.clamp(alpha, 0, 1);
      });
    } else {
      this.material.opacity = Math.clamp(alpha, 0, 1);
    }
  }
}

export default Mesh;
