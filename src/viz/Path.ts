import { Color } from 'three';
import { DEFAULT_OPTIONS_PATH } from '../utils/constants';
import Group from '../primitives/Group';
import Line from '../primitives/Line';
import LiveCore from '../core/live';
import { DataSource } from '../data';

class Path extends LiveCore<RosMessage.Path, Group> {
  private readonly line: Line;

  constructor(
    source: DataSource<RosMessage.Path>,
    options = DEFAULT_OPTIONS_PATH,
  ) {
    super({
      sources: [source],
      options: {
        ...DEFAULT_OPTIONS_PATH,
        ...options,
      },
    });
    const { alpha, color } = this.options;

    this.object = new Group();
    this.line = new Line(null, true);
    this.line.setColor(new Color(color));
    this.line.setAlpha(alpha);
  }

  updateOptions(options: { [p: string]: any }) {
    super.updateOptions(options);
    const { alpha, color } = this.options;
    this.line.setColor(new Color(color));
    this.line.setAlpha(alpha);
  }

  update(message: RosMessage.Path) {
    super.update(message);
    const { poses } = message;
    const points = (poses || []).map(poseData => poseData.pose.position);

    this.line.updatePoints(points);
    this.object?.add(this.line);
  }
}

export default Path;
