import { MeshLambertMaterial, SphereGeometry } from 'three';

import Mesh from './Mesh';
import { DEFAULT_RADIAL_SEGMENTS } from '../utils/constants';

class Sphere extends Mesh {
  public readonly geometry: SphereGeometry;
  public readonly material: MeshLambertMaterial;

  constructor() {
    super();
    // Radius handled through scale
    this.geometry = new SphereGeometry(
      1,
      DEFAULT_RADIAL_SEGMENTS,
      DEFAULT_RADIAL_SEGMENTS,
    );
    this.material = new MeshLambertMaterial();
    this.material.transparent = true;
  }
}

export default Sphere;
