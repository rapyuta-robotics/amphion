import {
  BufferAttribute,
  BufferGeometry,
  Points,
  PointsMaterial,
  VertexColors,
} from 'three';
import {
  DEFAULT_OPTIONS_POINTCLOUD,
  MAX_POINTCLOUD_POINTS,
} from '../utils/constants';
import { PCLDecoder, updateGeometryAttribute } from '../utils/pcl';
import LiveCore from '../core/live';
import { DataSource } from '../data';
import { assertIsBufferGeometry, assertIsDefined } from '../utils/helpers';

const editPointCloudPoints = function(
  message: RosMessage.PointCloud2,
  options = DEFAULT_OPTIONS_POINTCLOUD,
) {
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

class PointCloud extends LiveCore<RosMessage.PointCloud2, Points> {
  constructor(
    source: DataSource<RosMessage.PointCloud2>,
    options = DEFAULT_OPTIONS_POINTCLOUD,
  ) {
    super({
      sources: [source],
      options: {
        ...DEFAULT_OPTIONS_POINTCLOUD,
        ...options,
      },
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

  updatePointCloudGeometry(
    positions: Float32Array,
    colors: Float32Array,
    normals: Float32Array,
  ) {
    assertIsDefined(this.object);
    const { geometry, material } = this.object;
    if (
      (material as PointsMaterial).size !== this.options.size &&
      !Number.isNaN(this.options.size)
    ) {
      (material as PointsMaterial).size = this.options.size;
      (material as PointsMaterial).needsUpdate = true;
    }
    const l = Math.min(MAX_POINTCLOUD_POINTS, Math.floor(positions.length / 3));
    assertIsBufferGeometry(geometry);
    geometry.setDrawRange(0, l);
    updateGeometryAttribute(geometry, 'position', positions, l);
    updateGeometryAttribute(geometry, 'color', colors, l);
    updateGeometryAttribute(geometry, 'normal', normals, l);
  }

  update = (message: RosMessage.PointCloud2) => {
    super.update(message);
    const { colors, normals, positions } = editPointCloudPoints(
      message,
      this.options as typeof DEFAULT_OPTIONS_POINTCLOUD,
    );
    this.updatePointCloudGeometry(positions, colors, normals);
  };
}

export default PointCloud;
