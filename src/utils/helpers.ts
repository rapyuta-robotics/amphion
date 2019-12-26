import { Color, Material, MeshBasicMaterial } from 'three';

import {
  OBJECT_TYPE_ARROW,
  OBJECT_TYPE_AXES,
  OBJECT_TYPE_FLAT_ARROW,
  OBJECT_TYPE_ARROW_WITH_CIRCLE,
} from './constants';
import Mesh from '../primitives/Mesh';

export const checkToleranceThresholdExceed = (
  oldPose: any,
  newPose: any,
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
      object.setAlpha({
        cone: alpha,
        cylinder: alpha,
        torus: alpha,
        circleCone: alpha,
      });
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
