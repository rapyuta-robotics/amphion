import { Group as ThreeGroup } from 'three';

import * as TransformUtils from '../utils/transform';
import Mesh from './Mesh';

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
      TransformUtils.setColor(child as Mesh, colors);
    });
  }
}

export default Group;
