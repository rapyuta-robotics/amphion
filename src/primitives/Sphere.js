import * as THREE from 'three';

import Mesh from './Mesh';

class Sphere extends Mesh {
    constructor(color , size , widthSegments , heightSegments ) {
        super();
        this.geometry = new THREE.SphereGeometry(
            size,
            widthSegments,
            heightSegments
        );
        this.material = new THREE.MeshStandardMaterial();
        this.material.transparent = true;
        this.mesh = new Mesh();
    }

    updateOptions(color = "0xffffff", alpha = 1, radius = 0.2, widthSegments = 32, heightSegments = 32) {
        this.material.color = new THREE.Color(color);
        this.material.opacity = alpha;
        this.geometry = new THREE.SphereGeometry(
            radius,
            widthSegments,
            heightSegments
        );
    }
}

export default Sphere;
