import Core from '../core';
import { MESSAGE_TYPE_MARKERARRAY, MARKERARRAY_TYPES } from '../utils/constants';
import Arrow from '../core/Arrow';
import Axes from '../core/Axes';
import Cylinder from '../primitives/Cylinder';
import { DEFAULT_COLOR_ARROW, DEFAULT_CYLINDER_HEIGHT } from '../utils/defaults';
import Line from '../primitives/Line';
import Cube from '../primitives/Cube';
import Sphere from '../primitives/Sphere';
import { Triangle } from 'three';


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
    this.max = 0;
  }

  update(message) {
    if (message.markers.length > 0) {
      message.markers.forEach((marker) => {
        this.types[marker.type] = _.union(
          this.types[marker.type] || [], [marker.ns]
        );
        this.drawType(marker);
      });
    }
  }

  drawType(marker) {
    switch (marker.type) {
      case MARKERARRAY_TYPES.ARROW:
        this.drawArrows(marker);
        break;
      case MARKERARRAY_TYPES.CUBE:
        this.drawCube(marker);
        break;
      case MARKERARRAY_TYPES.SPHERE:
        this.drawSphere(marker);
        break;
      case MARKERARRAY_TYPES.CYLINDER:
        this.drawCylinder(marker);
        break;
      case MARKERARRAY_TYPES.LINE_STRIP:
        this.drawLineStrip(marker, 15);
        break;
      case MARKERARRAY_TYPES.LINE_LIST:
        this.drawLineStrip(marker, 2);
        break;
      case MARKERARRAY_TYPES.SPHERE_LIST:
        this.drawSphereList(marker);
        break;
      case MARKERARRAY_TYPES.CUBE_LIST:
        this.drawCube(marker);
        break;
      case MARKERARRAY_TYPES.TRIANGLE_LIST:
        this.drawTriangle(marker);
        break;
    }
  }

  drawArrows(marker) {
    const { pose: { position, orientation } } = marker;
    const id = `${marker.id}-${marker.ns}`;

    if (!this.objectMap[id]) {
      const arrow = new Arrow();
      arrow.setScale({ x: 0.01, y: 0.01, z: 0.05 });
      arrow.setColor(marker.color);
      this.objectMap[id] = arrow;
      this.object.add(arrow);
    }
    this.objectMap[id].setTransform({ translation: position, rotation: orientation });
  }

  drawCylinder(marker) {
    const { pose: { position, orientation }, scale } = marker;
    const id = `${marker.id}-${marker.ns}`;

    if (!this.objectMap[id]) {
      const group = new THREE.Group();

      let color = DEFAULT_COLOR_ARROW;
      if (marker.color) {
        color = new THREE.Color(marker.color.r, marker.color.g, marker.color.b);
        color = color.getHexString();
      }

      const cylinder = new Cylinder(`#${color}`);
      group.add(cylinder);

      this.objectMap[id] = group;
      this.object.add(group);
    }

    this.objectMap[id].position.set(position.x, position.y, position.z);
    this.objectMap[id].quaternion.set(
      orientation.x, orientation.y, orientation.z, orientation.w
    );
    this.objectMap[id].scale.set(
      scale.x, scale.y, scale.z
    );
  }

  drawLineStrip(marker, lineWidth) {
    const { pose: { position, orientation } } = marker;
    const id = `${marker.id}-${marker.ns}`;

    if (!this.objectMap[id]) {
      let color = DEFAULT_COLOR_ARROW;
      if (marker.color) {
        color = new THREE.Color(marker.color.r, marker.color.g, marker.color.b);
        color = color.getHexString();
      }

      const line = new Line(`#${color}`, lineWidth);
      this.objectMap[id] = line;
      this.object.add(line);
    }

    if (marker.points.length) {
      this.objectMap[id].updatePoints(marker.points);
    }

    this.objectMap[id].position.set(position.x, position.y, position.z);
    this.objectMap[id].quaternion.set(
      orientation.x, orientation.y, orientation.z, orientation.w
    );
  }

  drawSphere(marker) {
    const { pose: { position, orientation }, scale } = marker;
    const id = `${marker.id}-${marker.ns}`;

    if (!this.objectMap[id]) {
      const group = new THREE.Group();

      let color = DEFAULT_COLOR_ARROW;
      if (marker.color) {
        color = new THREE.Color(marker.color.r, marker.color.g, marker.color.b);
        color = color.getHexString();
      }

      const cube = new Sphere(`#${color}`);
      group.add(cube);

      this.objectMap[id] = group;
      this.object.add(group);
    }

    this.objectMap[id].position.set(position.x, position.y, position.z);
    this.objectMap[id].quaternion.set(
      orientation.x, orientation.y, orientation.z, orientation.w
    );
    this.objectMap[id].scale.set(
      scale.x, scale.y, scale.z
    );
  }

  drawSphereList(marker) {
    this.drawSphere(marker);
  }

  drawCube(marker) {
    const { pose: { position, orientation }, scale } = marker;
    const id = `${marker.id}-${marker.ns}`;

    if (!this.objectMap[id]) {
      const group = new THREE.Group();

      let color = DEFAULT_COLOR_ARROW;
      if (marker.color) {
        color = new THREE.Color(marker.color.r, marker.color.g, marker.color.b);
        color = color.getHexString();
      }

      const cube = new Cube(`#${color}`, marker.scale.x);
      group.add(cube);

      this.objectMap[id] = group;
      this.object.add(group);
    }

    this.objectMap[id].position.set(position.x, position.y, position.z);
    this.objectMap[id].quaternion.set(
      orientation.x, orientation.y, orientation.z, orientation.w
    );
  }

  drawTriangle(marker) {
    const { pose: { position, orientation }, scale } = marker;
    const id = `${marker.id}-${marker.ns}`;

    if (!this.objectMap[id]) {
      const group = new THREE.Group();

      let color = DEFAULT_COLOR_ARROW;
      if (marker.color) {
        color = new THREE.Color(marker.color.r, marker.color.g, marker.color.b);
        color = color.getHexString();
      }

      for (let i = 0; i < marker.points.length;) {
        const tempVerts = [];
        for (let j = 0; j <= 2; j++) {
          tempVerts.push(marker.points[i]);
          j++;
          i++;
        }
        this.group.add(new Triangle(color, tempVerts));
      }

      this.objectMap[id] = group;
      this.object.add(group);
    }

    this.objectMap[id].position.set(position.x, position.y, position.z);
    this.objectMap[id].quaternion.set(
      orientation.x, orientation.y, orientation.z, orientation.w
    );
    this.objectMap[id].scale.set(
      scale.x, scale.y, scale.z
    );
  }

  removeObject(id) {
    const obj = this.objectMap[id];
    obj.parent.remove(obj);

    this.objectMap[id] = null;
  }
}

export default MarkerArray;
