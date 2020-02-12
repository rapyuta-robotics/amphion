import debounce from 'lodash.debounce';
import { ControlsManager, RAYCASTER_EVENTS } from 'three-freeform-controls';
import ROSLIB, { Ros, Topic } from 'roslib';
import LegacyCore from '../core';
import {
  DEFAULT_OPTIONS_INTERACTIVE_MARKER,
  MESSAGE_TYPE_INTERACTIVEMARKER,
  MESSAGE_TYPE_INTERACTIVEMARKER_FEEDBACK,
} from '../utils/constants';
import Group from '../primitives/Group';
import InteractiveMarkerManager from '../utils/interactiveMarkerManager';
import TfViewer from '../viewers/Tf';
import { assertIsDefined } from '../utils/helpers';
import { Object3D } from 'three';

class InteractiveMarkers extends LegacyCore {
  private init = false;
  public readonly object = new Group();
  private readonly viewer: TfViewer;
  private readonly interactiveMarkerManager: InteractiveMarkerManager;
  private interactiveMarkersNames = new Set<string>();
  private readonly interactiveMarkersFrameIds = new Set<string>();
  private readonly clientId = `amphion-${Math.round(Math.random() * 10 ** 8)}`;
  private messageSequence = 0;
  private feedbackTopic: Topic | null = null;
  private readonly debouncedPublish: ReturnType<typeof debounce>;
  private freeformControls?: ControlsManager | null;

  constructor(
    ros: Ros,
    topicName: string,
    viewer: TfViewer,
    options = DEFAULT_OPTIONS_INTERACTIVE_MARKER,
  ) {
    super(ros, topicName, MESSAGE_TYPE_INTERACTIVEMARKER, {
      ...DEFAULT_OPTIONS_INTERACTIVE_MARKER,
      ...options,
    });

    this.init = false;
    this.viewer = viewer;

    this.updateOptions({
      ...DEFAULT_OPTIONS_INTERACTIVE_MARKER,
      ...options,
    });

    this.interactiveMarkerManager = new InteractiveMarkerManager(
      this.object,
      viewer,
      this.options,
    );

    const { publishThrottleRate } = this.options;
    this.debouncedPublish = debounce(
      this.publish.bind(this),
      publishThrottleRate && publishThrottleRate > 0 ? publishThrottleRate : 0,
    );
    this.initFreeformControls();
    this.publishManual = this.publishManual.bind(this);
  }

  hide() {
    super.hide();
    this.interactiveMarkerManager.setVisible(false);
  }

  show() {
    super.show();
    this.interactiveMarkerManager.setVisible(true);
  }

  destroy() {
    super.destroy();
    this.freeformControls?.destroy();
    this.freeformControls = null;
    this.interactiveMarkerManager.reset(true);
    this.interactiveMarkersNames = new Set();
  }

  initFreeformControls() {
    const { camera, controls, renderer, scene } = this.viewer;
    assertIsDefined(camera);
    assertIsDefined(renderer);
    this.freeformControls = new ControlsManager(camera, renderer.domElement);
    scene.add(this.freeformControls);

    this.freeformControls.listen(RAYCASTER_EVENTS.DRAG_START, () => {
      controls.enabled = false;
    });

    // TODO: need to update three-freeform-controls
    // @ts-ignore
    this.freeformControls.listen(RAYCASTER_EVENTS.DRAG, (object, handleName) =>
      this.debouncedPublish(object, handleName),
    );

    this.freeformControls.listen(
      RAYCASTER_EVENTS.DRAG_STOP,
      // TODO: need to update three-freeform-controls
      // @ts-ignore
      (object, handleName) => {
        this.debouncedPublish(object, handleName);
        controls.enabled = true;
      },
    );
  }

  static makeInteractiveMarkerFeedbackMessage(args: {
    seq: number;
    frame_id: string;
    client_id: string;
    marker_name: string;
    control_name?: string;
    position: RosMessage.Point;
    quaternion: RosMessage.Quaternion;
  }) {
    const {
      seq,
      frame_id: frameId,
      client_id: clientId,
      marker_name: markerName,
      control_name: controlName,
      position,
      quaternion,
    } = args;
    return new ROSLIB.Message({
      header: {
        seq,
        frame_id: frameId,
        stamp: {
          secs: 0,
          nsecs: 0,
        },
      },
      client_id: clientId,
      marker_name: markerName,
      control_name: controlName,
      pose: {
        position: {
          x: position.x,
          y: position.y,
          z: position.z,
        },
        orientation: {
          x: quaternion.x,
          y: quaternion.y,
          z: quaternion.z,
          w: quaternion.w,
        },
      },
      event_type: 1,
      menu_entry_id: 0,
      mouse_point: {
        x: 0,
        y: 0,
        z: 0,
      },
      mouse_point_valid: false,
    });
  }

