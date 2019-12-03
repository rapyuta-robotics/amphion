import {
  PointsMaterial,
  VertexColors,
  BufferGeometry,
  BufferAttribute,
  Points,
} from 'three';
import Core from '../core';
import {
  DEFAULT_OPTIONS_POINTCLOUD,
  MAX_POINTCLOUD_POINTS,
  MESSAGE_TYPE_POINTCLOUD2,
} from '../utils/constants';
import { PCLDecoder, updateGeometryAttribute } from '../utils/pcl';

const editPointCloudPoints = function(message, options) {
  if (!message) {
    return {
      positions: new Float32Array(0),
      colors: new Float32Array(0),
      normals: new Float32Array(0),
    };
  }

  const { colorChannel, useRainbow } = options;

  const { colors, normals, positions } = PCLDecoder.decode(
    message,
    colorChannel,
    useRainbow,
  );

  return {
    positions,
    colors,
    normals,
  };
};

class PointCloud extends Core {
  constructor(ros, topicName, options = DEFAULT_OPTIONS_POINTCLOUD) {
    super(ros, topicName, MESSAGE_TYPE_POINTCLOUD2, {
      ...DEFAULT_OPTIONS_POINTCLOUD,
      ...options,
    });
    const cloudMaterial = new PointsMaterial({
      size: this.options.size,
      vertexColors: VertexColors,
    });
    const geometry = new BufferGeometry();
    geometry.addAttribute(
      'position',
      new BufferAttribute(
        new Float32Array(MAX_POINTCLOUD_POINTS * 3),
        3,
      ).setDynamic(true),
    );
    geometry.addAttribute(
      'color',
      new BufferAttribute(
        new Float32Array(MAX_POINTCLOUD_POINTS * 3),
        3,
      ).setDynamic(true),
    );
    geometry.addAttribute(
      'normal',
      new BufferAttribute(
        new Float32Array(MAX_POINTCLOUD_POINTS * 3),
        3,
      ).setDynamic(true),
    );
    geometry.setDrawRange(0, 0);
    geometry.computeBoundingSphere();
    this.object = new Points(geometry, cloudMaterial);
    this.object.frustumCulled = false;
    this.updateOptions({
      ...DEFAULT_OPTIONS_POINTCLOUD,
      ...options,
    });
  }

  updatePointCloudGeometry(positions, colors, normals) {
    const { geometry, material } = this.object;
    if (
      material.size !== this.options.size &&
      !Number.isNaN(this.options.size)
    ) {
      material.size = this.options.size;
      material.needsUpdate = true;
    }
    const l = Math.min(MAX_POINTCLOUD_POINTS, Math.floor(positions.length / 3));
    geometry.setDrawRange(0, l);
    updateGeometryAttribute(geometry, 'position', positions, l);
    updateGeometryAttribute(geometry, 'color', colors, l);
    updateGeometryAttribute(geometry, 'normal', normals, l);
  }

  update(message) {
    super.update(message);
    const { colors, normals, positions } = editPointCloudPoints(
      message,
      this.options,
    );
    this.updatePointCloudGeometry(positions, colors, normals);
  }
}

export default PointCloud;
