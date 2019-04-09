import Core from '../core';
import { MESSAGE_TYPE_MARKER } from '../utils/constants';
import Group from '../primitives/Group';
import MarkerManager from './MarkerManager';

class Marker extends Core {
  constructor(ros, topicName) {
    super(ros, topicName, MESSAGE_TYPE_MARKER);
    this.object = new Group();
    this.markerManager = new MarkerManager(this.object);
  }

  update(message) {
    this.markerManager.updateMarker(message);
  }

  reset() {
    this.markerManager.reset();
  }
}

export default Marker;
