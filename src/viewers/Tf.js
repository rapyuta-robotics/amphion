import { Quaternion, Vector3, Group } from 'three';
import ROSLIB from 'roslib';

import Viewer3d from './3d';
import RobotModel from '../viz/RobotModel';
import { DEFAULT_OPTIONS_TF_VIEWER } from '../utils/constants';

class TfViewer extends Viewer3d {
  constructor(rosInstance, options) {
    super(null, {
      ...DEFAULT_OPTIONS_TF_VIEWER,
      ...options,
    });
    const { onFramesListUpdate } = this.options;
    this.ros = rosInstance;
    this.framesList = [];
    this.onFramesListUpdate = onFramesListUpdate || (() => {});

    const vizWrapper = this.scene.vizWrapper;
    vizWrapper.parent.remove(vizWrapper);
    this.currentFrame = null;
    this.currentFrameParent = null;
    this.currentFrameTransformation = {
      translation: [0, 0, 0],
      rotation: [0, 0, 0, 1],
    };

    this.initRosEvents();
    this.getTFMessages = this.getTFMessages.bind(this);
    this.addRobot = this.addRobot.bind(this);
    this.setFixedFrame = this.setFixedFrame.bind(this);
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
          rotation: { w: rw, x: rx, y: ry, z: rz },
          translation: { x, y, z },
        },
      }) => {
        if (childFrameId === this.currentFrame.name) {
          this.currentFrameTransformation = {
            translation: [x, y, z],
            rotation: [rx, ry, rz, rw],
          };
        } else {
          const [childObject, parentObject] = [
            this.getObjectOrCreate(childFrameId),
            this.getObjectOrCreate(parentFrameId),
          ];

          parentObject.add(childObject);
          childObject.position.set(x, y, z);
          childObject.quaternion.set(rx, ry, rz, rw);
          // console.log(childObject.position.toArray(), childObject.rotation.toArray());
          parentObject.updateWorldMatrix(false, true);
          // childObject.updateMatrixWorld();

          [parentFrameId, childFrameId].forEach(frame => {
            if (this.framesList.indexOf(frame) === -1) {
              this.framesList.push(frame);
            }
          });
        }
      },
    );
  }

  getObjectOrCreate(frameId) {
    if (this.framesList.indexOf(frameId) === -1) {
      this.framesList.push(frameId);
      this.onFramesListUpdate(this.framesList);
    }
    const existingFrame =
      this.scene.getObjectByName(frameId) ||
      this.scene.vizWrapper.getObjectByName(frameId);
    if (existingFrame) {
      return existingFrame;
    }

    const newFrame = new Group();
    newFrame.name = frameId;
    this.scene.addObject(newFrame);
    return newFrame;
  }

  addVisualization(vizObject) {
    super.addVisualization(vizObject);

    vizObject.onHeaderChange = newFrameId => {
      const frameObject = this.getObjectOrCreate(newFrameId);
      frameObject.add(vizObject.object);
    };
  }

  attachObjectOutsideTree(object) {
    const frameObject = this.getObjectOrCreate(object.frameId);
    frameObject.attach(object);
  }

  addRobot(robotModel) {
    robotModel.load(object => {
      RobotModel.onComplete(object);
      super.addVisualization(robotModel);
      // eslint-disable-next-line guard-for-in
      for (const linkName in object.children[0].links) {
        const o = object.children[0].links[linkName];
        const existingObject = this.scene.getObjectByName(o.name);
        if (existingObject) {
          o.children.forEach(child => {
            existingObject.add(child);
          });
        }
      }
    });
  }

  updateOptions(options) {
    super.updateOptions(options);
    this.setFixedFrame(options.selectedFrame);
  }

  setFixedFrame(frameName) {
    if (!frameName) {
      return;
    }
    const {
      rotation: [rx, ry, rz, rw],
      translation: [x, y, z],
    } = this.currentFrameTransformation;
    if (this.currentFrame) {
      this.currentFrameParent.add(this.currentFrame);
      this.currentFrame.position.set(x, y, z);
      this.currentFrame.rotation.setFromQuaternion(
        new Quaternion(rx, ry, rz, rw),
      );
    }

    this.currentFrame = this.getObjectOrCreate(frameName);
    this.currentFrameParent = this.currentFrame.parent;
    this.currentFrameTransformation = {
      translation: this.currentFrame.position.toArray(),
      rotation: new Quaternion()
        .setFromEuler(this.currentFrame.rotation)
        .toArray(),
    };
    this.scene.add(this.currentFrame);
    this.currentFrame.position.set(0, 0, 0);
    this.currentFrame.rotation.set(0, 0, 0);
  }
}

export default TfViewer;
