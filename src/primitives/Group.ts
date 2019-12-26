import { Group as ThreeGroup } from 'three';

import * as TransformUtils from '../utils/transform';

class Group extends ThreeGroup {
  setTransform(transform: {
    translation: RosMessage.Point;
    rotation: RosMessage.Quaternion;
  }) {
    TransformUtils.setTransform(this, transform);
  }

  setScale(scale: RosMessage.Point) {
    TransformUtils.setScale(this, scale);
  }

  setColor(colors: RosMessage.Color) {
    this.children.forEach(child => {
      TransformUtils.setColor(child, colors);
    });
  }
}

export default Group;
