import Core from '../core';
import { MESSAGE_TYPE_LASERSCAN } from '../utils/constants';
import Points from './Points';
import Group from '../primitives/Group';
import Sphere from '../primitives/Sphere';
import Cube from '../primitives/Cube';

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
    this.object = new Group();
    this.object.add(this.points.rootObject);
  }

  getNormalizedIntensity(data) {
    const { minIntensity, maxIntensity } = this.options

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
        normI = this.getNormalizedAxisValue(x);
        break;
      case AXIS_OPTIONS.Z:
        normI = this.getNormalizedAxisValue(z);
        break;
      default:
        break
    }

    const finalColor = (normI * maxAxisValue) + ((1 - normI) * minAxisValue);
    return new THREE.Color(finalColor);;
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

  removeObjects() {
    this.object.children.forEach(child => {
      this.object.remove(child);
    });
  }

  setupPoints({j, position, color}) {
    this.points.colors.array[j] = color.r;
    this.points.positions.array[j++] = position.x;
    this.points.colors.array[j] = color.g;
    this.points.positions.array[j++] = position.y;
    this.points.colors.array[j] = color.b;
    this.points.positions.array[j++] = position.z;
  }

  addSphere({ position, color }) {
    const { size, alpha } = this.options;
    const { x, y, z } = position;
    const sphere = new Sphere(color.getHex(), size);

    sphere.setAlpha(alpha);
    sphere.position.set(x, y, z);
    this.object.add(sphere);
  }

  addBox({ position, color }) {
    const { size, alpha } = this.options;
    const { x, y, z } = position;
    const box = new Cube();

    box.setAlpha(alpha);
    box.setScale({x: size});
    box.position.set(x, y, z);
    this.object.add(box);
  }

  setStyleDimensions(message){
    const { style, size, alpha } = this.options;
    const { ranges , intensities } = message;
    const n = ranges.length;

    this.removeObjects();

    if (style === STYLE.POINTS || style === STYLE.SQUARES || style === STYLE.FLAT_SQUARES) {
      this.object.add(this.points.rootObject);
      this.points.setup(style, size, alpha);
    }

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
          case STYLE.SPHERES: {
            this.addSphere({ position, color });
            break;
          }
          case STYLE.BOXES: {
            this.addBox({ position, color });
            break;
          }
          default:
            break;
        }
      }
    }

    if (style === STYLE.POINTS || style === STYLE.SQUARES || style === STYLE.FLAT_SQUARES) {
      this.points.update(j/3);
    }
  }

  updateOptions(options) {
    const newOptions = { ...options };
    this.options = newOptions;
  }

  update(message) {
    super.update(message);
    this.setStyleDimensions(message);
  }
}

export default LaserScan;
