import { Group } from 'three';
import { DEFAULT_OPTIONS_POSE, POSE_OBJECT_TYPES } from '../utils/constants';
import Arrow from '../primitives/Arrow';
import Axes from '../primitives/Axes';
import LineArrow from '../primitives/LineArrow';
import { setObjectDimension } from '../utils/helpers';
import LiveCore from '../core/live';
import { DataSource } from '../data';

class Pose extends LiveCore<RosMessage.PoseStamped, Group> {
  private primitive: Arrow | Axes | LineArrow | null;
  constructor(
    source: DataSource<RosMessage.PoseStamped>,
    options = DEFAULT_OPTIONS_POSE,
  ) {
    super({
      sources: [source],
      options: {
        ...DEFAULT_OPTIONS_POSE,
        ...options,
      },
    });
    this.object = new Group();
    this.primitive = null;
    this.updateOptions({
      ...DEFAULT_OPTIONS_POSE,
      ...options,
    });
  }

  static getNewPrimitive(options: { [k: string]: any }) {
    const { type } = options;
    let newObject = null;

    switch (type) {
      case POSE_OBJECT_TYPES.arrow:
        newObject = new Arrow();
        break;
      case POSE_OBJECT_TYPES.axes:
        newObject = new Axes();
        break;
      case POSE_OBJECT_TYPES.flatArrow:
        newObject = new LineArrow();
        break;
    }

    return newObject;
  }

  updateOptions(options: { [k: string]: any }) {
    super.updateOptions(options);
    const { type } = this.options;

    if (this.primitive?.type !== type) {
      this.object?.remove(this.primitive);
      this.primitive = null;
    }

    if (!this.primitive) {
      const primitive = Pose.getNewPrimitive(this.options);
      if (primitive) {
        this.primitive = primitive;
        this.object?.add(this.primitive);
      }
    }

    setObjectDimension(this.primitive, this.options);
  }

  update(message: RosMessage.PoseStamped) {
    super.update(message);
    const {
      pose: { orientation, position },
    } = message;
    this.primitive?.setTransform({
      translation: position,
      rotation: orientation,
    });
  }
}

export default Pose;
