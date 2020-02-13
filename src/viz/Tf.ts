import { Group, Vector3 } from 'three';
import TfFrame from '../primitives/TfFrame';
import { DEFAULT_OPTIONS_TF } from '../utils/constants';
import LiveCore from '../core/live';
import { DataSource } from '../data';

class Tf extends LiveCore<RosMessage.TFMessage, Group> {
  constructor(
    source: DataSource<RosMessage.TFMessage>,
    options = DEFAULT_OPTIONS_TF,
  ) {
    super({
      sources: [source],
      options: {
        ...DEFAULT_OPTIONS_TF,
        ...options,
      },
    });
    this.object = new Group();
    this.object.name = 'tf-tree';
  }

  update(message: RosMessage.TFMessage) {
    const { transforms } = message;
    transforms.forEach(
      ({
        header: { frame_id: parentFrameId },
        child_frame_id: childFrameId,
        transform,
      }) => {
        const [childFrame, parentFrame] = [
          this.getFrameOrCreate(childFrameId),
          this.getFrameOrCreate(parentFrameId),
        ];

        parentFrame.add(childFrame);
        childFrame.setTransform(transform);

        if (childFrame.position.length() < 0.1) {
          childFrame.arrow.visible = false;
        } else {
          childFrame.arrow.lookAt(parentFrame.getWorldPosition(new Vector3()));
          childFrame.arrow.rotateY(-Math.PI / 2);
          childFrame.arrow.visible = true;

          const arrowConeLength = childFrame.arrow.cone.scale.y;
          childFrame.arrow.setShaftDimensions({
            length: childFrame.position.length() - arrowConeLength,
          });
        }
      },
    );

    this.object?.children.forEach(child => {
      (child as any).arrow.visible = false;
    });
  }

  getFrameOrCreate(frameId: string) {
    const existingFrame = this.object?.getObjectByName(
      TfFrame.getName(frameId),
    );
    if (existingFrame) {
      return existingFrame as TfFrame;
    }

    const newFrame = new TfFrame(frameId);
    this.object?.add(newFrame);
    return newFrame;
  }
}

export default Tf;
