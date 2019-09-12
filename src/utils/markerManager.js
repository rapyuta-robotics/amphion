import ROSLIB from 'roslib';
import getNewPrimitive from './markerTypes';
import MarkerLifetime from './markerLifetime';

export default class MarkerManager {
  constructor(rootObject, onChangeCb) {
    this.objectMap = {};
    this.object = rootObject;
    this.namespaces = {};
    this.onChangeCb = onChangeCb;
    this.markerLifetime = new MarkerLifetime(
      this.onMarkerLifetimeOver.bind(this),
    );
  }

  onMarkerLifetimeOver(id) {
    const marker = this.objectMap[id];
    if (!marker) {
      return;
    }

    this.removeObject(id);
  }

  getMarkerOrCreate(marker) {
    const id = MarkerManager.getId(marker);
    if (!this.objectMap[id]) {
      const object = getNewPrimitive(marker);
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
    const { namespaces, queueSize } = options;
    const { queueSize: currentQueueSize } = context;

    if (currentQueueSize !== queueSize) {
      this.setQueueSize(queueSize, context);
    }

    this.namespaces = namespaces;

    for (const key in this.objectMap) {
      // eslint-disable-next-line no-prototype-builtins
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
      color,
      colors,
      lifetime,
      points,
      pose: { orientation, position },
      scale,
    } = marker;
    const markerObject = this.getMarkerOrCreate(marker);
    const markerId = MarkerManager.getId(marker);

    this.markerLifetime.track(markerId, lifetime.secs);

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
    this.markerLifetime.destroy();
    this.onChange();

    Object.keys(this.objectMap).forEach(id => {
      this.removeObject(id);
    });
  }

  static getId({ ns, id }) {
    return `${ns}-${id}`;
  }
}
