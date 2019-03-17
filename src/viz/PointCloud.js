import * as THREE from 'three';
import Core from '../core';
import { MESSAGE_TYPE_POINTCLOUD, MAX_POINTCLOUD_POINTS } from '../utils/constants';

class PointCloud extends Core {
  constructor(ros, topicName, messageType = MESSAGE_TYPE_POINTCLOUD, userOptions) {
    super(ros, topicName, messageType);

    const options = {
      // ...defaultOptions,
      // ...userOptions,
    };
    const material = new THREE.PointsMaterial({
      size: 0.01,
      vertexColors: THREE.VertexColors,
    });
    const geometry = new THREE.BufferGeometry();
    geometry.addAttribute(
      'position',
      new THREE.BufferAttribute(
        new Float32Array(MAX_POINTCLOUD_POINTS * 3),
        3,
      ).setDynamic(true),
    );
    geometry.addAttribute(
      'color',
      new THREE.BufferAttribute(
        new Float32Array(MAX_POINTCLOUD_POINTS * 3),
        3,
      ).setDynamic(true),
    );
    geometry.setDrawRange(0, 0);
    this.object = new THREE.Points(geometry, material);
    this.object.frustumCulled = false;
  }
}

export default PointCloud;
