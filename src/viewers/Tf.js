import * as THREE from 'three';
import ROSLIB from 'roslib';

import Viewer3d from './3d';
import RobotModel from '../viz/RobotModel';

class TfViewer extends Viewer3d {
  constructor(rosInstance, options) {
    super(null, options);
    const { onFramesListUpdate } = this.options;
    this.ros = rosInstance;
    this.framesList = [];
    this.selectedFrame = '';
    this.onFramesListUpdate = onFramesListUpdate || (() => {});

    this.initRosEvents();
    this.getTFMessages = this.getTFMessages.bind(this);
    this.setFrameTransform = this.setFrameTransform.bind(this);
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

  getTFMessages({ transforms }) {
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
      },
    );
    this.setFrameTransform();
  }

  getObjectOrCreate(frameId) {
    if(this.framesList.indexOf(frameId) === -1) {
      this.framesList.push(frameId);
      this.onFramesListUpdate(this.framesList);
    }
    const existingFrame = this.scene.getObjectByName(frameId);
    if (existingFrame) {
      return existingFrame;
    }

    const newFrame = new THREE.Group();
    newFrame.name = frameId;
    this.scene.addObject(newFrame);
    return newFrame;
  }

  updateSelectedFrame(selectedFrame) {
    this.selectedFrame = selectedFrame;
    this.setFrameTransform();
  }

  setFrameTransform() {
    const { selectedFrame, scene: { vizWrapper } } = this;
    if(!selectedFrame) {
      return;
    }
    const currentFrameObject = vizWrapper.getObjectByName(selectedFrame);

    if (currentFrameObject) {
      const tempObject = new THREE.Object3D();
      tempObject.position.copy(vizWrapper.position);
      tempObject.rotation.copy(vizWrapper.rotation);

      const objectWorldPosition = currentFrameObject.getWorldPosition(new THREE.Vector3());
      const objectWorldQuaternion = currentFrameObject.getWorldQuaternion(new THREE.Quaternion());
      const wrapperWorldPosition = tempObject.getWorldPosition(new THREE.Vector3());
      const wrapperWorldQuaternion = tempObject.getWorldQuaternion(new THREE.Quaternion());

      const relPosition = wrapperWorldPosition.sub(objectWorldPosition);
      tempObject.position.set(relPosition.x, relPosition.z, -relPosition.y);
      tempObject.rotation.setFromQuaternion(
        wrapperWorldQuaternion
          .premultiply(objectWorldQuaternion.conjugate()),
      );
      tempObject.updateMatrixWorld();
      tempObject.setRotationFromMatrix(new THREE.Matrix4().makeRotationAxis(new THREE.Vector3(1, 0, 0), -Math.PI / 2).multiply(tempObject.matrix))

      vizWrapper.rotation.copy(tempObject.rotation);
      vizWrapper.position.copy(relPosition);
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
