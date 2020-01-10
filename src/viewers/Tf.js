import { Group, Quaternion, Vector3 } from 'three';
import ROSLIB from 'roslib';

import Viewer3d from './3d';
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

    this.initRosEvents();
    this.getTFMessages = this.getTFMessages.bind(this);
    this.setFrameTransform = this.setFrameTransform.bind(this);
    this.addRobot = this.addRobot.bind(this);
    this.onRosConnection = this.onRosConnection.bind(this);
  }

  initRosEvents() {
    this.ros.on('connection', () => {
      this.onRosConnection();
    });
    if (this.ros.isConnected) {
      this.onRosConnection();
    }
  }

  onRosConnection() {
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
        const [childObject, parentObject] = [
          this.getObjectOrCreate(`${childFrameId}-tf-connector`),
          this.getObjectOrCreate(`${parentFrameId}-tf-connector`),
        ];

        parentObject.add(childObject);
        childObject.position.set(x, y, z);
        childObject.quaternion.set(rx, ry, rz, rw);

        [parentFrameId, childFrameId].forEach(frame => {
          if (this.framesList.indexOf(`${frame}-tf-connector`) === -1) {
            this.framesList.push(`${frame}-tf-connector`);
          }
        });
      },
    );
    this.setFrameTransform();
  }

  getObjectOrCreate(frameId) {
    const {
      scene: { vizWrapper },
    } = this;
    if (this.framesList.indexOf(frameId) === -1) {
      this.framesList.push(frameId);
      this.onFramesListUpdate(this.framesList);
    }
    const existingFrame = vizWrapper.getObjectByName(frameId);
    if (existingFrame) {
      return existingFrame;
    }

    const newFrame = new Group();
    newFrame.name = frameId;
    this.scene.addObject(newFrame);
    return newFrame;
  }

  setFrameTransform() {
    const {
      options: { selectedFrame },
      scene: { vizWrapper },
    } = this;
    if (!selectedFrame) {
      return;
    }
    const currentFrameObject = this.getObjectOrCreate(selectedFrame);

    if (currentFrameObject) {
      vizWrapper.position.set(0, 0, 0);
      vizWrapper.quaternion.set(0, 0, 0, 1);
      vizWrapper.updateMatrixWorld();

      const worldPos = new Vector3();
      const worldQuat = new Quaternion();

      currentFrameObject.getWorldQuaternion(worldQuat);
      const { w: quatw, x: quatx, y: quaty, z: quatz } = worldQuat;
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
      const frameObject = this.getObjectOrCreate(`${newFrameId}-tf-connector`);
      frameObject.add(vizObject.object);
    };
  }

  attachObjectOutsideTree(object) {
    const frameObject = this.getObjectOrCreate(
      `${object.frameId}-tf-connector`,
    );
    frameObject.attach(object);
  }

  addRobot(robotModel) {
    robotModel.loadFromParam(() => {
      super.addVisualization(robotModel);
      const links = robotModel.object.children[0].links;
      const linkNames = Object.keys(links);
      linkNames.map(linkName => {
        const link = links[linkName];
        const connector = this.getObjectOrCreate(`${linkName}-tf-connector`);
        connector.add(link);
      });
    });
  }

  setFixedFrame() {}
}

export default TfViewer;