  static makeInteractiveMarkerFeedbackTopic(ros: Ros, name: string) {
    return new ROSLIB.Topic({
      ros,
      name,
      messageType: MESSAGE_TYPE_INTERACTIVEMARKER_FEEDBACK,
    });
  }

  publish(object: Object3D, handleName: string) {
    if (!object) {
      return;
    }

    const { frameId, markerName } = object.userData.control;
    const controlName = object.userData.handlesControlsMap[handleName];

    const message = InteractiveMarkers.makeInteractiveMarkerFeedbackMessage({
      seq: this.messageSequence,
      client_id: this.clientId,
      frame_id: frameId,
      marker_name: markerName,
      control_name: controlName,
      position: object.position,
      quaternion: object.quaternion,
    });

    if (this.feedbackTopic !== null) {
      this.feedbackTopic?.publish(message);
    }

    this.messageSequence++;
  }

  publishManual(pose: {
    position: RosMessage.Point;
    quaternion: RosMessage.Quaternion;
  }) {
    const message = InteractiveMarkers.makeInteractiveMarkerFeedbackMessage({
      seq: this.messageSequence,
      client_id: this.clientId,
      ...pose,
      frame_id: Array.from(this.interactiveMarkersFrameIds)[0],
      marker_name: Array.from(this.interactiveMarkersNames)[0],
    });

    if (this.feedbackTopic !== null) {
      this.feedbackTopic.publish(message);
    }

    this.messageSequence++;
  }

  updateOptions(options: any) {
    if (options.feedbackTopicName !== undefined) {
      if (
        !this.feedbackTopic ||
        this.feedbackTopic.name !== options.feedbackTopicName.name
      ) {
        assertIsDefined(this.ros);
        this.feedbackTopic = InteractiveMarkers.makeInteractiveMarkerFeedbackTopic(
          this.ros,
          options.feedbackTopicName.name,
        );
      }
    } else {
      this.feedbackTopic = null;
    }

    // need a better way to handle interdependent topics
    const shouldSubscriptionChange =
      this.options.updateTopicName !== options.topicName && this.init;
    const guardAgainstOtherOptionsChange =
      this.topicName === this.options.updateTopicName;

    if (shouldSubscriptionChange && options.updateTopicName !== undefined) {
      const { messageType, name } = options.updateTopicName;
      this.changeTopic(name, messageType, true);
    } else if (shouldSubscriptionChange && guardAgainstOtherOptionsChange) {
      this.unsubscribe();
    }
    super.updateOptions(options);
  }

  update(
    message: RosMessage.InteractiveMarker & RosMessage.InteractiveMarkerUpdate,
  ) {
    super.update(message);
    if (message.markers && message.markers.length > 0) {
      message.markers.forEach(interactiveMarker => {
        if (!this.interactiveMarkersNames.has(interactiveMarker.name)) {
          this.interactiveMarkerManager.initMarkers(
            interactiveMarker,
            this.freeformControls!,
            this.options.visible,
          );
        }
        this.interactiveMarkersNames.add(interactiveMarker.name);
        if (interactiveMarker.header) {
          this.interactiveMarkersFrameIds.add(
            interactiveMarker.header.frame_id,
          );
        }

        message.markers.forEach(poseObject => {
          this.interactiveMarkerManager.updatePose(poseObject);
        });
      });
      // need a better way to handle interdependent topics
      if (!this.init) {
        this.init = true;
        if (this.options.updateTopicName !== undefined) {
          const { messageType, name } = this.options.updateTopicName;
          this.init = true;
          this.changeTopic(name, messageType, true);
        } else {
          this.unsubscribe();
        }
      }
    }

    // for InteractiveMarkerUpdate sub-message (InteractiveMarkerPose)
    if (message.poses && message.poses.length > 0) {
      message.poses.forEach(pose => {
        this.interactiveMarkerManager.updatePose(pose);
      });
    }

    // for InteractiveMarkerUpdate sub-message
    if (message.erases) {
      // TODO: implement when test backend available
      // remove from interactiveMarkerManager and
      // the this.interactiveMarkersNames cache
    }
  }

  reset() {
    this.interactiveMarkerManager.reset(false);
  }
}

export default InteractiveMarkers;
