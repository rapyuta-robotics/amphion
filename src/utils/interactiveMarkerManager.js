import ROSLIB from 'roslib';
import Group from '../primitives/Group';
import MarkerManager from './markerManager';

export default class InteractiveMarkerManager {
  constructor(rootObject) {
    this.markerManagerMap = {};
    this.objectMap = {};
    this.object = rootObject;
    this.namespaces = {};
    this.onChange = this.onChange.bind(this);
  }

  getMarkerManagerOrCreate(interactiveMarkerName) {
    const id = interactiveMarkerName;
    if (!this.markerManagerMap[id] || !this.objectMap[id]) {
      const markersHolder = new Group();
      markersHolder.name = id || '';
      this.markerManagerMap[id] = new MarkerManager(
        markersHolder,
        this.onChange,
      );
      this.objectMap[id] = markersHolder;
      this.object.add(markersHolder);
    }

    return {
      manager: this.markerManagerMap[id],
      object: this.objectMap[id],
    };
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
    const { queueSize } = options;
    const { queueSize: currentQueueSize } = context;

    if (currentQueueSize !== queueSize) {
      this.setQueueSize(queueSize, context);
    }
  }

  onChange() {
    if (this.callback) {
      this.callback();
    }
  }

  onNamespaceChange(callback) {
    this.callback = callback;
  }

  initMarkers(interactiveMarker) {
    const {
      controls,
      name,
      pose: { orientation, position },
      scale,
    } = interactiveMarker;
    const { manager, object } = this.getMarkerManagerOrCreate(name);
    object.setTransform({ translation: position, rotation: orientation });
    controls.forEach(control => {
      if (control.markers.length > 0) {
        control.markers.forEach(marker => {
          manager.updateMarker(marker);
        });
      }
    });
  }

  updatePose(poseObject) {
    const { name, pose } = poseObject;
    const markerObject = this.objectMap[name];
    if (pose) {
      const { orientation, position } = pose;
      markerObject.setTransform({
        translation: position,
        rotation: orientation,
      });
    }
  }

  removeObject(id) {
    const obj = this.objectMap[id];
    obj.parent.remove(obj);
    delete this.objectMap[id];
  }

  reset(destroy) {
    this.onChange();

    if (destroy) {
      Object.keys(this.objectMap).forEach(id => {
        this.removeObject(id);
      });
    }
  }
}
