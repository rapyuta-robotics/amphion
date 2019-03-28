import * as THREE from 'three';

import Core from '../core';
import { MESSAGE_TYPE_MARKERARRAY, MARKERARRAY_TYPES } from '../utils/constants';
import Arrow from '../primitives/Arrow';
import Cylinder from '../primitives/Cylinder';
import Line from '../primitives/Line';
import Cube from '../primitives/Cube';
import Sphere from '../primitives/Sphere';
import LineSegments from '../primitives/LineSegment';
import Points from '../primitives/Points';
import TriangleList from '../primitives/TriangleList';

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

  static getNewPrimitive(marker) {
    switch(marker.type) {
      case MARKERARRAY_TYPES.CUBE:
        return new Cube();
      case MARKERARRAY_TYPES.SPHERE:
        return new Sphere();
      case MARKERARRAY_TYPES.CYLINDER:
        return new Cylinder();
      case MARKERARRAY_TYPES.LINE_LIST:
        return new LineSegments();
      case MARKERARRAY_TYPES.LINE_STRIP:
        return new Line();
      case MARKERARRAY_TYPES.SPHERE_LIST:
        return new Sphere();
      case MARKERARRAY_TYPES.POINTS:
        return new Points(marker.points);
      case MARKERARRAY_TYPES.TRIANGLE_LIST:
        return new TriangleList(marker.points);
      case MARKERARRAY_TYPES.CUBE_LIST:
        return new Cube();
      case MARKERARRAY_TYPES.ARROW:
      default:
        return new Arrow();
    }
  }

  updateMarker(marker) {
    const { pose: { position, orientation }, scale } = marker;
    const markerObject = this.getMarkerOrCreate(marker);

    markerObject.setTransform({ translation: position, rotation: orientation });
    markerObject.setScale({ x: scale.x, y: scale.y, z: scale.z });
    markerObject.setColor(marker.color);
  }

  getMarkerOrCreate(marker) {
    const id = MarkerArray.getId(marker);
    if (this.objectMap[id]) {
      return this.objectMap[id];
    }
    const object = MarkerArray.getNewPrimitive(marker);
    this.objectMap[id] = object;
    this.object.add(object);
    return object;
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
