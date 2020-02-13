import { Geometry, MeshBasicMaterial } from 'three';
import Mesh from './Mesh';
import ObjectCacher from '../utils/objectCacher';
import { MARKER_OBJECT_TYPES } from '../utils/constants';
import Sphere from './Sphere';

class SphereList extends Mesh {
  private readonly objectCacher: ObjectCacher;

  constructor() {
    super();
    this.geometry = new Geometry();
    this.material = new MeshBasicMaterial();
    this.objectCacher = new ObjectCacher(this, Sphere);
  }

  updatePoints(
    points: RosMessage.Point[],
    colors: Array<RosMessage.Color | null>,
    options: { scale: RosMessage.Point },
  ) {
    const optionsOverride = {
      ...options,
      subtype: MARKER_OBJECT_TYPES.SPHERE,
    };

    if (points.length < this.children.length) {
      this.objectCacher.reusePool(points, colors, optionsOverride);
    } else {
      this.objectCacher.increasePool(points, colors, optionsOverride);
    }
  }
}

export default SphereList;
