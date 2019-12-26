import { Group } from 'three';
import { DEFAULT_OPTIONS_POSEARRAY } from '../utils/constants';
import Pose from './Pose';
import * as TransformUtils from '../utils/transform';
import { assertIsDefined, setObjectDimension } from '../utils/helpers';
import LiveCore from '../core/live';
import { DataSource } from '../data';

class PoseArray extends LiveCore<RosMessage.PoseArray, Group> {
  constructor(
    source: DataSource<RosMessage.PoseArray>,
    options = DEFAULT_OPTIONS_POSEARRAY,
  ) {
    super({
      sources: [source],
      options: {
        ...DEFAULT_OPTIONS_POSEARRAY,
        ...options,
      },
    });
    this.object = new Group();
  }

  update(message: RosMessage.PoseArray) {
    assertIsDefined(this.object);
    super.update(message);
    this.object.children.forEach(obj => {
      obj.parent?.remove(obj);
    });
    this.object.children = [];

    for (let i = 0; i < message.poses.length; i++) {
      const primitive = Pose.getNewPrimitive(this.options);
      if (primitive) {
        TransformUtils.setTransform(primitive, {
          translation: message.poses[i].position,
          rotation: message.poses[i].orientation,
        });
        setObjectDimension(primitive, this.options);
        this.object.add(primitive);
      }
    }
  }
}

export default PoseArray;
