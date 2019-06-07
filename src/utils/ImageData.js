export const IMAGE_ENCODINGS = {
  RGB8: 'rgb8',
  RGBA8: 'rgba8',
  RGB16: 'rgb16',
  RGBA16: 'rgba16',
  BGR8: 'bgr8',
  BGRA8: 'bgra8',
  BGR16: 'bgr16',
  BGRA16: 'bgra16',
  MONO8: 'mono8',
  MONO16: 'mono16',

  // OpenCV CvMat types
  TYPE_8UC1: '8UC1',
  TYPE_8UC2: '8UC2',
  TYPE_8UC3: '8UC3',
  TYPE_8UC4: '8UC4',
  TYPE_8SC1: '8SC1',
  TYPE_8SC2: '8SC2',
  TYPE_8SC3: '8SC3',
  TYPE_8SC4: '8SC4',
  TYPE_16UC1: '16UC1',
  TYPE_16UC2: '16UC2',
  TYPE_16UC3: '16UC3',
  TYPE_16UC4: '16UC4',
  TYPE_16SC1: '16SC1',
  TYPE_16SC2: '16SC2',
  TYPE_16SC3: '16SC3',
  TYPE_16SC4: '16SC4',
  TYPE_32SC1: '32SC1',
  TYPE_32SC2: '32SC2',
  TYPE_32SC3: '32SC3',
  TYPE_32SC4: '32SC4',
  TYPE_32FC1: '32FC1',
  TYPE_32FC2: '32FC2',
  TYPE_32FC3: '32FC3',
  TYPE_32FC4: '32FC4',
  TYPE_64FC1: '64FC1',
  TYPE_64FC2: '64FC2',
  TYPE_64FC3: '64FC3',
  TYPE_64FC4: '64FC4',

  // Bayer encodings
  BAYER_RGGB8: 'bayer_rggb8',
  BAYER_BGGR8: 'bayer_bggr8',
  BAYER_GBRG8: 'bayer_gbrg8',
  BAYER_GRBG8: 'bayer_grbg8',
  BAYER_RGGB16: 'bayer_rggb16',
  BAYER_BGGR16: 'bayer_bggr16',
  BAYER_GBRG16: 'bayer_gbrg16',
  BAYER_GRBG16: 'bayer_grbg16',

  // Miscellaneous
  // This is the UYVY version of YUV422 codec http://www.fourcc.org/yuv.php#UYVY
  // with an 8-bit depth
  YUV422: 'yuv422'
};

// Prefixes for abstract image encodings
export const ABSTRACT_ENCODING_PREFIXES = [
  '8UC',
  '8SC',
  '16UC',
  '16SC',
  '32SC',
  '2FC',
  '64FC'
];

class ImageData {
  setData(options) {
    const {
      encoder, width, height, data
    } = options;

    this.encoder = encoder;
    this.width = width;
    this.height = height;
    this.data = data;
    this.decodedDataView = this.getDataView();
  }

  getDataView() {
    const newData = [];

    atob(this.data)
      .split('')
      .forEach((string) => {
        newData.push(string.charCodeAt(0));
      });

    return new DataView(Uint8Array.from(newData).buffer);
  }

  getImgData(options, imgDataRef) {
    if (!options || !imgDataRef) {
      return null;
    }

    this.setImgData(options);
    this.convertToRGBA(imgDataRef);

    return true;
  }

  convertToRGBA() {
    switch (this.encoding) {
      case 'mono8': {
        let j = 0;
        for (let i = 0; i < step * height; i++) {
          imgDataRef.data[j++] = decodedDataView.getUint8(i, !isBigEndian);
          imgDataRef.data[j++] = decodedDataView.getUint8(i, !isBigEndian);
          imgDataRef.data[j++] = decodedDataView.getUint8(i, !isBigEndian);
          imgDataRef.data[j++] = 255;
        }
        break;
      }
      case 'bgr8': {
        const offset = 3;

        let j = 0;
        for (let i = 0; i < step * height; i += offset) {
          imgDataRef.data[j++] = decodedDataView.getUint8(i + 2, !isBigEndian);
          imgDataRef.data[j++] = decodedDataView.getUint8(i + 0, !isBigEndian);
          imgDataRef.data[j++] = decodedDataView.getUint8(i + 1, !isBigEndian);
          imgDataRef.data[j++] = 255;
        }
        break;
      }
      default:
        break;
    }
  }

  static isColor(encoding) {
    return (
      encoding === RGB8
      || encoding === BGR8
      || encoding === RGBA8
      || encoding === BGRA8
      || encoding === RGB16
      || encoding === BGR16
      || encoding === RGBA16
      || encoding === BGRA16
    );
  }

  static isMono(encoding) {
    return encoding === MONO8 || encoding === MONO16;
  }

  static isBayer(encoding) {
    return (
      encoding === BAYER_RGGB8
      || encoding === BAYER_BGGR8
      || encoding === BAYER_GBRG8
      || encoding === BAYER_GRBG8
      || encoding === BAYER_RGGB16
      || encoding === BAYER_BGGR16
      || encoding === BAYER_GBRG16
      || encoding === BAYER_GRBG16
    );
  }

  static hasAlpha(encoding) {
    return (
      encoding === RGBA8
      || encoding === BGRA8
      || encoding === RGBA16
      || encoding === BGRA16
    );
  }

  static numChannels(encoding) {
    if (encoding === MONO8
      || encoding === MONO16) return 1;
    if (encoding === BGR8
      || encoding === RGB8
      || encoding === BGR16
      || encoding === RGB16) return 3;
    if (encoding === BGRA8
      || encoding === RGBA8
      || encoding === BGRA16
      || encoding === RGBA16) return 4;
    if (encoding === BAYER_RGGB8
      || encoding === BAYER_BGGR8
      || encoding === BAYER_GBRG8
      || encoding === BAYER_GRBG8
      || encoding === BAYER_RGGB16
      || encoding === BAYER_BGGR16
      || encoding === BAYER_GBRG16
      || encoding === BAYER_GRBG16) return 1;


  }
}
