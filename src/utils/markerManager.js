import ROSLIB from 'roslib';
import {
  DEFAULT_CONE_HEIGHT, DEFAULT_CONE_RADIUS,
  DEFAULT_CYLINDER_HEIGHT,
  DEFAULT_CYLINDER_RADIUS,
  MARKER_OBJECT_TYPES,
} from '../utils/constants';
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
import SphereList from '../primitives/SphereList';
import Text from '../primitives/Text';

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

    for(let key in this.objectMap) {
      if (this.objectMap.hasOwnProperty(key)) {
        const namespace = this.extractNameSpace(key);
        this.objectMap[key].visible = this.namespaces[namespace];
      }
    }
  }

  onChange() {
    this.onChangeCb();
  }

  updateMarker(marker) {
    const {
      pose: { position, orientation }, scale, color, colors, points, text
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
    if (markerObject.setText) {
        markerObject.setText(text);
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
      case MARKER_OBJECT_TYPES.CUBE:
        return new Cube();
      case MARKER_OBJECT_TYPES.SPHERE:
        return new Sphere();
      case MARKER_OBJECT_TYPES.CYLINDER: {
        const group = new Group();
        group.add(new Cylinder());
        return group;
      }
      case MARKER_OBJECT_TYPES.LINE_LIST:
        return new LineSegments();
      case MARKER_OBJECT_TYPES.LINE_STRIP:
        return new Line();
      case MARKER_OBJECT_TYPES.SPHERE_LIST:
        return new SphereList();
      case MARKER_OBJECT_TYPES.POINTS:
        return new Points();
      case MARKER_OBJECT_TYPES.TRIANGLE_LIST:
        return new TriangleList();
      case MARKER_OBJECT_TYPES.CUBE_LIST:
        return new CubeList();
      case MARKER_OBJECT_TYPES.TEXT_VIEW_FACING:
        return new Text(marker.text);
      case MARKER_OBJECT_TYPES.ARROW:
      default: {
        const arrow = new Arrow();
        arrow.setHeadDimensions({ radius: DEFAULT_CONE_RADIUS * 0.1, length: DEFAULT_CONE_HEIGHT * 0.3 });
        arrow.setShaftDimensions({ radius: DEFAULT_CYLINDER_RADIUS * 0.05, length: DEFAULT_CYLINDER_HEIGHT });
        return arrow;
      }
    }
  }
}
