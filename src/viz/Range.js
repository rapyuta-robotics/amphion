import { Color, CylinderGeometry } from 'three';

import Core from '../core';
import {
  DEFAULT_OPTIONS_RANGE,
  DEFAULT_RADIAL_SEGMENTS,
  MESSAGE_TYPE_RANGE,
} from '../utils/constants';

import Group from '../primitives/Group';
import Cylinder from '../primitives/Cylinder';

class Range extends Core {
  constructor(ros, topicName, options = DEFAULT_OPTIONS_RANGE) {
    super(ros, topicName, MESSAGE_TYPE_RANGE, options);
    this.object = new Group();
    this.cylinder = new Cylinder(this.options.color, 0.01, 0.01);
    this.cylinder.rotateZ(Math.PI / 2);
    this.object.add(this.cylinder);
    this.updateOptions({
      ...DEFAULT_OPTIONS_RANGE,
      ...options,
    });
  }

  updateOptions(options) {
    super.updateOptions(options);
    const { alpha, color } = this.options;
    this.cylinder.setAlpha(alpha);
    this.cylinder.setColor(new Color(color));
  }

  update(message) {
    super.update(message);
    const { field_of_view: fov, max_range: max, min_range: min } = message;
    this.cylinder.geometry = new CylinderGeometry(
      (min * Math.tan(fov)) / 4,
      (max * Math.tan(fov)) / 4,
      max - min,
      DEFAULT_RADIAL_SEGMENTS,
      DEFAULT_RADIAL_SEGMENTS,
    );
    this.cylinder.geometryNeedsUpdate = true;
    this.cylinder.position.setX(0.5 * (min + max));
  }
}

export default Range;
