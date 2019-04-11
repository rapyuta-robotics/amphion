import * as THREE from 'three';

import Core from '../core';
import { MESSAGE_TYPE_TF } from '../utils/constants';
import TfFrame from '../primitives/TfFrame';

class Tf extends Core {
  constructor(ros, topicName, options = {}, callback) {
    super(ros, topicName, options.messageType || MESSAGE_TYPE_TF);

    this.object = new THREE.Group();
    this.callback = callback;
  }

  update(message) {
    const { transforms } = message;
    transforms.forEach(({
      header: {
        frame_id: parentFrameId,
      },
      child_frame_id: childFrameId,
      transform,
    }) => {
      const [
        childFrame,
        parentFrame,
      ] = [
        this.getFrameOrCreate(childFrameId),
        this.getFrameOrCreate(parentFrameId),
      ];
      parentFrame.add(childFrame);
      childFrame.setTransform(transform);
      childFrame.arrow.lookAt(parentFrame.position);
      childFrame.arrow.rotateY(-Math.PI / 2);
      const arrowLength = childFrame.position.length();
      childFrame.arrow.scale.setX(arrowLength || 0.0001);
    });

    if (this.callback) {
      this.callback(message);
    }
  }

  getFrameOrCreate(frameId) {
    const existingFrame = this.object.getObjectByName(frameId);
    if (existingFrame) {
      return existingFrame;
    }

    const newFrame = new TfFrame(frameId);
    this.object.add(newFrame);
    return newFrame;
  }
}

export default Tf;
