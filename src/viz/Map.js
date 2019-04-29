import Core from '../core';
import { MESSAGE_TYPE_OCCUPANCYGRID } from '../utils/constants';
import {
  imageDataToCanvas,
  populateImageDataFromNavMsg
} from '../utils/processing';
import Plane from '../primitives/Plane';

const { THREE } = window;

class Map extends Core {
  constructor(ros, topicName, options = {}) {
    super(ros, topicName, MESSAGE_TYPE_OCCUPANCYGRID);
    this.options = options;
    this.object = new Plane();
    this.object.material.transparent = true;
    this.object.material.opacity = 0.7;
    this.object.material.needsUpdate = true;
  }

  update(message) {
    const {
      data,
      info: {
        height, width, resolution, origin
      }
    } = message;

    const imageData = new ImageData(width, height);
    populateImageDataFromNavMsg(imageData, width, height, data);
    const bitmapCanvas = imageDataToCanvas(imageData);

    this.object.material.map = new THREE.CanvasTexture(bitmapCanvas);
    this.object.material.needsUpdate = true;

    this.object.scale.set(width * resolution, -1 * height * resolution, 1);
    const translatedX = (width * resolution) / 2 + origin.position.x;
    const translatedY = (height * resolution) / 2 + origin.position.y;
    this.object.position.set(translatedX, translatedY, 0);
  }
}

export default Map;
