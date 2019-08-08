import * as THREE from 'three';

import Core from '../core';
import {
  DEFAULT_OPTIONS_LASERSCAN,
  LASERSCAN_STYLES,
  MESSAGE_TYPE_LASERSCAN,
  COLOR_TRANSFORMERS,
  INTENSITY_CHANNEL_OPTIONS,
  AXES,
} from '../utils/constants';
import Points from '../utils/points';
import Group from '../primitives/Group';
import SphereList from '../primitives/SphereList';
import CubeList from '../primitives/CubeList';

class LaserScan extends Core {
  constructor(ros, topicName, options = DEFAULT_OPTIONS_LASERSCAN) {
    super(ros, topicName, MESSAGE_TYPE_LASERSCAN, options);

    this.points = new Points(LASERSCAN_STYLES.POINTS);
    this.sphereList = new SphereList();
    this.cubeList = new CubeList();

    this.object = new Group();
    this.object.add(this.points.rootObject);
    this.object.add(this.sphereList);
    this.object.add(this.cubeList);
    this.prevMessage = null;
    this.updateOptions({
      ...DEFAULT_OPTIONS_LASERSCAN,
      ...options,
    });
  }

  getNormalizedIntensity(data) {
    const { maxIntensity, minIntensity } = this.options;

    return (data - minIntensity) / (maxIntensity - minIntensity);
  }

  applyIntensityTransform(intensity, position) {
    const { channelName, maxColor, minColor } = this.options;
    const { x, y, z } = position;

    let normI;

    switch (channelName) {
      case INTENSITY_CHANNEL_OPTIONS.INTENSITY:
        normI = this.getNormalizedIntensity(intensity);
        break;
      case INTENSITY_CHANNEL_OPTIONS.X:
        normI = this.getNormalizedIntensity(x);
        break;
      case INTENSITY_CHANNEL_OPTIONS.Y:
        normI = this.getNormalizedIntensity(y);
        break;
      case INTENSITY_CHANNEL_OPTIONS.Z:
        normI = this.getNormalizedIntensity(z);
        break;
      default:
        break;
    }

    const minColorHex = new THREE.Color(minColor);
    const maxColorHex = new THREE.Color(maxColor);

    const finalColor =
      normI * maxColorHex.getHex() + (1 - normI) * minColorHex.getHex();
    return new THREE.Color(finalColor);
  }

  getNormalizedAxisValue(data) {
    const { maxAxisValue, minAxisValue } = this.options;

    return (data - minAxisValue) / (maxAxisValue - minAxisValue);
  }

  applyAxisColorTransform(intensity, position) {
    const { axis, maxAxisValue, minAxisValue } = this.options;
    const { x, y, z } = position;

    let normI;

    switch (axis) {
      case AXES.X:
        normI = this.getNormalizedAxisValue(x);
        break;
      case AXES.Y:
        normI = this.getNormalizedAxisValue(y);
        break;
      case AXES.Z:
        normI = this.getNormalizedAxisValue(z);
        break;
      default:
        break;
    }

    const finalColor = normI * maxAxisValue + (1 - normI) * minAxisValue;
    return new THREE.Color(finalColor);
  }

  colorTransformer(intensity, position) {
    const { colorTransformer, flatColor } = this.options;

    switch (colorTransformer) {
      case COLOR_TRANSFORMERS.INTENSITY:
        return this.applyIntensityTransform(intensity, position);
      case COLOR_TRANSFORMERS.AXIS_COLOR:
        return this.applyAxisColorTransform(intensity, position);
      case COLOR_TRANSFORMERS.FLAT_COLOR:
        return new THREE.Color(flatColor);
      default:
        return null;
    }
  }

  setupPoints({ j, position, color }) {
    this.points.colors.array[j] = color.r;
    this.points.positions.array[j++] = position.x;
    this.points.colors.array[j] = color.g;
    this.points.positions.array[j++] = position.y;
    this.points.colors.array[j] = color.b;
    this.points.positions.array[j++] = position.z;
  }

  hideAllObjects() {
    this.points.rootObject.visible = false;
    this.sphereList.visible = false;
    this.cubeList.visible = false;
  }

  setStyleDimensions(message) {
    if (!message) {
      return;
    }
    const { alpha, style } = this.options;
    const { size } = this.options;
    const { intensities, ranges } = message;
    const n = ranges.length;
    const positions = [];
    const colors = [];

    if (size < 0.001 || !size) {
      return;
    }

    this.hideAllObjects();
    this.points.setup(style, size, alpha);

    let j = 0;
    for (let i = 0; i < n; i++) {
      const range = message.ranges[i];

      if (range >= message.range_min && range <= message.range_max) {
        const angle = message.angle_min + i * message.angle_increment;
        const position = {
          x: range * Math.cos(angle),
          y: range * Math.sin(angle),
          z: 0,
        };
        const color = this.colorTransformer(intensities[i], position);

        switch (style) {
          case LASERSCAN_STYLES.POINTS:
          case LASERSCAN_STYLES.SQUARES:
          case LASERSCAN_STYLES.FLAT_SQUARES: {
            this.setupPoints({ j, position, color });
            j += 3;
            break;
          }
          default:
            positions.push(position);
            colors.push(color);
            break;
        }
      }
    }

    const options = { scale: { x: size, y: size, z: size } };

    switch (style) {
      case LASERSCAN_STYLES.SPHERES: {
        this.sphereList.visible = true;
        this.sphereList.updatePoints(positions, colors, options);
        break;
      }
      case LASERSCAN_STYLES.BOXES: {
        this.cubeList.visible = true;
        this.cubeList.updatePoints(positions, colors, options);
        break;
      }
      default:
        this.points.rootObject.visible = true;
        this.points.update(j / 3);
        break;
    }
  }

  updateOptions(options) {
    super.updateOptions(options);
    this.setStyleDimensions(this.prevMessage);
  }

  update(message) {
    super.update(message);
    this.setStyleDimensions(message);
    this.prevMessage = message;
  }
}

export default LaserScan;
