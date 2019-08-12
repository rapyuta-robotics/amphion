import Core from '../core';
import { DEFAULT_OPTIONS_IMAGE, MESSAGE_TYPE_IMAGE } from '../utils/constants';

class Image extends Core {
  constructor(ros, topicName, options = DEFAULT_OPTIONS_IMAGE) {
    super(ros, topicName, MESSAGE_TYPE_IMAGE, options);
    this.object = document.createElement('canvas');
    this.updateOptions({
      ...DEFAULT_OPTIONS_IMAGE,
      ...options,
    });
  }

  applyImageData(message) {
    const {
      data,
      encoding,
      height,
      is_bigendian: isBigEndian,
      step,
      width,
    } = message;

    const ctx = this.object.getContext('2d');
    const imgData = ctx.createImageData(width, height);

    const encodeToUInt8 = Uint8Array.from(data);
    const encodedDataView = new DataView(encodeToUInt8.buffer);

    switch (encoding) {
      case 'mono8': {
        let j = 0;
        for (let i = 0; i < step * height; i++) {
          imgData.data[j++] = encodedDataView.getUint8(i, !isBigEndian);
          imgData.data[j++] = encodedDataView.getUint8(i, !isBigEndian);
          imgData.data[j++] = encodedDataView.getUint8(i, !isBigEndian);
          imgData.data[j++] = 255;
        }
        break;
      }
      case 'bgr8': {
        const offset = 3;

        let j = 0;
        for (let i = 0; i < step * height; i += offset) {
          imgData.data[j++] = encodedDataView.getUint8(i + 2, !isBigEndian);
          imgData.data[j++] = encodedDataView.getUint8(i + 0, !isBigEndian);
          imgData.data[j++] = encodedDataView.getUint8(i + 1, !isBigEndian);
          imgData.data[j++] = 255;
        }
        break;
      }
      case 'rgb8': {
        const offset = 3;

        let j = 0;
        for (let i = 0; i < step * height; i += offset) {
          imgData.data[j++] = encodedDataView.getUint8(i + 0, !isBigEndian);
          imgData.data[j++] = encodedDataView.getUint8(i + 1, !isBigEndian);
          imgData.data[j++] = encodedDataView.getUint8(i + 2, !isBigEndian);
          imgData.data[j++] = 255;
        }
        break;
      }
      default:
        break;
    }

    ctx.putImageData(imgData, 0, 0);
  }

  update(message) {
    const { height, width } = message;

    this.object.width = width;
    this.object.height = height;

    this.applyImageData(message);
  }
}

export default Image;
