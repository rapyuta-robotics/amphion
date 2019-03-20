import Core from '../core';
import { MESSAGE_TYPE_MARKERARRAY, MARKERARRAY_TYPES } from '../utils/constants';
import Arrow from '../core/Arrow';
import Axes from '../core/Axes';
import Cylinder from '../primitives/Cylinder';
import { DEFAULT_COLOR_ARROW, DEFAULT_CYLINDER_HEIGHT } from '../utils/defaults';


const SUPPORTED_TYPES = [
  MESSAGE_TYPE_MARKERARRAY.ARROW
];

class MarkerArray extends Core {
  constructor(ros, topicName) {
    super(ros, topicName, MESSAGE_TYPE_MARKERARRAY);
    this.object = new THREE.Group();
    this.objectMap = {};
    this.types = {};
    window.types = this.types;
    window.objectMap = this.objectMap;
  }

  update(message) {
    // console.log(message);
    if (message.markers.length > 0) {
      this.types[message.markers[0].type] = message.markers[0].ns;
      switch (message.markers[0].type) {
        case MARKERARRAY_TYPES.ARROW:
          this.drawArrows(message.markers);
          break;
        case MARKERARRAY_TYPES.CYLINDER:
          this.drawCylinder(message.markers);
          break;
      }
    }
  }

  drawArrows(markers) {
    markers.forEach((data) => {
      const { pose: { position, orientation } } = data;
      const id = `${data.id}-${data.ns}`;

      if (!this.objectMap[id]) {
        const arrow = new Arrow();
        arrow.setScale({ x: 0.01, y: 0.01, z: 0.05 });
        this.objectMap[id] = arrow;
        this.object.add(arrow);
      }

      this.objectMap[id].setTransform({ translation: position, rotation: orientation });
    });
  }

  drawCylinder(markers) {
    markers.forEach((data) => {
      const { pose: { position, orientation } } = data;
      const id = `${data.id}-${data.ns}`;

      if (!this.objectMap[id]) {
        const group = new THREE.Group();

        let color = DEFAULT_COLOR_ARROW;
        if (data.color) {
          color = new THREE.Color(data.color.r, data.color.g, data.color.b);
          color = color.getHexString();
        }

        const cylinder = new Cylinder(`#${color}`, 0.005, 0.1);
        group.add(cylinder);

        this.objectMap[id] = group;
        this.object.add(group);
      }

      this.objectMap[id].position.set(position.x, position.y, position.z);
      this.objectMap[id].quaternion.set(
        orientation.x, orientation.y, orientation.z, orientation.w
      );
    });
  }

  removeObject(id) {
    const obj = this.objectMap[id];
    obj.parent.remove(obj);

    this.objectMap[id] = null;
  }
}

export default MarkerArray;
