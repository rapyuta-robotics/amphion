import * as THREE from 'three';

import Core from '../core';
import { MESSAGE_TYPE_TF } from '../utils/constants';
import Axes from '../core/Axes';

class Tf extends Core {
  constructor(ros, topicName) {
    super(ros, topicName, MESSAGE_TYPE_TF);

    this.object = new THREE.Group();
  }

  update({ transforms }) {
    transforms.forEach(({
      header: {
        frame_id: parentFrameId,
      },
      child_frame_id: childFrameId,
      transform: {
        translation,
        rotation,
      }
    }) => {
      const [
        childFrame,
        parentFrame,
      ] = [
        this.getObjectOrCreate(childFrameId),
        this.getObjectOrCreate(parentFrameId),
      ];
      parentFrame.add(childFrame);
      childFrame.setTransform({
        translation,
        rotation,
      });
    });
  }

  getObjectOrCreate(frameId) {
    const existingFrame = this.object.getObjectByName(frameId);
    if (existingFrame) {
      return existingFrame;
    }

    const newFrame = new Axes();
    newFrame.name = frameId;
    this.object.add(newFrame);
    return newFrame;
  }
}

export default Tf;
