import * as THREE from 'three';
import Core from '../core';
import { MESSAGE_TYPE_DISPLAYTF } from '../utils/constants';

class DisplayTf extends Core {
  constructor(ros, topicName) {
    super(ros, topicName, MESSAGE_TYPE_DISPLAYTF);
    this.object = new THREE.Group();
  }

  update(message) {
    super.update(message);
    message.transforms.forEach((t) => {
      const {
        child_frame_id: childFrame,
        header: { frame_id: parentFrame },
        transform: {
          translation: { x, y, z },
          rotation: {
            x: rx, y: ry, z: rz, w: rw
          },
        },
      } = t;

      const [trimmedChildFrame, trimmedParentFrame] = [
        _.trimStart(childFrame, '/'),
        _.trimStart(parentFrame, '/'),
      ];

      const childObject = this.object.getObjectByName(trimmedChildFrame);
      const parentObject = this.object.getObjectByName(trimmedParentFrame);

      if (childObject && parentObject) {
        childObject.position.set(x, y, z);
        childObject.quaternion.set(rx, ry, rz, rw);
        parentObject.add(childObject);
      } else if (childObject && trimmedParentFrame === 'world') {
        childObject.position.set(x, y, z);
        childObject.quaternion.set(rx, ry, rz, rw);
        this.object.add(childObject);
      }
    });
  }
}

export default DisplayTf;
