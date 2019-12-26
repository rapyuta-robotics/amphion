import { DEFAULT_OPTIONS_IMAGE } from '../utils/constants';
import { populateImageDataFromImageMsg } from '../utils/processing';
import LiveCore from '../core/live';
import { DataSource } from '../data';
import { assertIsDefined } from '../utils/helpers';

class Image extends LiveCore<RosMessage.Image, HTMLCanvasElement> {
  private readonly shadowObject: HTMLCanvasElement;

  constructor(
    source: DataSource<RosMessage.Image>,
    options = DEFAULT_OPTIONS_IMAGE,
  ) {
    super({
      sources: [source],
      options: {
        ...DEFAULT_OPTIONS_IMAGE,
        ...options,
      },
    });
    const { height, width } = this.options;
    this.object = document.createElement('canvas');
    this.shadowObject = document.createElement('canvas');
    this.object.width = width;
    this.object.height = height;
  }

  applyImageData(message: RosMessage.Image) {
    const { encoding, height, width } = message;
    assertIsDefined(this.object);
    const ctx = this.object.getContext('2d');
    assertIsDefined(ctx);
    const shadowCtx = this.shadowObject.getContext('2d');
    assertIsDefined(shadowCtx);
    const imgData = shadowCtx.createImageData(width, height);

    const aspectRatio = width / height;
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

  updateDimensions(width: number, height: number) {
    assertIsDefined(this.object);
    this.object.width = width;
    this.object.height = height;
  }

  update(message: RosMessage.Image) {
    const { height, width } = message;
    this.shadowObject.width = width;
    this.shadowObject.height = height;
    this.applyImageData(message);
  }

  hide = () => {
    assertIsDefined(this.object);
    this.object.style.visibility = 'hidden';
  };

  show = () => {
    assertIsDefined(this.object);
    this.object.style.visibility = 'visible';
  };
}

export default Image;
