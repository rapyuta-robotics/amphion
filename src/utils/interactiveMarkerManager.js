import * as THREE from 'three';
import ROSLIB from 'roslib';
import { HANDLE_NAMES } from 'three-freeform-controls';
import Group from '../primitives/Group';
import MarkerManager from './markerManager';
import { areFloatsAlmostEqual } from './processing';
import {
  INTERACTIVE_MARKER_INTERACTION_MODES,
  UNSUPPORTED_INTERACTIVE_MARKER_ORIENTATION_MODES,
} from './constants';

export default class InteractiveMarkerManager {
  constructor(rootObject) {
    this.markerManagerMap = {};
    this.objectMap = {};
    this.object = rootObject;
    this.namespaces = {};
    this.onChange = this.onChange.bind(this);
  }

  getMarkerManagerOrCreate(interactiveMarkerName) {
    const id = interactiveMarkerName;
    if (!this.markerManagerMap[id] || !this.objectMap[id]) {
      const markersHolder = new Group();
      markersHolder.name = id || '';
      this.markerManagerMap[id] = new MarkerManager(
        markersHolder,
        this.onChange,
      );
      this.objectMap[id] = markersHolder;
      this.object.add(markersHolder);
    }

    return {
      manager: this.markerManagerMap[id],
      object: this.objectMap[id],
    };
  }

  setQueueSize(queueSize, context) {
    context.unsubscribe();

    context.queueSize = queueSize;

    context.topic = new ROSLIB.Topic({
      ros: context.ros,
      name: context.topicName,
      messageType: context.messageType,
      queue_size: queueSize,
    });

    context.subscribe();
  }

  updateOptions(options, context) {
    const { queueSize } = options;
    const { queueSize: currentQueueSize } = context;

    if (currentQueueSize !== queueSize) {
      this.setQueueSize(queueSize, context);
    }
  }

  onChange() {
    if (this.callback) {
      this.callback();
    }
  }

  onNamespaceChange(callback) {
    this.callback = callback;
  }

  initMarkers(interactiveMarker, freeformControls) {
    const {
      controls,
      name,
      pose: { orientation, position },
    } = interactiveMarker;
    const { manager, object } = this.getMarkerManagerOrCreate(
      name,
      freeformControls,
    );
    freeformControls.attach(object);
    freeformControls.showAll(object, false);

    object.setTransform({ translation: position, rotation: orientation });
    controls.forEach(control => {
      if (!object.userData.control) {
        object.userData.control = {};
      }

      InteractiveMarkerManager.enableControls(
        object,
        control.interaction_mode,
        control.orientation_mode,
        control.orientation,
        control.name,
        freeformControls,
      );

      object.userData.control = {
        frameId: interactiveMarker.header.frame_id,
        markerName: interactiveMarker.name,
      };

      if (control.markers.length > 0) {
        control.markers.forEach(marker => {
          manager.updateMarker(marker);
        });
      }
    });
  }

  hide(interactiveMarker, freeformControls) {
    const { name } = interactiveMarker;
    const { object } = this.getMarkerManagerOrCreate(name, freeformControls);

    freeformControls.showAll(object, false);
  }

  updatePose(poseObject) {
    const { name, pose } = poseObject;
    const markerObject = this.objectMap[name];
    if (pose) {
      const { orientation, position } = pose;
      markerObject.setTransform({
        translation: position,
        rotation: orientation,
      });
    }
  }

