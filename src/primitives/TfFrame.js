import Axes from './Axes';
import Group from './Group';
import Text from './Text';

class TfFrame extends Group {
  constructor(name) {
    super();
    this.add(new Axes(0.015, 0.25));
    const textObject = new Text(name);
    textObject
      .rotateY(Math.PI)
      .translateX(0.03)
      .translateY(0.03);
    this.add(textObject);
    this.name = name;
  }
}

export default TfFrame;
