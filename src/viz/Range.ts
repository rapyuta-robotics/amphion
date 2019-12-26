import { Color, CylinderGeometry } from 'three';
import {
  DEFAULT_OPTIONS_RANGE,
  DEFAULT_RADIAL_SEGMENTS,
} from '../utils/constants';

import Group from '../primitives/Group';
import Cylinder from '../primitives/Cylinder';
import LiveCore from '../core/live';
import { DataSource } from '../data';

class Range extends LiveCore<RosMessage.Range, Group> {
  private readonly cylinder: Cylinder;

  constructor(
    source: DataSource<RosMessage.Range>,
    options = DEFAULT_OPTIONS_RANGE,
  ) {
    super({
      sources: [source],
      options: {
        ...DEFAULT_OPTIONS_RANGE,
        ...options,
      },
    });
    const { alpha, color } = this.options;

    this.object = new Group();
    this.cylinder = new Cylinder(this.options.color, 0.01, 0.01);
    this.cylinder.rotateZ(Math.PI / 2);
    this.object.add(this.cylinder);
    this.cylinder.setAlpha(alpha);
    this.cylinder.setColor(new Color(color));
  }

  update(message: RosMessage.Range) {
    super.update(message);
    const { field_of_view: fov, max_range: max, min_range: min } = message;
    this.cylinder.geometry = new CylinderGeometry(
      (min * Math.tan(fov)) / 4,
      (max * Math.tan(fov)) / 4,
      max - min,
      DEFAULT_RADIAL_SEGMENTS,
      DEFAULT_RADIAL_SEGMENTS,
    );
    this.cylinder.geometry.verticesNeedUpdate = true;
    this.cylinder.position.setX(0.5 * (min + max));
  }
}

export default Range;
