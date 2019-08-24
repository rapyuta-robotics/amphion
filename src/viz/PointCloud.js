import * as THREE from 'three';

import Core from '../core';
import {
  MESSAGE_TYPE_POINTCLOUD2,
  MAX_POINTCLOUD_POINTS,
  DEFAULT_OPTIONS_POINTCLOUD,
} from '../utils/constants';

const readPoint = (offsets, dataView, index, isBigendian, pointStep) => {
  const baseOffset = index * pointStep;
  const rgb = dataView.getUint32(baseOffset + offsets.rgb, !isBigendian);
  const hex = rgb.toString(16).padStart(6, '0');
  return {
    x: dataView.getFloat32(baseOffset + offsets.x, !isBigendian),
    y: dataView.getFloat32(baseOffset + offsets.y, !isBigendian),
    z: dataView.getFloat32(baseOffset + offsets.z, !isBigendian),
    hex,
  };
};

const BASE64 =
  'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=';
function decode64(x) {
  const a = [];
  let z = 0;
  let bits = 0;

  for (let i = 0, len = x.length; i < len; i++) {
    z += BASE64.indexOf(x[i]);
    bits += 6;
    if (bits >= 8) {
      bits -= 8;
      a.push(z >> bits);
      z &= 2 ** bits - 1;
    }
    z <<= 6;
  }
  return a;
}

const editPointCloudPoints = function(message) {
  const positions = [];
  const colors = [];
  if (message) {
    const { fields } = message;
    const offsets = {};

    fields.forEach(f => {
      offsets[f.name] = f.offset;
    });

    const n = message.height * message.width;
    const uint8Buffer = Uint8Array.from(decode64(message.data)).buffer;
    const dataView = new DataView(uint8Buffer);
    for (let i = 0; i < n; i++) {
      const pt = readPoint(
        offsets,
        dataView,
        i,
        message.is_bigendian,
        message.point_step,
      );
      if (pt.x && pt.y && pt.z) {
        positions.push(pt.x, pt.y, pt.z);
        const color = new THREE.Color(`#${pt.hex}`);
        colors.push(color.r, color.g, color.b);
      }
    }
  }
  return {
    positions: Float32Array.from(positions),
    colors: Float32Array.from(colors),
  };
};

class PointCloud extends Core {
  constructor(
    ros,
    topicName,
    messageType = MESSAGE_TYPE_POINTCLOUD2,
    options = DEFAULT_OPTIONS_POINTCLOUD,
  ) {
    super(ros, topicName, messageType, options);
    const cloudMaterial = new THREE.PointsMaterial({
      size: 0.1,
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
    this.object = new THREE.Points(geometry, cloudMaterial);
    this.object.frustumCulled = false;
    this.updateOptions({
      ...DEFAULT_OPTIONS_POINTCLOUD,
      ...options,
    });
  }

  updatePointCloudGeometry(positions, colors) {
    const { geometry } = this.object;
    const l = Math.min(MAX_POINTCLOUD_POINTS, positions.length);
    geometry.setDrawRange(0, l);
    const geoPositions = geometry.attributes.position.array;
    const geoColors = geometry.attributes.color.array;

    for (let i = 0, arrayLength = l * 3; i < arrayLength; i++) {
      geoPositions[i] = positions[i] || 0;
      geoColors[i] = colors[i] || 0;
    }
    for (let i = l * 3; i < MAX_POINTCLOUD_POINTS; i++) {
      geoPositions[i] = 0;
    }

    geometry.attributes.position.needsUpdate = true;
    geometry.attributes.color.needsUpdate = true;
  }

  update(message) {
    super.update(message);
    const { colors, positions } = editPointCloudPoints(message);
    this.updatePointCloudGeometry(positions, colors);
  }
}

export default PointCloud;
