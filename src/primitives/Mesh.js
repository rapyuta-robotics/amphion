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
}

export default Mesh;
