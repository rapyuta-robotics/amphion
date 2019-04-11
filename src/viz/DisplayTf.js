import _ from 'lodash';
import ROSLIB from 'roslib';

import Core from '../core';
import { TF_TOPICS } from '../utils/constants';

const { THREE } = window;
class DisplayTf extends Core {
  constructor(ros, object) {
    super(ros);
    this.topic = _.map(TF_TOPICS, ([name, messageType]) => new ROSLIB.Topic({
      ros,
      name,
      messageType,
    }));
    this.object = object;
  }

  update(message) {
    super.update(message);
    message.transforms.forEach(({
      child_frame_id: childFrame,
      header: { frame_id: parentFrame },
      transform: {
        translation: { x, y, z },
        rotation: {
          x: rx, y: ry, z: rz, w: rw
        },
      },
    }) => {
      const [childObject, parentObject] = [
        this.getObjectOrCreate(childFrame),
        this.getObjectOrCreate(parentFrame),
      ];

      childObject.position.set(x, y, z);
      childObject.quaternion.set(rx, ry, rz, rw);
      parentObject.add(childObject);
    });
  }

  getObjectOrCreate(frameId) {
    const existingFrame = this.object.getObjectByName(frameId);
    if (existingFrame) {
      return existingFrame;
    }

    const newFrame = new THREE.Group();
    newFrame.name = frameId;
    this.object.add(newFrame);
    return newFrame;
  }
}

export default DisplayTf;
