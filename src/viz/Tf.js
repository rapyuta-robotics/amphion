import _ from 'lodash';
import ROSLIB from 'roslib';

const { THREE } = window;

import Core from '../core';
import { TF_TOPICS } from '../utils/constants';
import TfFrame from '../primitives/TfFrame';

class Tf extends Core {
  constructor(ros) {
    super(ros);
    this.topic = _.map(TF_TOPICS, ([name, messageType]) => new ROSLIB.Topic({
      ros,
      name,
      messageType,
    }));
    this.object = new THREE.Group();
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
      childFrame.arrow.rotateY(-Math.PI / 2); //.rotateX(Math.PI / 2);
      const arrowLength = childFrame.position.length();
      childFrame.arrow.scale.setX(arrowLength || 0.0001);
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
