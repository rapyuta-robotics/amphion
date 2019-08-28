import * as THREE from 'three';
import {
  MAX_POINTCLOUD_POINTS,
  POINT_FIELD_DATATYPES,
  POINTCLOUD_COLOR_CHANNELS,
} from './constants';

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

export const setOrUpdateGeometryAttribute = (geometry, attribute, data) => {
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
  geometry.attributes[attribute].needsUpdate = true;
};

let pclDecoderModule;
export class PCLDecoder {
  static decode(message, colorChannel, useRainbow) {
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
    return { positions, colors, normals };
  }

  static attachDecoder(module) {
    const { memory, PCLDecoder: PCLDecoderWasm } = module;
    pclDecoderModule = PCLDecoderWasm.new();

    const wasmDecode = (message, colorChannel, useRainbow) => {
      const n = message.height * message.width;
      const offsets = {};
      const normals = new Float32Array(3 * n);

      message.fields.forEach(f => {
        offsets[f.name] = f.offset;
      });

      const memoryTypedArray = new Uint8Array(memory.buffer);
      const copyMemPtr = pclDecoderModule.get_copy_memory_ptr();
      memoryTypedArray.set(message.data, copyMemPtr);
      pclDecoderModule.compute(
        n,
        message.point_step,
        offsets.x,
        offsets.y,
        offsets.z,
        offsets.rgb || 0,
        offsets.intensity || 0,
        colorChannel === POINTCLOUD_COLOR_CHANNELS.INTENSITY,
        useRainbow,
      );
      const positionMemPointer = pclDecoderModule.get_position_memory_ptr();
      const colorMemPointer = pclDecoderModule.get_color_memory_ptr();
      const positions = new Float32Array(
        module.memory.buffer,
        positionMemPointer,
        3 * n,
      );
      const colors = new Float32Array(
        module.memory.buffer,
        colorMemPointer,
        3 * n,
      );

      return { positions, colors, normals };
    };

    PCLDecoder.decode = wasmDecode;
  }
}
