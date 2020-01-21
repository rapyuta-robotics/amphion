import { CylinderGeometry, MeshStandardMaterial } from 'three';
import {
  DEFAULT_COLOR_ARROW,
  DEFAULT_CYLINDER_HEIGHT,
  DEFAULT_CYLINDER_RADIUS,
  DEFAULT_RADIAL_SEGMENTS,
} from '../utils/constants';
import Mesh from './Mesh';

class Cylinder extends Mesh {
  public geometry: CylinderGeometry;
  public material: MeshStandardMaterial;

  constructor(
    color = DEFAULT_COLOR_ARROW,
    radius = DEFAULT_CYLINDER_RADIUS,
    height = DEFAULT_CYLINDER_HEIGHT,
  ) {
    super();
    this.geometry = new CylinderGeometry(
      radius,
      radius,
      height,
      DEFAULT_RADIAL_SEGMENTS,
    );
    this.material = new MeshStandardMaterial({ color });
    this.material.transparent = true;
    this.rotateX(Math.PI / 2);
  }
}

export default Cylinder;