  static enableControls(
    object,
    interactionMode,
    orientationMode,
    orientation,
    controlName,
    freeformControls,
  ) {
    // could possibly be made generic
    if (
      UNSUPPORTED_INTERACTIVE_MARKER_ORIENTATION_MODES.indexOf(
        orientationMode,
      ) !== -1
    ) {
      return;
    }
    const eulerOrientation = new THREE.Euler();
    const { w: ow, x: ox, y: oy, z: oz } = orientation;
    eulerOrientation.setFromQuaternion(new THREE.Quaternion(ox, oy, oz, ow));
    const { x, y, z } = eulerOrientation;

    const currentUserData = freeformControls.getUserData(object);

    switch (interactionMode) {
      case INTERACTIVE_MARKER_INTERACTION_MODES.NONE:
      case INTERACTIVE_MARKER_INTERACTION_MODES.MENU:
      case INTERACTIVE_MARKER_INTERACTION_MODES.BUTTON: {
        break;
      }
      case INTERACTIVE_MARKER_INTERACTION_MODES.MOVE_AXIS: {
        if (areFloatsAlmostEqual(x, Math.PI / 2)) {
          freeformControls.showXT(object, true);

          freeformControls.setUserData(object, {
            ...currentUserData,
            [HANDLE_NAMES.XT]: controlName,
          });
        } else if (areFloatsAlmostEqual(y, Math.PI / 2)) {
          freeformControls.showZT(object, true);

          freeformControls.setUserData(object, {
            ...currentUserData,
            [HANDLE_NAMES.ZT]: controlName,
          });
        } else if (areFloatsAlmostEqual(z, Math.PI / 2)) {
          freeformControls.showYT(object, true);

          freeformControls.setUserData(object, {
            ...currentUserData,
            [HANDLE_NAMES.YT]: controlName,
          });
        }
        break;
      }
      case INTERACTIVE_MARKER_INTERACTION_MODES.MOVE_PLANE: {
        if (areFloatsAlmostEqual(x, Math.PI / 2)) {
          freeformControls.showPickPlaneYZT(object, true);

          freeformControls.setUserData(object, {
            ...currentUserData,
            [HANDLE_NAMES.PICK_PLANE_YZ]: controlName,
          });
        } else if (areFloatsAlmostEqual(y, Math.PI / 2)) {
          freeformControls.showPickPlaneXYT(object, true);

          freeformControls.setUserData(object, {
            ...currentUserData,
            [HANDLE_NAMES.PICK_PLANE_XY]: controlName,
          });
        } else if (areFloatsAlmostEqual(z, Math.PI / 2)) {
          freeformControls.showPickPlaneZXT(object, true);

          freeformControls.setUserData(object, {
            ...currentUserData,
            [HANDLE_NAMES.PICK_PLANE_ZX]: controlName,
          });
        }
        break;
      }
      case INTERACTIVE_MARKER_INTERACTION_MODES.ROTATE_AXIS:
      case INTERACTIVE_MARKER_INTERACTION_MODES.MOVE_ROTATE: {
        // MOVE_PLANE part of INTERACTIVE_MARKER_INTERACTION_MODES.MOVE_ROTATE
        // is disabled because
        // it is somewhat buggy (detecting raycast) to use with other controls
        // needs fix from three-freeform-controls side

        if (areFloatsAlmostEqual(x, Math.PI / 2)) {
          freeformControls.showXR(object, true);

          freeformControls.setUserData(object, {
            ...currentUserData,
            [HANDLE_NAMES.XR]: controlName,
          });
        } else if (areFloatsAlmostEqual(y, Math.PI / 2)) {
          freeformControls.showZR(object, true);

          freeformControls.setUserData(object, {
            ...currentUserData,
            [HANDLE_NAMES.ZR]: controlName,
          });
        } else if (areFloatsAlmostEqual(z, Math.PI / 2)) {
          freeformControls.showYR(object, true);

          freeformControls.setUserData(object, {
            ...currentUserData,
            [HANDLE_NAMES.YR]: controlName,
          });
        }
        break;
      }
      case INTERACTIVE_MARKER_INTERACTION_MODES.MOVE_3D: {
        freeformControls.showPickT(object, true);
        freeformControls.showXT(object, true);
        freeformControls.showYT(object, true);
        freeformControls.showZT(object, true);

        freeformControls.setUserData(object, {
          ...currentUserData,
          [HANDLE_NAMES.PICK]: controlName,
          [HANDLE_NAMES.XT]: controlName,
          [HANDLE_NAMES.YT]: controlName,
          [HANDLE_NAMES.ZT]: controlName,
        });
        break;
      }
      case INTERACTIVE_MARKER_INTERACTION_MODES.ROTATE_3D: {
        freeformControls.showXR(object, true);
        freeformControls.showYR(object, true);
        freeformControls.showZR(object, true);

        freeformControls.setUserData(object, {
          ...currentUserData,
          [HANDLE_NAMES.XR]: controlName,
          [HANDLE_NAMES.YR]: controlName,
          [HANDLE_NAMES.ZR]: controlName,
        });
        break;
      }
      case INTERACTIVE_MARKER_INTERACTION_MODES.MOVE_ROTATE_3D: {
        freeformControls.showPickT(object, true);
        freeformControls.showXT(object, true);
        freeformControls.showYT(object, true);
        freeformControls.showZT(object, true);
        freeformControls.showXR(object, true);
        freeformControls.showYR(object, true);
        freeformControls.showZR(object, true);

        freeformControls.setUserData(object, {
          ...currentUserData,
          [HANDLE_NAMES.PICK]: controlName,
          [HANDLE_NAMES.XT]: controlName,
          [HANDLE_NAMES.YT]: controlName,
          [HANDLE_NAMES.ZT]: controlName,
          [HANDLE_NAMES.XR]: controlName,
          [HANDLE_NAMES.YR]: controlName,
          [HANDLE_NAMES.ZR]: controlName,
        });
      }
    }
  }

  removeObject(id) {
    const obj = this.objectMap[id];
    obj.parent.remove(obj);
    delete this.objectMap[id];
  }

  reset(destroy) {
    this.onChange();

    if (destroy) {
      Object.keys(this.objectMap).forEach(id => {
        this.removeObject(id);
      });
    }
  }
}
