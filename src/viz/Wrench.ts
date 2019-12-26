import { Group, Quaternion, Vector3 } from 'three';
import {
  DEFAULT_OPTIONS_WRENCH,
  WRENCH_OBJECT_TYPES,
} from '../utils/constants';
import Arrow from '../primitives/Arrow';
import ArrowWithCircle from '../primitives/ArrowWithCircle';
import { setObjectDimension } from '../utils/helpers';
import LiveCore from '../core/live';
import { DataSource } from '../data';

class Wrench extends LiveCore<RosMessage.WrenchStamped, Group> {
  private primitiveX: Arrow | ArrowWithCircle | null = null;
  private primitiveY: Arrow | ArrowWithCircle | null = null;

  constructor(
    source: DataSource<RosMessage.WrenchStamped>,
    options = DEFAULT_OPTIONS_WRENCH,
  ) {
    super({
      sources: [source],
      options: {
        ...DEFAULT_OPTIONS_WRENCH,
        ...options,
      },
    });
    this.object = new Group();
  }

  static getNewPrimitive(options: { type: string }) {
    const { type } = options;
    let newObject = null;

    switch (type) {
      case WRENCH_OBJECT_TYPES.arrow:
        newObject = new Arrow();
        break;
      case WRENCH_OBJECT_TYPES.arrowWithCircle:
        newObject = new ArrowWithCircle();
        break;
    }
    return newObject;
  }

  getOrUpdatePrimitive(
    primitive: Arrow | ArrowWithCircle | null,
    type: string,
  ) {
    const mustUpdatePrimitive = primitive === null || primitive?.type !== type;

    if (mustUpdatePrimitive) {
      if (primitive) {
        this.object?.remove(primitive);
      }
      const object = Wrench.getNewPrimitive({ type });
      if (object) {
        this.object?.add(object);
      }
      return object;
    }

    return primitive;
  }

  updateOptions(options: { [p: string]: any }) {
    super.updateOptions(options);
    this.primitiveX = this.getOrUpdatePrimitive(
      this.primitiveX,
      WRENCH_OBJECT_TYPES.arrow,
    );
    this.primitiveY = this.getOrUpdatePrimitive(
      this.primitiveY,
      WRENCH_OBJECT_TYPES.arrowWithCircle,
    );

    const forceOptions = {
      color: this.options.forceColor,
      alpha: this.options.alpha,
      headLength: this.options.headLength * this.options.forceArrowScale,
      headRadius: this.options.headRadius * this.options.arrowWidth,
      shaftLength: this.options.shaftLength * this.options.forceArrowScale,
      shaftRadius: this.options.shaftRadius * this.options.arrowWidth,
      type: WRENCH_OBJECT_TYPES.arrow,
    };

    const torqueOptions = {
      color: this.options.torqueColor,
      alpha: this.options.alpha,
      arc: this.options.arc,
      circleConeRadius: this.options.circleConeRadius * this.options.arrowWidth,
      circleConeLength: this.options.circleConeLength * this.options.arrowWidth,
      circleRadius: this.options.circleRadius * this.options.torqueArrowScale,
      headLength: this.options.headLength * this.options.torqueArrowScale,
      headRadius: this.options.headRadius * this.options.arrowWidth,
      shaftLength: this.options.shaftLength * this.options.torqueArrowScale,
      shaftRadius: this.options.shaftRadius * this.options.arrowWidth,
      tube: this.options.tube * this.options.arrowWidth,
      tubularSegments: this.options.tubularSegments,
      type: WRENCH_OBJECT_TYPES.arrowWithCircle,
    };

    setObjectDimension(this.primitiveX, forceOptions);
    setObjectDimension(this.primitiveY, torqueOptions);
  }

  update(message: RosMessage.WrenchStamped) {
    super.update(message);
    const {
      wrench: { force, torque },
    } = message;
    const translationVector = new Vector3(1, 0, 0);
    const forceVector = new Vector3(force.x, force.y, force.z).normalize();
    const torqueVector = new Vector3(torque.x, torque.y, torque.z).normalize();
    const forceQuaternion = new Quaternion().setFromUnitVectors(
      translationVector,
      forceVector,
    );
    const torqueQuaternion = new Quaternion().setFromUnitVectors(
      translationVector,
      torqueVector,
    );
    this.primitiveX?.setTransform({
      translation: { y: 0, x: 0, z: 0 },
      rotation: forceQuaternion,
    });
    this.primitiveY?.setTransform({
      translation: { y: 0, x: 0, z: 0 },
      rotation: torqueQuaternion,
    });
  }
}

export default Wrench;
