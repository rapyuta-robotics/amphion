import { Geometry, MeshBasicMaterial } from 'three';
import Mesh from './Mesh';
import ObjectCacher from '../utils/objectCacher';
import { MARKER_OBJECT_TYPES } from '../utils/constants';
import Cube from './Cube';

class CubeList extends Mesh {
  private readonly objectCacher: ObjectCacher;

  constructor() {
    super();
    this.geometry = new Geometry();
    this.material = new MeshBasicMaterial();
    this.objectCacher = new ObjectCacher(this, Cube);
  }

  updatePoints(
    points: RosMessage.Point[],
    colors: Array<RosMessage.Color | null>,
    options: { scale?: RosMessage.Point },
  ) {
    const optionsOverride = {
      ...options,
      subType: MARKER_OBJECT_TYPES.CUBE,
    };

    if (points.length < this.children.length) {
      this.objectCacher.reusePool(points, colors, optionsOverride);
    } else {
      this.objectCacher.increasePool(points, colors, optionsOverride);
    }
  }
}

export default CubeList;
