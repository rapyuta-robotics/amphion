import { ConeGeometry, MeshStandardMaterial } from 'three';

import Mesh from './Mesh';
import {
  DEFAULT_COLOR_X_AXIS,
  DEFAULT_CONE_HEIGHT,
  DEFAULT_CONE_RADIUS,
  DEFAULT_RADIAL_SEGMENTS,
} from '../utils/constants';

class Cone extends Mesh {
  public readonly material: MeshStandardMaterial;
  public readonly geometry: ConeGeometry;

  constructor(color = DEFAULT_COLOR_X_AXIS) {
    super();
    this.geometry = new ConeGeometry(
      DEFAULT_CONE_RADIUS,
      DEFAULT_CONE_HEIGHT,
      DEFAULT_RADIAL_SEGMENTS,
    );
    this.material = new MeshStandardMaterial({ color });
    this.material.transparent = true;
  }
}

export default Cone;
