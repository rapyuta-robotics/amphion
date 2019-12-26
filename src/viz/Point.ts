import { DEFAULT_OPTIONS_POINT } from '../utils/constants';
import Group from '../primitives/Group';
import Sphere from '../primitives/Sphere';
import LiveCore from '../core/live';
import { DataSource } from '../data';

class Point extends LiveCore<RosMessage.PointStamped, Group> {
  private readonly sphere: Sphere;

  constructor(
    source: DataSource<RosMessage.PointStamped>,
    options = DEFAULT_OPTIONS_POINT,
  ) {
    super({
      sources: [source],
      options: {
        ...DEFAULT_OPTIONS_POINT,
        ...options,
      },
    });
    const { alpha, color, radius } = this.options;
    this.object = new Group();
    this.sphere = new Sphere();
    this.object.add(this.sphere);
    this.sphere.setColor(color);
    this.sphere.setAlpha(alpha);
    this.sphere.setScale({ x: radius, y: radius, z: radius });
  }

  updateOptions(options: { [p: string]: any }) {
    super.updateOptions(options);
  }

  update(message: RosMessage.PointStamped) {
    super.update(message);
    const {
      point: { x, y, z },
    } = message;
    this.object?.position.set(x, y, z);
  }
}

export default Point;
