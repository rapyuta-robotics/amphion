import * as THREE from 'three';

import Mesh from './Mesh';
import ObjectCacher from '../utils/objectCacher';
import { MARKER_OBJECT_TYPES } from '../utils/constants';

class CubeList extends Mesh {
  constructor() {
    super();
    this.geometry = new THREE.Geometry();
    this.material = new THREE.MeshBasicMaterial();
    this.objectCacher = new ObjectCacher(this);
  }

  updatePoints(points, colors, options = {}) {
    options.subtype = MARKER_OBJECT_TYPES.CUBE;

    if (points.length < this.children.length) {
      this.objectCacher.reusePool(points, colors, options);
    } else {
      this.objectCacher.increasePool(points, colors, options);
    }
  }
}

export default CubeList;
