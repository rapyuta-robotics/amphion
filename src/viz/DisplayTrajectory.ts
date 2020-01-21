import { Mesh, MeshPhongMaterial } from 'three';

import LegacyCore from '../core';
import {
  DEFAULT_OPTIONS_DISPLAYTRAJECTORY,
  MESSAGE_TYPE_DISPLAYTRAJECTORY,
} from '../utils/constants';
import Group from '../primitives/Group';
import { Ros } from 'roslib';
import { URDFJoint, URDFRobot } from 'urdf-js/src/URDFClasses';

class DisplayTrajectory extends LegacyCore {
  private readonly robotClone: URDFRobot;
  private lastMessage?: RosMessage.DisplayTrajectory;
  private loopbackId?: number;
  private poseRemovalId?: number;
  private pointsUpdateIds: number[] = [];

  constructor(
    ros: Ros,
    topicName: string,
    options = DEFAULT_OPTIONS_DISPLAYTRAJECTORY,
  ) {
    super(ros, topicName, MESSAGE_TYPE_DISPLAYTRAJECTORY, options);

    this.object = new Group();
    this.updateOptions({
      ...DEFAULT_OPTIONS_DISPLAYTRAJECTORY,
      ...options,
    });
    const { robot } = this.options;
    this.robotClone = robot.clone(true);

    Object.keys(this.robotClone.links).forEach(linkName => {
      const link = this.robotClone.links[linkName];
      link.traverse(child => {
        if ((child as Mesh).material) {
          (child as Mesh).material = new MeshPhongMaterial({
            color: '#ff0000',
          });
        }
      });
    });
  }

  updateOptions(options: any) {
    super.updateOptions(options);
    if (options.loop && this.lastMessage) {
      this.update(this.lastMessage, true);
    } else {
      this.resetLoopback();
    }
  }

  resetLoopback() {
    clearTimeout(this.loopbackId);
    clearTimeout(this.poseRemovalId);
    if (this.pointsUpdateIds) {
      this.pointsUpdateIds.map(x => clearTimeout(x));
    }
    this.pointsUpdateIds = [];
    if (this.robotClone && this.robotClone.parent) {
      this.robotClone.parent.remove(this.robotClone);
    }
  }

  update(message: RosMessage.DisplayTrajectory, loopback?: boolean) {
    const { loop } = this.options;
    this.resetLoopback();
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
    this.object?.add(this.robotClone);
    initialNames.forEach((name, index) => {
      const joint = this.robotClone.getObjectByName(name) as URDFJoint;
      if (joint) {
        joint.setAngle(initialPositions[index]);
      }
    });
    points.forEach(point => {
      const {
        positions,
        time_from_start: { nsec, sec },
      } = point;
      this.pointsUpdateIds.push(
        window.setTimeout(() => {
          jointNames.forEach((jointName, index) => {
            const joint = this.robotClone.getObjectByName(
              jointName,
            ) as URDFJoint;
            if (joint) {
              joint.setAngle(positions[index]);
            }
          });
        }, 1000 * sec + nsec / 1000000),
      );
    });
    if (points.length > 0) {
      const {
        time_from_start: { nsec: lastNsec, sec: lastSec },
      } = points[points.length - 1];
      this.poseRemovalId = window.setTimeout(() => {
        this.robotClone.parent?.remove(this.robotClone);
        if (loop) {
          this.loopbackId = window.setTimeout(() => {
            if (this.lastMessage) {
              this.update(this.lastMessage, true);
            }
          }, 1000);
        }
      }, 1000 * lastSec + lastNsec / 1000000);
    }
  }
}

export default DisplayTrajectory;
