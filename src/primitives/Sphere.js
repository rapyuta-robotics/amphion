import * as THREE from 'three';

import Mesh from './Mesh';
import { DEFAULT_RADIAL_SEGMENTS } from '../utils/constants';

class Sphere extends Mesh {
    constructor(color , radius) {
        super();
        this.geometry = new THREE.SphereGeometry(
            radius,
            DEFAULT_RADIAL_SEGMENTS,
            DEFAULT_RADIAL_SEGMENTS
        );
        this.material = new THREE.MeshStandardMaterial();
        this.material.transparent = true;
    }

    updateOptions(color, alpha, radius) {
        this.setColor(color);
        this.setAlpha(alpha);
        this.geometry = new THREE.SphereGeometry(
            radius
        );
    }
}

export default Sphere;
