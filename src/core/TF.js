import Core from './Index';
import { MESSAGE_TYPE_TF } from './messages';
import Axes from './Axes';

class TF extends Core {
  constructor(ros, topicName, scene) {
    super(ros, topicName, MESSAGE_TYPE_TF);

    this.objectsFrames = {};
    this.scene = scene;
  }

  update(messages) {
    messages.transforms.forEach((transform) => {
      const id = transform.header.frame_id;

      if (!this.checkIfExists(id)) {
        this.objectsFrames[id] = {};
        this.objectsFrames[id].object = new Axes(this.scene);
        this.objectsFrames[id].object.setTransform(transform.transform);
      } else {
        this.objectsFrames[id].object.updateTransform(transform.transform);
      }
    });
  }

  checkIfExists(frameId) {
    if (this.objectsFrames[frameId]) {
      return true;
    }

    return false;
  }
}

export default TF;
