import { Group as ThreeGroup } from 'three';

import * as TransformUtils from '../utils/transform';

class Group extends ThreeGroup {
  setTransform(transform) {
    TransformUtils.setTransform(this, transform);
  }

  setScale(scale) {
    TransformUtils.setScale(this, scale);
  }

  setColor(colors) {
    this.children.forEach(child => {
      TransformUtils.setColor(child, colors);
    });
  }
}

export default Group;
