import * as THREE from 'three';
import Core from '../core';
import { MESSAGE_TYPE_IMAGE } from '../utils/constants';


class Image extends Core {
  constructor(ros, topicName, imageEle) {
    super(ros, topicName, MESSAGE_TYPE_IMAGE);
    this.object = new THREE.Group();
    this.imageEle = imageEle;
  }

  update(message) {
    const { data } = message;
    const { width, height } = message;
    const ctx = this.imageEle.getContext('2d');
    const imgData = ctx.createImageData(width, height);
    const encodeToUInt8 = new TextEncoder().encode(data);

    // depends on the data being sent
    // set to 3 since considering for bgr8 formal only
    const offset = 3;

    for (let i = 0; i < encodeToUInt8.length; i += offset) {
      // Since the encode data is in the bgr order
      imgData.data[i + 0] = encodeToUInt8[i + 2];
      imgData.data[i + 1] = encodeToUInt8[i + 1];
      imgData.data[i + 2] = encodeToUInt8[i + 0];
      imgData.data[i + 3] = 255;
    }

    ctx.putImageData(imgData, 0, 0);
  }


}

export default Image;
