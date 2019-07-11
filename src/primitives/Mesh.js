import { Mesh as THREEMesh, Math } from 'three';

import * as TransformUtils from '../utils/transform';

class Mesh extends THREEMesh {
  setTransform(transform) {
    TransformUtils.setTransform(this, transform);
  }

  setScale(scale) {
    TransformUtils.setScale(this, scale);
  }

  setColor(colors) {
    TransformUtils.setColor(this, colors);
  }

  setAlpha(alpha) {
    this.material.opacity = Math.clamp(alpha, 0, 1);
  }
}

export default Mesh;
