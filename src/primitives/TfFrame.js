import Axes from './Axes';
import Group from './Group';
import Text from './Text';
import Arrow from './Arrow';
import { HEAD_LENGTH, HEAD_RADIUS, SHAFT_LENGTH, SHAFT_RADIUS } from '../viz/Pose';
import { DEFAULT_COLOR_ARROW } from '../utils/defaults';

class TfFrame extends Group {
  constructor(frameId) {
    super();
    this.add(new Axes(0.015, 0.25));
    const textObject = new Text(frameId);
    textObject
      .rotateY(Math.PI)
      .translateX(0.03)
      .translateY(0.03);
    this.add(textObject);
    this.arrow = new Arrow();
    this.arrow.setHead({ length: HEAD_LENGTH / 2, radius: HEAD_RADIUS / 2 });
    this.arrow.setShaft({ length: SHAFT_LENGTH, radius: SHAFT_RADIUS / 5 });
    this.arrow.setColor({ cone: new THREE.Color('#FF1493'), cylinder: new THREE.Color(DEFAULT_COLOR_ARROW) });
    this.add(this.arrow);
    this.name = TfFrame.getName(frameId);
  }

  static getName(frameId) {
    return `tf-${frameId}`;
  }
}

export default TfFrame;
