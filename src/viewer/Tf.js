import * as THREE from 'three';
import ROSLIB from 'roslib';

import Viewer3d from './3d';
import RobotModel from '../viz/RobotModel';

class TfViewer extends Viewer3d {
  constructor(rosInstance) {
    super({});
    this.ros = rosInstance;
    this.framesList = [];
    this.selectedFrame = [];
    this.robotMeshes = [];

    this.initRosEvents();
    this.getTFMessages = this.getTFMessages.bind(this);
    this.setFrameTransform = this.setFrameTransform.bind(this);
    this.resetFrameTransform = this.resetFrameTransform.bind(this);
    this.addRobot = this.addRobot.bind(this);
  }

  initRosEvents() {
    this.ros.on('connection', () => {
      this.ros.getTopics(rosTopics => {
        ['/tf', '/tf_static'].forEach(name => {
          const topic = new ROSLIB.Topic({
            ros: this.ros,
            name,
            messageType: rosTopics.types[rosTopics.topics.indexOf(name)],
          });
          topic.subscribe(this.getTFMessages);
        });
      });
    });
  }

  resetFrameTransform() {
    const { vizWrapper } = this;

    vizWrapper.position.set(0, 0, 0);
    vizWrapper.quaternion.set(0, 0, 0, 1);
  }

  getTFMessages({ transforms }) {
    const { selectedFrame } = this;

    transforms.forEach(
      ({
         header: { frame_id: parentFrameId },
         child_frame_id: childFrameId,
        transform: {
          translation: {x, y, z},
          rotation: {
             x: rx, y: ry, z: rz, w: rw,
          },
        }
       }) => {
        const [childObject, parentObject] = [
          this.getObjectOrCreate(childFrameId),
          this.getObjectOrCreate(parentFrameId),
        ];

        parentObject.add(childObject);
        childObject.position.set(x, y, z);
        childObject.quaternion.set(rx, ry, rz, rw);

        [parentFrameId, childFrameId].forEach(frame => {
          if (this.framesList.indexOf(frame) === -1) {
            this.framesList.push(frame);
          }
        });

        if (selectedFrame === '') {
          return;
        }

        if (selectedFrame === childFrameId || selectedFrame === parentFrameId) {
          this.setFrameTransform();
          return;
        }

        if (
          parentObject.getObjectByName(selectedFrame) ||
          childObject.getObjectByName(selectedFrame)
        ) {
          this.setFrameTransform();
        }
      },
    );
  }

  getObjectOrCreate(frameId) {
    const existingFrame = this.scene.getObjectByName(frameId);
    if (existingFrame) {
      return existingFrame;
    }

    const newFrame = new THREE.Group();
    newFrame.name = frameId;
    this.scene.addObject(newFrame);
    return newFrame;
  }

  setFrameTransform(selectedFrame) {
    const { vizWrapper } = this;
    const currentFrameObject = vizWrapper.getObjectByName(selectedFrame);

    if (currentFrameObject) {
      this.resetFrameTransform();
      vizWrapper.updateMatrixWorld();

      const worldPos = new THREE.Vector3();
      const worldQuat = new THREE.Quaternion();

      currentFrameObject.getWorldQuaternion(worldQuat);
      const { x: quatx, y: quaty, z: quatz, w: quatw } = worldQuat;
      vizWrapper.quaternion.set(-quatx, -quaty, -quatz, quatw);

      vizWrapper.updateMatrixWorld();

      currentFrameObject.getWorldPosition(worldPos);
      const oppPos = worldPos.negate();
      vizWrapper.position.set(oppPos.x, oppPos.y, oppPos.z);
    }
  }

  addVisualization(vizObject) {
    super.addVisualization(vizObject);

    vizObject.onHeaderChange = newFrameId => {
      let frameObject = this.getObjectOrCreate(newFrameId);
      frameObject.add(vizObject.object);
    };
  }
  addRobot(robotModel, options) {
    robotModel.load(
      (object) => {
        RobotModel.onComplete(object);
        super.addVisualization(robotModel);
        for(let linkName in object.children[0].links) {
          const o = object.children[0].links[linkName];
          const existingObject = this.scene.getObjectByName(o.name);
          if (existingObject) {
            o.children.forEach(child => {
              existingObject.add(child);
            });
          }
        }
      }
    );
  }

  setFixedFrame() {

  }
}

export default TfViewer;
