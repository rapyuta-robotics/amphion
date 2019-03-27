import _ from 'lodash';
import Triangle from './Triangle';
import Group from './Group';

class TriangleList extends Group {
  constructor(points) {
    super();
    _.chunk(points, 3).forEach((verticesArray) => {
      this.add(new Triangle(verticesArray));
    });
  }
}

export default TriangleList;
