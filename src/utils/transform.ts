import {
  Color,
  Mesh,
  Object3D,
  Quaternion,
  MeshBasicMaterial,
  LineBasicMaterial,
} from 'three';
import { assertIsMeshBasicMaterial } from './helpers';
import Line from '../primitives/Line';
import LineSegments from '../primitives/LineSegment';

export interface Transform {
  translation: { x: number; y: number; z: number };
  rotation: { w: number; x: number; y: number; z: number };
}

export const setTransform = (object: Object3D, transform: Transform) => {
  const {
    translation: { x: posX, y: posY, z: posZ },
    rotation: { w: orientW, x: orientX, y: orientY, z: orientZ },
  } = transform;
  object.position.set(posX, posY, posZ);
  object.quaternion.copy(
    new Quaternion(orientX, orientY, orientZ, orientW).normalize(),
  );
};

export const setScale = (object: Object3D, scale: RosMessage.Point) => {
  const { x, y, z } = scale;
  object.scale.set(x, y, z);
};

export const setColor = (
  object: Mesh | Line | LineSegments,
  color: string | number | RosMessage.Color,
): void | never => {
  if (
    !(object.material instanceof MeshBasicMaterial) &&
    !(object.material instanceof LineBasicMaterial)
  ) {
    throw new TypeError(
      `Expected 'val' to be MeshBasicMaterial | LineBasicMaterial`,
    );
  }

  if (typeof color === 'string' || typeof color === 'number') {
    object.material.color = new Color(color);
  } else {
    object.material.color.setRGB(color.r, color.g, color.b);
  }
};
