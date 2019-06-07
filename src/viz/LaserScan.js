import Core from '../core';
import { MESSAGE_TYPE_LASERSCAN } from '../utils/constants';
import Points from './Points';
import Group from '../primitives/Group';
import SphereList from '../primitives/SphereList';
import CubeList from '../primitives/CubeList';

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
};

class LaserScan extends Core {
  constructor(ros, topicName, options = {}) {
    super(ros, topicName, MESSAGE_TYPE_LASERSCAN);
    this.options = options;

    const { size, alpha } = options;
    this.points = new Points(STYLE.POINTS, size, alpha);
    this.sphereList = new SphereList();
    this.cubeList = new CubeList();

    this.object = new Group();
    this.object.add(this.points.rootObject);
    this.object.add(this.sphereList);
    this.object.add(this.cubeList);
    this.prevMessage = null;
  }

  getNormalizedIntensity(data) {
    const { minIntensity, maxIntensity } = this.options;

    return (data - minIntensity) / (maxIntensity - minIntensity);
  }

  applyIntensityTransform(intensity, position) {
    const { channelName, minColor, maxColor } = this.options;
    const { x, y, z} = position;

    let normI;

    switch(channelName) {
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
          break
    }

    const minColorHex = new THREE.Color(minColor);
    const maxColorHex = new THREE.Color(maxColor);

    const finalColor = (normI * maxColorHex.getHex()) + ((1 - normI) * minColorHex.getHex());
    return new THREE.Color(finalColor);
  }

  getNormalizedAxisValue(data) {
    const { minAxisValue, maxAxisValue } = this.options;

    return (data - minAxisValue) / (maxAxisValue - minAxisValue);
  }

  applyAxisColorTransform(intensity, position){
    const { axis, minAxisValue, maxAxisValue } = this.options;
    const { x, y, z } = position;

    let normI;

    switch(axis) {
      case AXIS_OPTIONS.X:
        normI = this.getNormalizedAxisValue(x);
        break;
      case AXIS_OPTIONS.Y:
        normI = this.getNormalizedAxisValue(y);
        break;
      case AXIS_OPTIONS.Z:
        normI = this.getNormalizedAxisValue(z);
        break;
      default:
        break
    }

    const finalColor = (normI * maxAxisValue) + ((1 - normI) * minAxisValue);
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

  setupPoints({j, position, color}) {
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

  setStyleDimensions(message){
    const { style, alpha } = this.options;
    let { size } = this.options;
    const { ranges , intensities } = message;
    const n = ranges.length;
    const positions = [];
    const colors = [];

    if (size < 0.001 || !size) {
      return;
    }

    this.hideAllObjects();
    this.points.setup(style, size, alpha);

    let j = 0;
    for (let i = 0; i < n; i ++) {
      const range = message.ranges[i];

      if (range >= message.range_min && range <= message.range_max) {
        const angle = message.angle_min + i * message.angle_increment;
        const position = {
          x: range * Math.cos(angle),
          y: range * Math.sin(angle),
          z: 0
        };
        const color = this.colorTransformer(intensities[i], position);
        const { x, y, z } = position;

        switch (style) {
          case STYLE.POINTS:
          case STYLE.SQUARES:
          case STYLE.FLAT_SQUARES: {
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

    const options = { scale: {x: size, y: size, z: size}};

    switch (style) {
      case STYLE.SPHERES: {
        this.sphereList.visible = true;
        this.sphereList.updatePoints(positions, colors, options);
        break;
      }
      case STYLE.BOXES: {
        this.cubeList.visible = true;
        this.cubeList.updatePoints(positions, colors, options);
        break;
      }
      default:
        this.points.rootObject.visible = true;
        this.points.update(j/3);
        break;
    }
  }

  updateOptions(options) {
    const newOptions = { ...options };
    this.options = newOptions;

    this.setStyleDimensions(this.prevMessage);
  }

  update(message) {
    super.update(message);
    this.setStyleDimensions(message);
    this.prevMessage = message;
  }
}

export default LaserScan;
