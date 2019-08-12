import { MeshPhongMaterial } from 'three';

import Core from '../core';
import {
  DEFAULT_OPTIONS_DISPLAYTRAJECTORY,
  MESSAGE_TYPE_DISPLAYTRAJECTORY,
} from '../utils/constants';
import Group from '../primitives/Group';

class DisplayTrajectory extends Core {
  constructor(ros, topicName, options = DEFAULT_OPTIONS_DISPLAYTRAJECTORY) {
    super(ros, topicName, MESSAGE_TYPE_DISPLAYTRAJECTORY, options);

    this.object = new Group();
    this.updateOptions({
      ...MESSAGE_TYPE_DISPLAYTRAJECTORY,
      ...options,
    });
    const { robot } = this.options;
    const robotCopy = robot.clone();
    Object.keys(robotCopy.links).forEach(linkName => {
      const link = robotCopy.links[linkName];
      link.traverse(child => {
        if(child.material) {
          child.material = new MeshPhongMaterial({ color: '#ff0000' });
        }
      });
    });
    this.robotCopy = robotCopy;
  }

  update(message) {
    super.update(message);
    const {
      trajectory_start: {
        joint_state: {
          name: initialNames,
          position: initialPositions
        },
      },
      trajectory: [{
        joint_trajectory: {
          joint_names: jointNames,
          points,
        },
      }],
    } = message;
    const robotClone = this.robotCopy.clone(true);
    this.object.add(robotClone);
    initialNames.forEach((name, index) => {
      const joint = robotClone.getObjectByName(name);
      if(joint) {
        joint.setAngle(initialPositions[index]);
      }
    });
    points.forEach(point => {
      const {
        positions,
        time_from_start: {
          secs,
          nsecs,
        },
      } = point;
      setTimeout(() => {
        jointNames.forEach((jointName, index) => {
          const joint = robotClone.getObjectByName(jointName);
          if(joint) {
            joint.setAngle(positions[index]);
          }
        });
      }, (1000 * secs) + (nsecs / 1000000));
    });
    if(points.length > 0) {
      const {
        time_from_start: {
          secs: lastSec,
          nsecs: lastNsec,
        }
      } = points[points.length - 1];
      setTimeout(() => {
        robotClone.parent.remove(robotClone);
      }, (1000 * lastSec) + (lastNsec / 1000000));
    }
  }
}

export default DisplayTrajectory;
