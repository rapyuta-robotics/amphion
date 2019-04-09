import * as THREE from 'three';

import Core from '../core';
import { MESSAGE_TYPE_MARKERARRAY, MARKERARRAY_TYPES } from '../utils/constants';
import Marker from './Marker';
import MarkerManager from './MarkerManager';

class MarkerArray extends Core {
  constructor(ros, topicName) {
    super(ros, topicName, MESSAGE_TYPE_MARKERARRAY);
    this.object = new THREE.Group();
    this.markerManager = new MarkerManager(this.object);
  }

  update(message) {
    if (message.markers.length > 0) {
      message.markers.forEach((marker) => {
        this.markerManager.updateMarker(marker);
      });
    }
  }

  reset() {
    this.markerManager.reset();
  }
}

export default MarkerArray;
