import { Group, Object3D, Quaternion, Vector3 } from 'three';
import ROSLIB, { Ros } from 'roslib';

import Viewer3d from './3d';
import { DEFAULT_OPTIONS_TF_VIEWER } from '../utils/constants';
import URDFCore from '../core/urdf';
import { URDFRobot } from 'urdf-js/src/URDFClasses';

class TfViewer extends Viewer3d {
  public options: {
    onFramesListUpdate?: () => void;
    selectedFrame?: string;
  } = {};
  private readonly ros: Ros;
  private readonly framesList: string[] = [];
  private readonly onFramesListUpdate: (framesList: string[]) => void;

  constructor(
    rosInstance: Ros,
    options: {
      onFramesListUpdate?: (framesList: string[]) => void;
      selectedFrame?: string;
    } = {},
  ) {
    super(null, {
      ...DEFAULT_OPTIONS_TF_VIEWER,
      ...options,
    });
    const { onFramesListUpdate } = this.options;
    this.ros = rosInstance;
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
    // types for ros are not upto date
    if ((this.ros as any).isConnected) {
      this.onRosConnection();
    }
  }

  onRosConnection() {
    // types for ros are not upto date
    // @ts-ignore
    this.ros.getTopics((rosTopics: { topics: string[]; types: string[] }) => {
      ['/tf', '/tf_static'].forEach(name => {
        const topic = new ROSLIB.Topic({
          ros: this.ros,
          name,
          messageType: rosTopics.types[rosTopics.topics.indexOf(name)],
        });
        topic.subscribe(this.getTFMessages as any);
      });
    });
  }

  getTFMessages(args: { transforms: RosMessage.TransformStamped[] }) {
    const { transforms } = args;
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

  getObjectOrCreate(frameId: string) {
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

  addVisualization(vizObject: {
    object: Object3D;
    onHeaderChange: (frameId: string) => void;
  }) {
    super.addVisualization(vizObject);

    vizObject.onHeaderChange = newFrameId => {
      const frameObject = this.getObjectOrCreate(`${newFrameId}-tf-connector`);
      frameObject.add(vizObject.object);
    };
  }

  attachObjectOutsideTree(object: Object3D & { frameId?: string }) {
    if (!object.frameId) {
      return;
    }
    const frameObject = this.getObjectOrCreate(
      `${object.frameId}-tf-connector`,
    );
    frameObject.attach(object);
  }

  addRobot(robotModel: URDFCore<Object3D>) {
    robotModel.loadFromParam(() => {
      super.addVisualization(robotModel);
      const links = (robotModel.object?.children[0] as URDFRobot).links;
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
