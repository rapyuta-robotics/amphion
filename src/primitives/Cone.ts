import { ConeGeometry, MeshLambertMaterial } from 'three';

import Mesh from './Mesh';
import {
  DEFAULT_COLOR_X_AXIS,
  DEFAULT_CONE_HEIGHT,
  DEFAULT_CONE_RADIUS,
  DEFAULT_RADIAL_SEGMENTS,
} from '../utils/constants';

class Cone extends Mesh {
  public readonly material: MeshLambertMaterial;
  public readonly geometry: ConeGeometry;

  constructor(color = DEFAULT_COLOR_X_AXIS) {
    super();
    this.geometry = new ConeGeometry(
      DEFAULT_CONE_RADIUS,
      DEFAULT_CONE_HEIGHT,
      DEFAULT_RADIAL_SEGMENTS,
    );
    this.material = new MeshLambertMaterial({ color });
    this.material.transparent = true;
  }
}

export default Cone;
