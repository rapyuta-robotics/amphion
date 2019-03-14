import Core from './Index';
import { MESSAGE_TYPE_VECTOR3STAMPED } from './messages';
import Arrow from './Arrow';

class CircledArrow extends Core {
  constructor(ros, topicName) {
    super(ros, topicName, MESSAGE_TYPE_VECTOR3STAMPED);
    this.object = new THREE.Group();
    this.arrow = new Arrow(ros, topicName);
    this.ring = new THREE.Torus();
    this.object.add(this.arrow);
    this.object.add(this.ring);
  }
}

export default CircledArrow;
