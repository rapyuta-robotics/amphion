import {
  BufferAttribute,
  BufferGeometry,
  Color,
  Material,
  Mesh,
  MeshBasicMaterial,
  Object3D,
  Quaternion,
  TorusGeometry,
  Vector3,
} from 'three';

import {
  OBJECT_TYPE_ARROW,
  OBJECT_TYPE_ARROW_WITH_CIRCLE,
  OBJECT_TYPE_AXES,
  OBJECT_TYPE_FLAT_ARROW,
} from './constants';

export const checkToleranceThresholdExceed = (
  oldPose: { position: Vector3; quaternion: Quaternion },
  newPose: { position: Vector3; quaternion: Quaternion },
  options: any,
) => {
  const { angleTolerance, positionTolerance } = options;
  const { position, quaternion } = newPose;
  const { position: oldPosition, quaternion: oldQuaternion } = oldPose;

  const positionToleranceBool =
    oldPosition.distanceTo(position) > positionTolerance;
  const angleToleranceBool = oldQuaternion.angleTo(quaternion) > angleTolerance;

  return positionToleranceBool || angleToleranceBool;
};

export const setObjectDimension = (object: any, options: any) => {
  switch (options.type) {
    case OBJECT_TYPE_ARROW: {
      const {
        alpha,
        color,
        headLength,
        headRadius,
        shaftLength,
        shaftRadius,
      } = options;

      object.setHeadDimensions({ radius: headRadius, length: headLength });
      object.setShaftDimensions({ radius: shaftRadius, length: shaftLength });
      object.setAlpha(alpha);
      object.setColor({
        cone: new Color(color),
        cylinder: new Color(color),
      });
      break;
    }
    case OBJECT_TYPE_AXES: {
      const { axesLength, axesRadius } = options;

      object.setLength(axesLength);
      object.setRadius(axesRadius);
      break;
    }
    case OBJECT_TYPE_FLAT_ARROW: {
      const { arrowLength, color } = options;

      object.setLength(arrowLength);
      object.setColor(new Color(color));
      break;
    }
    case OBJECT_TYPE_ARROW_WITH_CIRCLE:
      const {
        alpha,
        circleConeLength,
        circleConeRadius,
        circleRadius,
        color,
        headLength,
        headRadius,
        shaftLength,
        shaftRadius,
        tube,
      } = options;

      object.setHeadDimensions({ radius: headRadius, length: headLength });
      object.setShaftDimensions({ radius: shaftRadius, length: shaftLength });
      object.setTorusDimensions({ radius: circleRadius, tube });
      object.setCircleConeDimensions({
        radius: circleConeRadius,
        length: circleConeLength,
      });
      object.setAlpha(alpha);
      object.setColor({
        cone: new Color(color),
        cylinder: new Color(color),
        torus: new Color(color),
        circleCone: new Color(color),
      });
      break;
  }
};

export const removeChildren = (object: any) => {
  while (object.children.length > 0) {
    object.remove(object.children[0]);
  }
};

export function assertIsDefined<T>(val: T): asserts val is NonNullable<T> {
  if (val === undefined || val === null) {
    throw new TypeError(`Expected 'val' to be defined, but received ${val}`);
  }
}

export function assertIsMesh(val: any): asserts val is Mesh {
  if (!(val instanceof Mesh)) {
    throw new TypeError(`Expected 'val' to be mesh`);
  }
}

export function assertIsMaterial(val: any): asserts val is Material {
  if (!(val instanceof Material)) {
    throw new TypeError(`Expected 'val' to be Material`);
  }
}

export function assertIsMeshBasicMaterial(
  val: any,
): asserts val is MeshBasicMaterial {
  if (!(val instanceof MeshBasicMaterial)) {
    throw new TypeError(`Expected 'val' to be MeshBasicMaterial`);
  }
}

export function assertBehavesLikeArray<T>(val: any): asserts val is Array<T> {
  if (val.length === undefined) {
    throw new TypeError(`Expected 'val' to be an array`);
  }
}

export function isObject3D(val: any): val is Object3D {
  return val instanceof Object3D;
}

export function isHTMLElement(val: any): val is HTMLElement {
  return val instanceof HTMLElement;
}

export function assertIsTorusGeometry(val: any): asserts val is TorusGeometry {
  if (!(val instanceof TorusGeometry)) {
    throw new Error('the provided geometry was not TorusGeometry');
  }
}

export function assertIsHTMLVideoElement(
  val: any,
): asserts val is HTMLVideoElement {
  if (!(val instanceof HTMLVideoElement)) {
    throw new Error('the provided element must be an HTMLVideoElement');
  }
}

export function assertIsBufferGeometry(
  val: any,
): asserts val is BufferGeometry {
  if (!(val instanceof BufferGeometry)) {
    throw new Error('the provided attribute must be an BufferGeometry');
  }
}

export function assertIsBufferAttribute(
  val: any,
): asserts val is BufferAttribute {
  if (!(val instanceof BufferAttribute)) {
    throw new Error('the provided attribute must be an BufferAttribute');
  }
}
