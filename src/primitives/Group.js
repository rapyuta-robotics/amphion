import * as TransformUtils from '../utils/transform';

const { THREE } = window;

class Group extends THREE.Group {
  setTransform(transform) {
    TransformUtils.setTransform(this, transform);
  }

  setScale(scale) {
    TransformUtils.setScale(this, scale);
  }
}

export default Group;
