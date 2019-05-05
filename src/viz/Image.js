import Core from '../core';
import { MESSAGE_TYPE_IMAGE } from '../utils/constants';


const { THREE } = window;

const BASE64 =  'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=';
function decode64(x) {
  const a = [];
  let z = 0;
  let bits = 0;

  for (let i = 0, len = x.length; i < len; i++) {
    z += BASE64.indexOf(x[i]);
    bits += 6;
    if (bits >= 8) {
      bits -= 8;
      a.push(z >> bits);
      z &= ((2 ** bits) - 1);
    }
    z <<= 6;
  }
  return a;
}

class Image extends Core {
  constructor(ros, topicName, imageEle) {
    super(ros, topicName, MESSAGE_TYPE_IMAGE);
    this.object = new THREE.Group();
  }

  setImageRef(ref) {
    this.imageCanvas = ref;
  }

  applyImageData(message) {
    const { data, step, width, height, is_bigendian: isBigEndian, encoding } = message;

    const ctx = this.imageCanvas.getContext('2d');
    const imgData = ctx.createImageData(width, height);

    const decodedData = atob(data);
    const newData = [];
    decodedData.split('').forEach((data, index) => {
      newData.push(decodedData.charCodeAt(index));
    });

    const encodeToUInt8 = Uint8Array.from(newData);
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
        for (let i = 0; i <  step * height; i += offset) {
          imgData.data[j++] = encodedDataView.getUint8(i + 2, !isBigEndian);
          imgData.data[j++] = encodedDataView.getUint8(i + 0,   !isBigEndian);
          imgData.data[j++] = encodedDataView.getUint8(i + 1, !isBigEndian);
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
    if (this.imageCanvas) {
      const { width, height } = message;

      this.imageCanvas.width = width;
      this.imageCanvas.height = height;

      this.applyImageData(message);
    }
  }
}

export default Image;
