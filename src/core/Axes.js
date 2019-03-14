import Core from './Index';
import { MESSAGE_TYPE_MARKER } from './messages';
import Arrow from './Arrow';

class Axes extends Core {
  constructor(ros, topicName, scene) {
    super(ros, topicName, MESSAGE_TYPE_MARKER);
    this.object = new THREE.Group();
    this.x = new Arrow(scene);
    this.y = new Arrow(scene);
    this.z = new Arrow(scene);
    this.object.add(this.x.object);
    this.object.add(this.y.object);
    this.object.add(this.z.object);
  }
}

export default Axes;
