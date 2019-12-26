import { DoubleSide, FrontSide, CanvasTexture, NearestFilter } from 'three';

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
import Core2 from '../core/core2';
import { RosTopicDataSource } from '../data/ros';
import {
  assertIsMaterial,
  assertIsMesh,
  assertIsMeshBasicMaterial,
} from '../utils/helpers';

class Map extends Core2<RosMessage.OccupancyGrid> {
  private cachedMessage: RosMessage.OccupancyGrid | null = null;
  constructor(
    source: RosTopicDataSource<RosMessage.OccupancyGrid>,
    options = DEFAULT_OPTIONS_MAP,
  ) {
    super({
      sources: [source],
      options: {
        ...DEFAULT_OPTIONS_MAP,
        ...options,
      },
    });
    this.object = new Plane();
    assertIsMesh(this.object);
    assertIsMaterial(this.object.material);
    this.object.material.transparent = true;
    this.updateOptions({
      ...DEFAULT_OPTIONS_MAP,
      ...options,
    });
  }

  updateOptions(options: { [k: string]: any }) {
    assertIsMesh(this.object);
    assertIsMaterial(this.object.material);

    super.updateOptions(options);
    const { alpha, drawBehind } = this.options;
    this.object.material.opacity = alpha;
    if (drawBehind) {
      this.object.material.side = DoubleSide;
    } else {
      this.object.material.side = FrontSide;
    }
    this.object.material.needsUpdate = true;
    if (this.cachedMessage) {
      this.setCanvasData(this.cachedMessage);
    }
  }

  updateCanvasDimensions(message: RosMessage.OccupancyGrid) {
    const {
      info: { height, origin, resolution, width },
    } = message;

    this.object?.scale.set(width * resolution, -1 * height * resolution, 1);
    const translatedX = (width * resolution) / 2 + origin.position.x;
    const translatedY = (height * resolution) / 2 + origin.position.y;
    this.object?.position.set(translatedX, translatedY, 0);
  }

  setCanvasData(message: RosMessage.OccupancyGrid) {
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

    assertIsMesh(this.object);
    assertIsMeshBasicMaterial(this.object.material);
    if (bitmapCanvas) {
      this.object.material.map = new CanvasTexture(bitmapCanvas);
      this.object.material.map.minFilter = NearestFilter;
      this.object.material.map.magFilter = NearestFilter;
      this.object.material.needsUpdate = true;
    }
    this.updateCanvasDimensions(message);
  }

  update(message: RosMessage.OccupancyGrid) {
    super.update(message);
    this.setCanvasData(message);
    this.cachedMessage = message;
  }
}

export default Map;