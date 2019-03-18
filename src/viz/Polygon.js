import Core from '../core';
import { MESSAGE_TYPE_POLYGONSTAMPED } from '../utils/constants';
import Line from '../primitives/Line';
import { DEFAULT_COLOR_LINE } from '../utils/defaults';


class Polygon extends Core {
  constructor(ros, topicName) {
    super(ros, topicName, MESSAGE_TYPE_POLYGONSTAMPED);

    this.object = new Line(DEFAULT_COLOR_LINE);
  }

  update(message) {
    super.update(message);
    const {
      polygon: {
        points,
      }
    } = message;
    this.object.updatePoints(points);
  }
}

export default Polygon;
