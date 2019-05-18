import _ from 'lodash';

import ROSLIB from 'roslib';
import { MARKERARRAY_TYPES } from '../utils/constants';
import Arrow from '../primitives/Arrow';
import Cylinder from '../primitives/Cylinder';
import Line from '../primitives/Line';
import Cube from '../primitives/Cube';
import CubeList from '../primitives/CubeList';
import Sphere from '../primitives/Sphere';
import LineSegments from '../primitives/LineSegment';
import Points from '../primitives/Points';
import TriangleList from '../primitives/TriangleList';
import Group from '../primitives/Group';
import {
  SHAFT_LENGTH,
  SHAFT_RADIUS,
  HEAD_LENGTH,
  HEAD_RADIUS
} from './Pose';
import SphereList from '../primitives/SphereList';

export default class MarkerManager {
  constructor(rootObject, onChangeCb) {
    this.objectMap = {};
    this.object = rootObject;
    this.namespaces = {};
    this.onChangeCb = onChangeCb;
  }

  getMarkerOrCreate(marker) {
    const id = MarkerManager.getId(marker);
    if (!this.objectMap[id]) {
      const object = MarkerManager.getNewPrimitive(marker);
      this.objectMap[id] = object;
      this.object.add(object);
    }

    this.objectMap[id].visible = this.namespaces[marker.ns];
    return this.objectMap[id];
  }

  extractNameSpace(str) {
    const tokens = str.split('-');
    return tokens[0];
  }

  setQueueSize(queueSize, context) {
    context.unsubscribe();

    context.queueSize = queueSize;

    context.topic = new ROSLIB.Topic({
      ros: context.ros,
      name: context.topicName,
      messageType: context.messageType,
      queue_size: queueSize,
    });

    context.subscribe();
  }

  updateOptions(options, context) {
    const { queueSize, namespaces } = options;
    const { queueSize: currentQueueSize } = context;

    if (currentQueueSize !== queueSize) {
      this.setQueueSize(queueSize, context);
    }

    this.namespaces = namespaces;

    _.each(this.objectMap, (object, key) => {
      const namespace = this.extractNameSpace(key);
      object.visible = this.namespaces[namespace];
    });
  }

  onChange() {
    this.onChangeCb();
  }

  updateMarker(marker) {
    const {
      pose: { position, orientation }, scale, color, colors, points
    } = marker;
    const markerObject = this.getMarkerOrCreate(marker);

    if (markerObject.updatePoints) {
      markerObject.updatePoints(points, colors, marker);
    }

    markerObject.setTransform({ translation: position, rotation: orientation });

    // To avoid settings these properties for list types: LINE, TRIANGLE, CUBELIST etc
    if (markerObject.setScale && !markerObject.updatePoints) {
      markerObject.setScale({ x: scale.x, y: scale.y, z: scale.z });
    }
    if (markerObject.setColor && colors.length <= 0) {
      markerObject.setColor(color);
    }

    const { ns } = marker;
    if (!(ns in this.namespaces)) {
      this.namespaces[ns] = true;
      this.onChange();
    }
  }

  removeObject(id) {
    const obj = this.objectMap[id];
    obj.parent.remove(obj);
    delete this.objectMap[id];
  }

  reset() {
    this.namespaces = {};
    this.onChange();

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
      case MARKERARRAY_TYPES.CYLINDER: {
        const group = new Group();
        group.add(new Cylinder());
        return group;
      }
      case MARKERARRAY_TYPES.LINE_LIST:
        return new LineSegments();
      case MARKERARRAY_TYPES.LINE_STRIP:
        return new Line();
      case MARKERARRAY_TYPES.SPHERE_LIST:
        return new SphereList();
      case MARKERARRAY_TYPES.POINTS:
        return new Points();
      case MARKERARRAY_TYPES.TRIANGLE_LIST:
        return new TriangleList();
      case MARKERARRAY_TYPES.CUBE_LIST:
        return new CubeList();
      case MARKERARRAY_TYPES.ARROW:
      default: {
        const arrow = new Arrow();
        arrow.setHeadDimensions({ radius: HEAD_RADIUS, length: HEAD_LENGTH });
        arrow.setShaftDimensions({ radius: SHAFT_RADIUS, length: SHAFT_LENGTH });
        return arrow;
      }
    }
  }
}
