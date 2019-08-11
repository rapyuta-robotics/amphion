import Core from '../core';
import {
  COLLISION_OBJECT_OPERATIONS,
  DEFAULT_OPTIONS_COLLISION_OBJECT,
  MESSAGE_TYPE_COLLISION_OBJECT,
  SOLID_PRIMITIVE_TYPES,
} from '../utils/constants';
import Group from '../primitives/Group';
import Box from '../primitives/Box';

class CollisionObject extends Core {
  constructor(ros, topicName, options = DEFAULT_OPTIONS_COLLISION_OBJECT) {
    super(ros, topicName, MESSAGE_TYPE_COLLISION_OBJECT, options);

    this.object = new Group();
    this.updateOptions({
      ...MESSAGE_TYPE_COLLISION_OBJECT,
      ...options,
    });
  }

  update(message) {
    super.update(message);
    const { operation, id, primitives, primitive_poses: poses } = message;
    const existingObject = this.object.getObjectByName(id);
    switch(operation) {
      case COLLISION_OBJECT_OPERATIONS.ADD: {
        if(existingObject) {
          existingObject.parent.remove(existingObject);
        }
        const newObject = new THREE.Group();
        newObject.name = id;
        primitives.forEach((primitiveInfo, index) => {
          const primitive = CollisionObject.getNewPrimitive(primitiveInfo);
          primitive.setTransform({
            translation: poses[index].position,
            rotation: poses[index].orientation,
          });
          newObject.add(primitive);
        });
        this.object.add(newObject);
        break;
      }
      case COLLISION_OBJECT_OPERATIONS.REMOVE: {
        if(existingObject) {
          existingObject.parent.remove(existingObject);
        }
      }
      break;
      case COLLISION_OBJECT_OPERATIONS.APPEND: {
        primitives.forEach(primitiveInfo => {
          const primitive = CollisionObject.getNewPrimitive(primitiveInfo);
          primitive.setTransform({
            translation: primitiveInfo.position,
            rotation: primitiveInfo.orientation,
          });
          existingObject.add(primitive);
        });
      }
      break;
    }
  }
  static getNewPrimitive({ type, dimensions }) {
    switch(type) {
      case SOLID_PRIMITIVE_TYPES.BOX:
        const primitive = new Box();
        const [x, y, z] = dimensions;
        primitive.setScale({ x, y, z });
        return primitive;
    }
  }
}

export default CollisionObject;
