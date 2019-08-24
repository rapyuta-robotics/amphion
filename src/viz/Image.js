import Core from '../core';
import { DEFAULT_OPTIONS_IMAGE, MESSAGE_TYPE_IMAGE } from '../utils/constants';
import { populateImageDataFromImageMsg } from '../utils/processing';

class Image extends Core {
  constructor(ros, topicName, options = DEFAULT_OPTIONS_IMAGE) {
    super(ros, topicName, MESSAGE_TYPE_IMAGE, {
      ...DEFAULT_OPTIONS_IMAGE,
      ...options,
    });
    this.object = document.createElement('canvas');
    this.shadowObject = document.createElement('canvas');
    this.updateOptions({
      ...DEFAULT_OPTIONS_IMAGE,
      ...options,
    });
  }

  applyImageData(message) {
    const { encoding, height, width } = message;

    const aspectRatio = width / height;
    const ctx = this.object.getContext('2d');
    const shadowCtx = this.shadowObject.getContext('2d');
    const imgData = shadowCtx.createImageData(width, height);

    switch (encoding) {
      // not using encoding.find(bayer) because js switch statement
      // is much faster
      case 'bayer_rggb8':
      case 'bayer_bggr8':
      case 'bayer_gbrg8':
      case 'bayer_grbg8':
      case 'bayer_rggb16':
      case 'bayer_bggr16':
      case 'bayer_gbrg16':
      case 'bayer_grbg16':
      case '8UC1':
      case '8SC1':
      case 'mono8': {
        populateImageDataFromImageMsg(message, 1, [0, 0, 0], imgData);
        break;
      }
      case '8UC3':
      case '8SC3':
      case 'bgr8': {
        populateImageDataFromImageMsg(message, 3, [2, 1, 0], imgData);
        break;
      }
      case '8UC4':
      case '8SC4':
      case 'bgra8': {
        populateImageDataFromImageMsg(message, 4, [2, 1, 0, 3], imgData);
        break;
      }
      case 'rgb8': {
        populateImageDataFromImageMsg(message, 3, [0, 1, 2], imgData);
        break;
      }
      case 'rgba8': {
        populateImageDataFromImageMsg(message, 4, [0, 1, 2, 3], imgData);
        break;
      }
      default:
        break;
    }

    ctx.clearRect(0, 0, this.object.width, this.object.height);
    ctx.fillStyle = '#000';
    ctx.fillRect(0, 0, this.object.width, this.object.height);
    shadowCtx.clearRect(
      0,
      0,
      this.shadowObject.width,
      this.shadowObject.height,
    );
    shadowCtx.putImageData(imgData, 0, 0);

    const scaledImageHeight = this.object.width / aspectRatio;
    const scaledImageWidth = this.object.height * aspectRatio;

    if (aspectRatio >= this.object.width / this.object.height) {
      ctx.drawImage(
        this.shadowObject,
        0,
        0,
        width,
        height,
        0,
        (this.object.height - scaledImageHeight) / 2,
        this.object.width,
        scaledImageHeight,
      );
    } else {
      ctx.drawImage(
        this.shadowObject,
        0,
        0,
        width,
        height,
        (this.object.width - scaledImageWidth) / 2,
        0,
        scaledImageWidth,
        this.object.height,
      );
    }
  }

  updateDimensions(width, height) {
    this.object.width = width;
    this.object.height = height;
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
