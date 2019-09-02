import * as THREE from 'three';
import Core from '../core';
import {
  DEFAULT_OPTIONS_INTERACTIVE_MARKER,
  MESSAGE_TYPE_INTERACTIVEMARKER,
} from '../utils/constants';
import Group from '../primitives/Group';
import InteractiveMarkerManager from '../utils/interactiveMarkerManager';
import { TransformControls } from '../utils/transformControls';

class InteractiveMarkers extends Core {
  constructor(
    ros,
    topicName,
    utils,
    options = DEFAULT_OPTIONS_INTERACTIVE_MARKER,
  ) {
    super(ros, topicName, MESSAGE_TYPE_INTERACTIVEMARKER, {
      ...DEFAULT_OPTIONS_INTERACTIVE_MARKER,
      ...options,
    });

    this.object = new Group();
    this.utils = utils;

    const { queueSize } = options;
    this.interactiveMarkerManager = new InteractiveMarkerManager(this.object);
    this.queueSize = queueSize;
    this.updateOptions({
      ...DEFAULT_OPTIONS_INTERACTIVE_MARKER,
      ...options,
    });

    this.initTransformControls();
    this.initRayCaster();
  }

  initRayCaster() {
    const { camera, renderer } = this.utils;
    this.raycaster = new THREE.Raycaster();
    this.mouse = new THREE.Vector2();
    this.dragging = false;

    this.transformControls.addEventListener('dragging-changed', ev => {
      this.dragging = ev.value;
    });

    renderer.domElement.addEventListener(
      'mousedown',
      event => {
        const rect = renderer.domElement.getBoundingClientRect();
        const { clientHeight, clientWidth } = renderer.domElement;
        this.mouse.x = ((event.clientX - rect.left) / clientWidth) * 2 - 1;
        this.mouse.y = -((event.clientY - rect.top) / clientHeight) * 2 + 1;
        this.raycaster.setFromCamera(this.mouse, camera);

        const intersects = this.raycaster.intersectObjects(
          this.object.children,
          true,
        );

        if (!this.dragging && intersects.length > 0 && intersects[0].object) {
          this.transformControls.attach(intersects[0].object);
        } else if (!this.dragging) {
          this.transformControls.detach();
        }
      },
      false,
    );
  }

  initTransformControls() {
    const { camera, controls, renderer, scene } = this.utils;
    this.transformControls = new TransformControls(camera, renderer.domElement);
    scene.add(this.transformControls);

    const onMouseUp = () => {
      controls.enabled = true;
      this.transformControls.removeEventListener('mouseUp', onMouseUp);
    };

    this.transformControls.addEventListener('mouseDown', () => {
      controls.enabled = false;

      this.transformControls.addEventListener('mouseUp', onMouseUp);
    });
  }

  updateOptions(options) {
    // need a better way to handle interdependent topics
    const shouldSubscriptionChange =
      this.options.updateTopicName !== options.topicName && this.init;
    const guardAgainstOtherOptionsChange =
      this.topicName === this.options.updateTopicName;

    if (shouldSubscriptionChange && options.updateTopicName !== undefined) {
      const { messageType, name } = options.updateTopicName;
      this.changeTopic(name, messageType, true, true);
    } else if (shouldSubscriptionChange && guardAgainstOtherOptionsChange) {
      this.unsubscribe();
    }

    super.updateOptions(options);
    this.interactiveMarkerManager.updateOptions(this.options, this);
  }

  update(message) {
    super.update(message);
    if (message.markers.length > 0) {
      message.markers.forEach(interactiveMarker => {
        this.interactiveMarkerManager.initMarkers(
          interactiveMarker,
          this.utils.transformControls,
        );
      });
      if (!this.init) {
        this.init = true;
        if (this.options.updateTopicName !== undefined) {
          const { messageType, name } = this.options.updateTopicName;
          this.changeTopic(name, messageType, true, true);
        } else {
          this.unsubscribe();
        }
      }
    }

    // for InteractiveMarkerPose sub-message
    if (message.poses && message.poses.length > 0) {
      message.poses.forEach(pose => {
        this.interactiveMarkerManager.updatePose(pose);
      });
    }
  }

  reset() {
    this.interactiveMarkerManager.reset(false);
  }
}

export default InteractiveMarkers;
