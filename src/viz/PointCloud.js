import * as THREE from 'three';

import Core from '../core';
import {
  DEFAULT_OPTIONS_POINTCLOUD,
  MAX_POINTCLOUD_POINTS,
  MESSAGE_TYPE_POINTCLOUD2,
  POINTCLOUD_COLOR_CHANNELS,
} from '../utils/constants';
import {
  getAccessorForDataType,
  setOrUpdateGeometryAttribute,
} from '../utils/pcl';

const editPointCloudPoints = function(message, options) {
  if (!message) {
    return {
      positions: new Float32Array(0),
      colors: new Float32Array(0),
      normals: new Float32Array(0),
    };
  }

  const { colorChannel, useRainbow } = options;

  const n = message.height * message.width;
  const positions = new Float32Array(3 * n);
  const colors = new Float32Array(3 * n);
  const normals = new Float32Array(3 * n);

  const uint8Buffer = Uint8Array.from(message.data).buffer;
  const dataView = new DataView(uint8Buffer);
  const offsets = {};
  const accessor = {};

  message.fields.forEach(f => {
    offsets[f.name] = f.offset;
    accessor[f.name] = getAccessorForDataType(dataView, message.datatype);
  });

  for (let i = 0; i < n; i++) {
    const stride = i * message.point_step;
    if (
      offsets.x !== undefined &&
      offsets.y !== undefined &&
      offsets.z !== undefined
    ) {
      positions[3 * i] = accessor.x.call(
        dataView,
        stride + offsets.x,
        !message.big_endian,
      );
      positions[3 * i + 1] = accessor.y.call(
        dataView,
        stride + offsets.y,
        !message.big_endian,
      );
      positions[3 * i + 2] = accessor.z.call(
        dataView,
        stride + offsets.z,
        !message.big_endian,
      );
    }

    if (
      offsets.rgb !== undefined &&
      colorChannel === POINTCLOUD_COLOR_CHANNELS.RGB
    ) {
      colors[3 * i] = dataView.getUint8(stride + offsets.rgb + 2) / 255.0;
      colors[3 * i + 1] = dataView.getUint8(stride + offsets.rgb + 1) / 255.0;
      colors[3 * i + 2] = dataView.getUint8(stride + offsets.rgb) / 255.0;
    }

    if (
      offsets.intensity !== undefined &&
      colorChannel === POINTCLOUD_COLOR_CHANNELS.INTENSITY
    ) {
      const intensity = accessor.intensity.call(
        dataView,
        stride + offsets.intensity,
        !message.big_endian,
      );
      colors[3 * i] = useRainbow ? 0 : Math.min(intensity / 255, 255);
      colors[3 * i + 1] = Math.min(intensity / 255, 255);
      colors[3 * i + 2] = useRainbow ? 0 : Math.min(intensity / 255, 255);
    }

    if (
      offsets.normal_x !== undefined &&
      offsets.normal_y !== undefined &&
      offsets.normal_z !== undefined
    ) {
      normals[3 * i] = accessor.normal_x.call(
        dataView,
        stride + offsets.normal_x,
        !message.big_endian,
      );
      normals[3 * i + 1] = accessor.normal_y.call(
        dataView,
        stride + offsets.normal_y,
        !message.big_endian,
      );
      normals[3 * i + 2] = accessor.normal_z.call(
        dataView,
        stride + offsets.normal_z,
        !message.big_endian,
      );
    }
  }

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
    const cloudMaterial = new THREE.PointsMaterial({
      size: 0.05,
      vertexColors: THREE.VertexColors,
    });
    const geometry = new THREE.BufferGeometry();
    geometry.setDrawRange(0, 0);
    geometry.computeBoundingSphere();
    this.object = new THREE.Points(geometry, cloudMaterial);
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
    } else if (material.needsUpdate) {
      material.needsUpdate = false;
    }
    const l = Math.min(MAX_POINTCLOUD_POINTS, positions.length);
    geometry.setDrawRange(0, l);
    setOrUpdateGeometryAttribute(geometry, 'position', positions);
    setOrUpdateGeometryAttribute(geometry, 'color', colors);
    setOrUpdateGeometryAttribute(geometry, 'normal', normals);
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
