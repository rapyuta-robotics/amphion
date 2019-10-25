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
      ...DEFAULT_OPTIONS_DISPLAYTRAJECTORY,
      ...options,
    });
    const { robot } = this.options;
    const robotCopy = robot.clone();
    Object.keys(robotCopy.links).forEach(linkName => {
      const link = robotCopy.links[linkName];
      link.traverse(child => {
        if (child.material) {
          child.material = new MeshPhongMaterial({ color: '#ff0000' });
        }
      });
    });
    this.robotCopy = robotCopy;
    this.lastMessage = null;
    this.loopbackId = null;
    this.poseRemovalId = null;
    this.pointsUpdateIds = [];
  }

  update(message, loopback) {
    clearTimeout(this.loopbackId);
    clearTimeout(this.poseRemovalId);
    this.pointsUpdateIds.map(x => clearTimeout(x));
    this.pointsUpdateIds = [];
    if (this.robotClone && this.robotClone.parent) {
      this.robotClone.parent.remove(this.robotClone);
    }
    if (!loopback) {
      this.lastMessage = message;
    }

    super.update(message);
    const {
      trajectory: [
        {
          joint_trajectory: { joint_names: jointNames, points },
        },
      ],
      trajectory_start: {
        joint_state: { name: initialNames, position: initialPositions },
      },
    } = message;
    this.robotClone = this.robotCopy.clone(true);
    this.object.add(this.robotClone);
    initialNames.forEach((name, index) => {
      const joint = this.robotClone.getObjectByName(name);
      if (joint) {
        joint.setAngle(initialPositions[index]);
      }
    });
    points.forEach(point => {
      const {
        positions,
        time_from_start: { nsecs, secs },
      } = point;
      this.pointsUpdateIds.push(
        setTimeout(() => {
          jointNames.forEach((jointName, index) => {
            const joint = this.robotClone.getObjectByName(jointName);
            if (joint) {
              joint.setAngle(positions[index]);
            }
          });
        }, 1000 * secs + nsecs / 1000000),
      );
    });
    if (points.length > 0) {
      const {
        time_from_start: { nsecs: lastNsec, secs: lastSec },
      } = points[points.length - 1];
      this.poseRemovalId = setTimeout(() => {
        this.robotClone.parent.remove(this.robotClone);
        if (this.options.loop) {
          this.loopbackId = setTimeout(() => {
            this.update(this.lastMessage, true);
          }, 1000);
        }
      }, 1000 * lastSec + lastNsec / 1000000);
    }
  }
}

export default DisplayTrajectory;
