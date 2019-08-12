import Core from '../core';
import { DEFAULT_OPTIONS_IMAGE, MESSAGE_TYPE_IMAGE } from '../utils/constants';

class Image extends Core {
  constructor(ros, topicName, options = DEFAULT_OPTIONS_IMAGE) {
    super(ros, topicName, MESSAGE_TYPE_IMAGE, {
      ...DEFAULT_OPTIONS_IMAGE,
      ...options,
    });
    this.object = document.createElement('canvas');
    this.shadowObject = document.createElement('canvas');
    this.ratioX = 1;
    this.ratioY = 1;
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
    const shadowCtx = this.shadowObject.getContext('2d');
    const imgData = shadowCtx.createImageData(width, height);

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

    shadowCtx.putImageData(imgData, 0, 0);
    ctx.drawImage(
      this.shadowObject,
      0,
      0,
      width * this.ratioX,
      height * this.ratioY,
    );
  }

  updateDimensions(width, height) {
    this.object.width = width;
    this.object.height = height;
    this.ratioX = width / this.shadowObject.width;
    this.ratioY = height / this.shadowObject.height;
  }

  updateOptions(options) {
    super.updateOptions(options);
    const { defaultHeight, defaultWidth } = this.options;
    this.object.width = defaultWidth;
    this.object.height = defaultHeight;
  }

  update(message) {
    const { height, width } = message;

    this.shadowObject.width = width;
    this.shadowObject.height = height;
    this.ratioX = this.object.width / width;
    this.ratioY = this.object.height / height;

    this.applyImageData(message);
  }

  hide() {
    this.object.style.visibility = 'hidden';
  }

  show() {
    this.object.style.visibility = 'visible';
  }
}

export default Image;
