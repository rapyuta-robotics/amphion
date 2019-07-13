import * as THREE from 'three';
import ROSLIB from 'roslib';

import Core from '../core';
import { TF_TOPICS } from '../utils/constants';
import TfFrame from '../primitives/TfFrame';

class Tf extends Core {
  constructor(ros, options = {}) {
    super(ros);
    this.topic = TF_TOPICS.map(([name, messageType]) => new ROSLIB.Topic({
      ros,
      name,
      messageType,
    }));
    this.object = new THREE.Group();
    this.object.name = 'test';
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

      if (childFrame.position.length() < 0.1) {
        childFrame.arrow.visible = false;
      } else {
        childFrame.arrow.lookAt(parentFrame.getWorldPosition(new THREE.Vector3()));
        childFrame.arrow.rotateY(-Math.PI / 2);
        childFrame.arrow.visible = true;

        const arrowConeLength = childFrame.arrow.cone.scale.y;
        childFrame.arrow.setShaftDimensions({
          length: childFrame.position.length() - arrowConeLength
        });
      }
    });

    this.object.children.forEach((child) => {
      child.arrow.visible = false;
    });
  }

  getFrameOrCreate(frameId) {
    const existingFrame = this.object.getObjectByName(TfFrame.getName(frameId));
    if (existingFrame) {
      return existingFrame;
    }

    const newFrame = new TfFrame(frameId);
    this.object.add(newFrame);
    return newFrame;
  }
}

export default Tf;
