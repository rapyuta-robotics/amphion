import * as THREE from 'three';

import Core from '../core';
import { MESSAGE_TYPE_MARKERARRAY } from '../utils/constants';
import Marker from './Marker';

class MarkerArray extends Core {
  constructor(ros, topicName) {
    super(ros, topicName, MESSAGE_TYPE_MARKERARRAY);
    this.object = new THREE.Group();
    this.objectMap = {};
  }

  update(message) {
    if (message.markers.length > 0) {
      message.markers.forEach((marker) => {
        this.updateMarker(marker);
      });
    }
  }

  static getId({ ns, id }) {
    return `${ns}-${id}`;
  }

  updateMarker(marker) {
    const { pose: { position, orientation }, scale } = marker;
    const markerObject = this.getMarkerOrCreate(marker);

    markerObject.setTransform({ translation: position, rotation: orientation });
    if (markerObject.setScale) {
      markerObject.setScale({ x: scale.x, y: scale.y, z: scale.z });
    }
    if (markerObject.setColor) {
      markerObject.setColor(marker.color);
    }
  }

  getMarkerOrCreate(marker) {
    const id = MarkerArray.getId(marker);
    if (!this.objectMap[id]) {
      const object = Marker.getNewPrimitive(marker);
      this.objectMap[id] = object;
      this.object.add(object);
    }
    return this.objectMap[id];
  }

  removeObject(id) {
    const obj = this.objectMap[id];
    obj.parent.remove(obj);
    delete this.objectMap[id];
  }

  reset() {
    Object.keys(this.objectMap).forEach((id) => {
      this.removeObject(id);
    });
  }
}

export default MarkerArray;
