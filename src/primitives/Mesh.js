import * as TransformUtils from '../utils/transform';

const { THREE } = window;

class Mesh extends THREE.Mesh {
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
    this.material.opacity = THREE.Math.clamp(alpha, 0, 1);
  }
}

export default Mesh;
