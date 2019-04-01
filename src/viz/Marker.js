import Core from '../core';
import { MARKERARRAY_TYPES, MESSAGE_TYPE_MARKER } from '../utils/constants';
import Arrow from '../primitives/Arrow';
import Cylinder from '../primitives/Cylinder';
import Line from '../primitives/Line';
import Cube from '../primitives/Cube';
import Sphere from '../primitives/Sphere';
import LineSegments from '../primitives/LineSegment';
import Points from '../primitives/Points';
import TriangleList from '../primitives/TriangleList';

class Marker extends Core {
  constructor(ros, topicName) {
    super(ros, topicName, MESSAGE_TYPE_MARKER);
    this.object = Marker.getNewPrimitive();
  }

  update(message) {
    if (message.marker.type !== this.object.type) {
      this.resetMarker();
    }
    this.updateMarker(message);
  }

  resetMarker() {
    // Edit this.object with getNewPrimitive without replacing
  }

  static getNewPrimitive(marker) {
    switch (marker.type) {
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
    this.object.setTransform({ translation: position, rotation: orientation });
    this.object.setScale({ x: scale.x, y: scale.y, z: scale.z });
    this.object.setColor(marker.color);
  }
}

export default Marker;
