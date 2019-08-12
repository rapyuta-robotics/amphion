import * as THREE from 'three';

import Core from '../core';
import {
  DEFAULT_OPTIONS_MAP,
  MAP_COLOR_SCHEMES,
  MESSAGE_TYPE_OCCUPANCYGRID,
} from '../utils/constants';
import {
  imageDataToCanvas,
  populateImageDataFromNavMsg,
  populateRawImageDataFromNavMsg,
  populateConstImageDataFromNavMsg,
} from '../utils/processing';
import Plane from '../primitives/Plane';

class Map extends Core {
  constructor(ros, topicName, options = DEFAULT_OPTIONS_MAP) {
    super(ros, topicName, MESSAGE_TYPE_OCCUPANCYGRID, options);
    this.object = new Plane();
    this.object.material.transparent = true;
    this.updateOptions({
      ...DEFAULT_OPTIONS_MAP,
      ...options,
    });
  }

  onMessage(callback) {
    this.callback = callback;
  }

  updateOptions(options) {
    super.updateOptions(options);
    const { alpha, drawBehind } = this.options;

    this.object.material.opacity = alpha;

    if (drawBehind) {
      this.object.material.side = THREE.DoubleSide;
    } else {
      this.object.material.side = THREE.FrontSide;
    }
    this.object.material.needsUpdate = true;
    if (this.prevMessage) {
      this.setCanvasData(this.prevMessage);
    }
  }

  updateCanvasDimensions(message) {
    const {
      info: { height, width, resolution, origin },
    } = message;

    this.object.scale.set(width * resolution, -1 * height * resolution, 1);
    const translatedX = (width * resolution) / 2 + origin.position.x;
    const translatedY = (height * resolution) / 2 + origin.position.y;
    this.object.position.set(translatedX, translatedY, 0);
  }

  setCanvasData(message) {
    const { colorScheme } = this.options;
    const {
      data,
      info: { height, width },
    } = message;

    const imageData = new ImageData(width, height);
    let bitmapCanvas = null;

    switch (colorScheme) {
      case MAP_COLOR_SCHEMES.MAP:
        populateImageDataFromNavMsg(imageData, width, height, data);
        bitmapCanvas = imageDataToCanvas(imageData);
        break;
      case MAP_COLOR_SCHEMES.CONST_MAP:
        populateConstImageDataFromNavMsg(imageData, width, height, data);
        bitmapCanvas = imageDataToCanvas(imageData);
        break;
      case MAP_COLOR_SCHEMES.RAW:
        populateRawImageDataFromNavMsg(imageData, width, height, data);
        bitmapCanvas = imageDataToCanvas(imageData);
        break;
      default:
        break;
    }

    this.object.material.map = new THREE.CanvasTexture(bitmapCanvas);
    this.object.material.map.minFilter = THREE.NearestFilter;
    this.object.material.map.magFilter = THREE.NearestFilter;
    this.object.material.needsUpdate = true;

    this.updateCanvasDimensions(message);
  }

  update(message) {
    super.update(message);
    if (this.callback) {
      this.callback(message);
    }

    this.setCanvasData(message);
    this.prevMessage = message;
  }
}

export default Map;
