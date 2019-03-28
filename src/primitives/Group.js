import * as THREE from 'three';
import * as TransformUtils from '../utils/transform';

class Group extends THREE.Group {
  setTransform(transform) {
    TransformUtils.setTransform(this, transform);
  }

  setScale(scale) {
    TransformUtils.setScale(this, scale);
  }
}

export default Group;
