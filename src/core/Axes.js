import Core from "./Index";
import {MESSAGE_TYPE_MARKER} from "../index";
import Arrow from "./Arrow";

class Axes extends Core {
  constructor(ros, topicName) {
    super(ros, topicName, MESSAGE_TYPE_MARKER);
    this.object = new THREE.Group();
    this.x = new Arrow(ros, topicName);
    this.y = new Arrow(ros, topicName);
    this.z = new Arrow(ros, topicName);
    this.object.add(this.x);
    this.object.add(this.y);
    this.object.add(this.z);
  }
}

export default Axes;
