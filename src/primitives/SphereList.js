import { Geometry, MeshBasicMaterial } from 'three';

import Mesh from './Mesh';
import ObjectCacher from '../utils/objectCacher';
import { MARKER_OBJECT_TYPES } from '../utils/constants';
import Sphere from './Sphere';

class SphereList extends Mesh {
  constructor() {
    super();
    this.geometry = new Geometry();
    this.material = new MeshBasicMaterial();
    this.objectCacher = new ObjectCacher(this, Sphere);
  }

  updatePoints(points, colors, options = {}) {
    options.subtype = MARKER_OBJECT_TYPES.SPHERE;

    if (points.length < this.children.length) {
      this.objectCacher.reusePool(points, colors, options);
    } else {
      this.objectCacher.increasePool(points, colors, options);
    }
  }
}

export default SphereList;
