import { Color } from 'three';
import {
  AXES,
  COLOR_TRANSFORMERS,
  DEFAULT_OPTIONS_LASERSCAN,
  INTENSITY_CHANNEL_OPTIONS,
  LASERSCAN_STYLES,
} from '../utils/constants';
import Points from '../utils/points';
import Group from '../primitives/Group';
import SphereList from '../primitives/SphereList';
import CubeList from '../primitives/CubeList';
import LiveCore from '../core/live';
import { DataSource } from '../data';
import { assertBehavesLikeArray, assertIsDefined } from '../utils/helpers';

class LaserScan extends LiveCore<RosMessage.LaserScan, Group> {
  private points: Points;
  private readonly sphereList: SphereList;
  private readonly cubeList: CubeList;
  private cachedMessage: RosMessage.LaserScan | null = null;

  constructor(
    source: DataSource<RosMessage.LaserScan>,
    options = DEFAULT_OPTIONS_LASERSCAN,
  ) {
    super({
      sources: [source],
      options: {
        ...DEFAULT_OPTIONS_LASERSCAN,
        ...options,
      },
    });

    this.points = new Points();
    this.sphereList = new SphereList();
    this.cubeList = new CubeList();

    this.object = new Group();
    this.object.add(this.points.rootObject);
    this.object.add(this.sphereList);
    this.object.add(this.cubeList);
  }

  getNormalizedIntensity(intensity: number) {
    const { maxIntensity, minIntensity } = this.options;
    return (intensity - minIntensity) / (maxIntensity - minIntensity);
  }

  applyIntensityTransform(intensity: number, position: RosMessage.Point) {
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

    const minColorHex = new Color(minColor);
    const maxColorHex = new Color(maxColor);

    assertIsDefined(normI);
    const finalColor =
      normI * maxColorHex.getHex() + (1 - normI) * minColorHex.getHex();
    return new Color(finalColor);
  }

  getNormalizedAxisValue(axisValue: number) {
    const { maxAxisValue, minAxisValue } = this.options;
    return (axisValue - minAxisValue) / (maxAxisValue - minAxisValue);
  }

  applyAxisColorTransform(intensity: number, position: RosMessage.Point) {
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

    assertIsDefined(normI);
    const finalColor = normI * maxAxisValue + (1 - normI) * minAxisValue;
    return new Color(finalColor);
  }

  colorTransformer(intensity: number, position: RosMessage.Point) {
    const { colorTransformer, flatColor } = this.options;

    switch (colorTransformer) {
      case COLOR_TRANSFORMERS.INTENSITY:
        return this.applyIntensityTransform(intensity, position);
      case COLOR_TRANSFORMERS.AXIS_COLOR:
        return this.applyAxisColorTransform(intensity, position);
      case COLOR_TRANSFORMERS.FLAT_COLOR:
        return new Color(flatColor);
      default:
        return null;
    }
  }

  setupPoints(
    index: number,
    position: RosMessage.Point,
    color: RosMessage.Color | null,
  ) {
    assertIsDefined(color);
    assertIsDefined(this.points.colors);
    assertIsDefined(this.points.positions);
    assertBehavesLikeArray(this.points.colors.array);
    assertBehavesLikeArray(this.points.positions.array);

    this.points.colors.array[index] = color.r;
    this.points.positions.array[index++] = position.x;
    this.points.colors.array[index] = color.g;
    this.points.positions.array[index++] = position.y;
    this.points.colors.array[index] = color.b;
    this.points.positions.array[index++] = position.z;
  }

  hideAllObjects() {
    this.points.rootObject.visible = false;
    this.sphereList.visible = false;
    this.cubeList.visible = false;
  }

  setStyleDimensions(message: RosMessage.LaserScan) {
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
            this.setupPoints(j, position, color);
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

  updateOptions(options: { [p: string]: any }) {
    super.updateOptions(options);
    if (this.cachedMessage) {
      this.setStyleDimensions(this.cachedMessage);
    }
  }

  update(message: RosMessage.LaserScan) {
    super.update(message);
    this.setStyleDimensions(message);
    this.cachedMessage = message;
  }
}

export default LaserScan;
