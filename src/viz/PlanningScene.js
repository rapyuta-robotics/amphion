import Core from '../core';
import {
  DEFAULT_OPTIONS_PLANNINGSCENE,
  MESSAGE_TYPE_PLANNINGSCENE,
} from '../utils/constants';
import Group from '../primitives/Group';
import CollisionObject from './CollisionObject';

class PlanningScene extends Core {
  constructor(ros, topicName, options = DEFAULT_OPTIONS_PLANNINGSCENE) {
    super(ros, topicName, MESSAGE_TYPE_PLANNINGSCENE, {
      ...DEFAULT_OPTIONS_PLANNINGSCENE,
      ...options,
    });

    this.object = new Group();
    this.collisionObjectViz = new CollisionObject();
    this.object.add(this.collisionObjectViz.object);
    this.updateOptions({
      ...MESSAGE_TYPE_PLANNINGSCENE,
      ...options,
    });
  }

  update(message) {
    super.update(message);
    const {
      robot_state: {
        joint_state: { name, position },
      },
      world: { collision_objects },
    } = message;
    collision_objects.forEach(collisionMessage => {
      this.collisionObjectViz.update(collisionMessage);
    });
    name.forEach((jointName, index) => {
      const joint = this.object.getObjectByName(jointName);
      if (joint) {
        joint.setAngle([position[index]]);
      }
    });
  }
}

export default PlanningScene;
