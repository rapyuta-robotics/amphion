import { MARKERARRAY_TYPES } from '../utils/constants';
import Arrow from '../primitives/Arrow';
import Cylinder from '../primitives/Cylinder';
import Line from '../primitives/Line';
import Cube from '../primitives/Cube';
import Sphere from '../primitives/Sphere';
import LineSegments from '../primitives/LineSegment';
import Points from '../primitives/Points';
import TriangleList from '../primitives/TriangleList';

export default class MarkerManager {
  constructor(rootObject) {
    this.objectMap = {};
    this.object = rootObject;
  }

  getMarkerOrCreate(marker) {
    const id = MarkerManager.getId(marker);
    if (!this.objectMap[id]) {
      const object = MarkerManager.getNewPrimitive(marker);
      this.objectMap[id] = object;
      this.object.add(object);
    }
    return this.objectMap[id];
  }

  updateMarker(marker) {
    const { pose: { position, orientation }, scale } = marker;
    const markerObject = this.getMarkerOrCreate(marker);

    if (marker.type === MARKERARRAY_TYPES.LINE_STRIP
      || marker.type === MARKERARRAY_TYPES.LINE_LIST) {
      markerObject.updatePoints(marker.points);
    }

    markerObject.setTransform({ translation: position, rotation: orientation });
    if (markerObject.setScale) {
      markerObject.setScale({ x: scale.x, y: scale.y, z: scale.z });
    }
    if (markerObject.setColor) {
      markerObject.setColor(marker.color);
    }
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

  static getId({ ns, id }) {
    return `${ns}-${id}`;
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
}
