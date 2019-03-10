import Core from "./Index";
import {MESSAGE_TYPE_VECTOR3STAMPED} from "../index";

class Arrow extends Core {
  constructor(ros, topicName) {
    super(ros, topicName, MESSAGE_TYPE_VECTOR3STAMPED);
    this.object = new THREE.Group();
  }
}

export default Arrow;
