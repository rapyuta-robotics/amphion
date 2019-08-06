import * as THREE from 'three';

import Core from '../core';
import {DEFAULT_OPTIONS_POLYGON, MESSAGE_TYPE_RANGE} from '../utils/constants';
import {DEFAULT_COLOR_ARROW} from '../utils/constants';
import Group from '../primitives/Group';
import Cone from '../primitives/Cone';

class Range extends Core {
  constructor(ros, topicName, options = DEFAULT_OPTIONS_POLYGON) {
    super(ros, topicName, MESSAGE_TYPE_RANGE, options);
    this.object = new Group();
    this.updateOptions({
      ...DEFAULT_OPTIONS_POLYGON,
      ...options
    });
  }

  updateOptions(options) {
    super.updateOptions(options);
    const { color, alpha } = this.options;
    this.color = color;
  }

  update(message) {
    super.update(message);
    this.height = message.range;
    this.radius = message.range * Math.tan(message.field_of_view/2.);
    this.object.add(new Cone(this.color,
                             this.radius,
                             this.height ));
  }
}

export default Range;
