import Core from '../core';
import { MESSAGE_TYPE_LASERSCAN } from '../utils/constants';
import Points from './Points';

export const STYLE = {
  SQUARES: 'Squares',
  POINTS: 'Points',
  FLAT_SQUARES: 'Flat Squares',
  SPHERES: 'Spheres',
  BOXES: 'Boxes',
};

export const COLOR_TRANSFORMERS = {
  INTENSITY: 'Intensity',
  AXIS_COLOR: 'AxisColor',
  FLAT_COLOR: 'FlatColor',
};

export const AXIS_OPTIONS = {
  X: 'x',
  Y: 'y',
  Z: 'z',
};

export const INTENSITY_CHANNEL_OPTIONS = {
  INTENSITY: 'intensity',
  ...AXIS_OPTIONS,
}

class LaserScan extends Core {
  constructor(ros, topicName, options = {}) {
    super(ros, topicName, MESSAGE_TYPE_LASERSCAN);
    this.options = options;
    this.points = new Points();
    this.object = this.points.rootObject;
  }

  updateOptions(options) {
    this.options = options;

    this.setStyle();
  }

  setStyle(){}

  update(message) {
    if (!this.points.setup(message.header.frame_id)) {
      return;
    }
    const n = message.ranges.length;
    let j = 0;
    for (let i = 0; i < n; i += this.points.pointRatio) {
      const range = message.ranges[i];
      if (range >= message.range_min && range <= message.range_max) {
        const angle = message.angle_min + i * message.angle_increment;
        this.points.positions.array[j++] = range * Math.cos(angle);
        this.points.positions.array[j++] = range * Math.sin(angle);
        this.points.positions.array[j++] = 0.0;
      }
    }
    this.points.update(j / 3);
  }
}

export default LaserScan;
