import * as THREE from 'three';
import { MAX_POINTCLOUD_POINTS, POINT_FIELD_DATATYPES } from './constants';

export const getAccessorForDataType = (dataView, dataType) => {
  switch (dataType) {
    case POINT_FIELD_DATATYPES.INT8: {
      return dataView.getInt8;
    }
    case POINT_FIELD_DATATYPES.UINT8: {
      return dataView.getUint8;
    }
    case POINT_FIELD_DATATYPES.INT16: {
      return dataView.getInt16;
    }
    case POINT_FIELD_DATATYPES.UINT16: {
      return dataView.getUint16;
    }
    case POINT_FIELD_DATATYPES.INT32: {
      return dataView.getInt32;
    }
    case POINT_FIELD_DATATYPES.UINT32: {
      return dataView.getUint32;
    }
    case POINT_FIELD_DATATYPES.FLOAT64: {
      return dataView.getFloat64;
    }
    case POINT_FIELD_DATATYPES.FLOAT32:
    default: {
      return dataView.getFloat32;
    }
  }
};

export const setOrUpdateGeometryAttribute = (
  geometry,
  attribute,
  data,
  numPoints,
) => {
  if (geometry.attributes[attribute] === undefined) {
    geometry.addAttribute(
      attribute,
      new THREE.BufferAttribute(
        new Float32Array(data, 0, MAX_POINTCLOUD_POINTS * 3),
        3,
      ).setDynamic(true),
    );
  } else {
    geometry.attributes[attribute].array = data;
  }
  geometry.attributes[attribute].updateRange = {
    offset: 0,
    count: numPoints * 3,
  };
  geometry.attributes[attribute].needsUpdate = true;
};
