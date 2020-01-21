import LegacyCore from '../core';
import {
  COLLISION_OBJECT_OPERATIONS,
  DEFAULT_OPTIONS_COLLISION_OBJECT,
  MESSAGE_TYPE_COLLISION_OBJECT,
  SOLID_PRIMITIVE_TYPES,
} from '../utils/constants';
import Group from '../primitives/Group';
import Box from '../primitives/Box';
import { Ros } from 'roslib';
import { Object3D } from 'three';

class CollisionObject extends LegacyCore {
  public object: Object3D;

  constructor(
    ros?: Ros,
    topicName?: string,
    options = DEFAULT_OPTIONS_COLLISION_OBJECT,
  ) {
    super(ros ?? null, topicName ?? null, MESSAGE_TYPE_COLLISION_OBJECT, {
      ...DEFAULT_OPTIONS_COLLISION_OBJECT,
      ...options,
    });

    this.object = new Group();
    this.updateOptions({
      ...DEFAULT_OPTIONS_COLLISION_OBJECT,
      ...options,
    });
  }

  update(message: RosMessage.CollisionObject) {
    super.update(message);
    const { id, operation, primitive_poses: poses, primitives } = message;
    const existingObject = this.object.getObjectByName(id);
    switch (operation) {
      case COLLISION_OBJECT_OPERATIONS.ADD: {
        if (existingObject) {
          existingObject.parent?.remove(existingObject);
        }
        const newObject = new Group();
        newObject.name = id;
        primitives.forEach((primitiveInfo, index) => {
          const primitive = CollisionObject.getNewPrimitive(primitiveInfo);
          primitive?.setTransform({
            translation: poses[index].position,
            rotation: poses[index].orientation,
          });
          if (primitive) {
            newObject.add(primitive);
          }
        });
        this.object.add(newObject);
        break;
      }
      case COLLISION_OBJECT_OPERATIONS.REMOVE: {
        if (existingObject) {
          existingObject.parent?.remove(existingObject);
        }
        break;
      }
      case COLLISION_OBJECT_OPERATIONS.APPEND: {
        primitives.forEach((primitiveInfo, index) => {
          const primitive = CollisionObject.getNewPrimitive(primitiveInfo);
          primitive?.setTransform({
            translation: poses[index].position,
            rotation: poses[index].orientation,
          });
          if (primitive) {
            existingObject?.add(primitive);
          }
        });
        break;
      }
    }
  }

  static getNewPrimitive(args: { type: number; dimensions: number[] }) {
    const { type, dimensions } = args;
    switch (type) {
      case SOLID_PRIMITIVE_TYPES.BOX:
        const primitive = new Box();
        const [x, y, z] = dimensions;
        primitive.setScale({ x, y, z });
        return primitive;
      default:
        return null;
    }
  }
}

export default CollisionObject;
