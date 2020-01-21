import LegacyCore from '../core';
import {
  COLLISION_OBJECT_OPERATIONS,
  DEFAULT_OPTIONS_PLANNINGSCENE,
  MESSAGE_TYPE_PLANNINGSCENE,
} from '../utils/constants';
import Group from '../primitives/Group';
import CollisionObject from './CollisionObject';
import { Ros } from 'roslib';
import { assertIsDefined } from '../utils/helpers';
import { URDFJoint } from 'urdf-js/src/URDFClasses';

class PlanningScene extends LegacyCore {
  private readonly collisionObjectViz = new CollisionObject();
  private readonly attachedCollisionObjects = new Map();

  constructor(
    ros: Ros,
    topicName: string,
    options = DEFAULT_OPTIONS_PLANNINGSCENE,
  ) {
    super(ros, topicName, MESSAGE_TYPE_PLANNINGSCENE, {
      ...DEFAULT_OPTIONS_PLANNINGSCENE,
      ...options,
    });

    this.object = new Group();
    this.object.add(this.collisionObjectViz.object);
    this.updateOptions({
      ...DEFAULT_OPTIONS_PLANNINGSCENE,
      ...options,
    });
  }

  update(message: RosMessage.PlanningScene) {
    super.update(message);
    const {
      robot_state: {
        attached_collision_objects: attachedCollisionObjects = [],
        is_diff: isRobotStateDiff,
        joint_state: { name, position },
      },
      world: { collision_objects: worldCollisionObjects },
    } = message;
    worldCollisionObjects.forEach(collisionMessage => {
      this.collisionObjectViz.update(collisionMessage);
    });
    if (attachedCollisionObjects.length) {
      attachedCollisionObjects.map(({ link_name: linkName, object }) => {
        const collisionVizInstance = new CollisionObject();
        const collisionVizObject = this.object?.getObjectByName(linkName);
        assertIsDefined(collisionVizObject);
        collisionVizInstance.object = collisionVizObject as Group;
        collisionVizInstance.update(object);
        this.attachedCollisionObjects.set(object.id, collisionVizInstance);
      });
    }
    if (!isRobotStateDiff) {
      const newCollisionObjectNames = attachedCollisionObjects.map(
        ({ object: { id } }) => id,
      );
      for (const [
        collObjName,
        collObj,
      ] of this.attachedCollisionObjects.entries()) {
        if (newCollisionObjectNames.indexOf(collObjName) === -1) {
          collObj.update({
            id: collObjName,
            operation: COLLISION_OBJECT_OPERATIONS.REMOVE,
          });
          this.attachedCollisionObjects.delete(collObjName);
        }
      }
    }
    name.forEach((jointName, index) => {
      const joint = this.object?.getObjectByName(jointName) as URDFJoint;
      if (joint) {
        joint.setAngle(position[index]);
      }
    });
  }
}

export default PlanningScene;
