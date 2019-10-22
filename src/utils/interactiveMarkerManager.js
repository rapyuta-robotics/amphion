import ROSLIB from 'roslib';
import {
  ANCHOR_MODE,
  DEFAULT_HANDLE_GROUP_NAME,
} from 'three-freeform-controls';
import randomColor from 'randomcolor';
import Group from '../primitives/Group';
import MarkerManager from './markerManager';
import {
  INTERACTIVE_MARKER_INTERACTION_MODES,
  INTERACTIVE_MARKER_ORIENTATION_MODES,
  UNSUPPORTED_INTERACTIVE_MARKER_ORIENTATION_MODES,
} from './constants';

export default class InteractiveMarkerManager {
  constructor(rootObject, viewer, options) {
    this.markerManagerMap = {};
    this.contolsManagerMap = {};
    this.objectMap = {};
    this.object = rootObject;
    this.viewer = viewer;
    this.hideOtherHandlesOnSelect = options.hideOtherHandlesOnSelect;
    this.hideOtherControlsInstancesOnSelect =
      options.hideOtherControlsInstancesOnSelect;
    this.visible = options.visible;
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

  onChange() {
    if (this.callback) {
      this.callback();
    }
  }

  onNamespaceChange(callback) {
    this.callback = callback;
  }

  initMarkers(interactiveMarker, freeformControls, visible) {
    const {
      controls,
      header: { frame_id },
      name,
      pose: { orientation, position },
      scale,
    } = interactiveMarker;
    const { manager, object } = this.getMarkerManagerOrCreate(name);

    manager.visible = visible;
    object.visible = visible;

    object.frameId = frame_id;
    if (this.viewer.attachObjectOutsideTree) {
      this.viewer.attachObjectOutsideTree(object);
    }

    object.setTransform({ translation: position, rotation: orientation });
    object.userData.control = {
      frameId: interactiveMarker.header.frame_id,
      markerName: interactiveMarker.name,
    };
    object.userData.handlesControlsMap = {};

    controls.forEach((control, index) => {
      // cannot rely on the control.name being present or unique
      const key = name;
      if (this.contolsManagerMap[key] === undefined) {
        this.contolsManagerMap[key] = [];
      }
      if (this.contolsManagerMap[key].length !== controls.length) {
        const attachMode =
          control.orientation_mode ===
          INTERACTIVE_MARKER_ORIENTATION_MODES.FIXED
            ? ANCHOR_MODE.FIXED
            : ANCHOR_MODE.INHERIT;
        const controlsManager = freeformControls.anchor(object, {
          separationT: {
            x: 0.4,
            y: 0.4,
            z: 0.4,
          },
          orientation: control.orientation,
          mode: attachMode,
          hideOtherHandlesOnSelect: this.hideOtherHandlesOnSelect,
          hideOtherControlsInstancesOnSelect: this
            .hideOtherControlsInstancesOnSelect,
          showHelperPlane: true,
        });
        controlsManager.scale.set(scale, scale, scale);
        controlsManager.visible = visible;

        InteractiveMarkerManager.enableControls(
          object,
          control.interaction_mode,
          control.orientation_mode,
          control.orientation,
          control.name,
          controlsManager,
          randomColor({
            seed: `${key}-${control.name}-${2 * index}`, // 2 * for more variable color
          }),
        );

        this.contolsManagerMap[key].push(controlsManager);
      }

      if (control.markers.length > 0) {
        control.markers.forEach(marker => {
          manager.updateMarker(marker);
        });
      }
    });
  }

  setVisible(visible) {
    this.visible = visible;
    const controlMangerGroups = Object.values(this.contolsManagerMap);
    controlMangerGroups.map(managers => {
      managers.map(manager => {
        manager.visible = visible;
        manager.object.visible = visible;
      });
    });
  }

  updatePose(poseObject) {
    const { name, pose } = poseObject;
    const markerObject = this.objectMap[name];
    if (markerObject && pose) {
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
    controlsManager,
    color,
  ) {
    controlsManager.showAll(false);

    // currently only ROTATE_AXIS is supported for VIEW_FACING mode
    // this is the most useful one
    if (
      UNSUPPORTED_INTERACTIVE_MARKER_ORIENTATION_MODES.indexOf(
        orientationMode,
      ) !== -1 &&
      interactionMode === INTERACTIVE_MARKER_INTERACTION_MODES.ROTATE_AXIS
    ) {
      object.userData.handlesControlsMap = {
        ...object.userData.handlesControlsMap,
        [DEFAULT_HANDLE_GROUP_NAME.ER]: controlName,
      };
      controlsManager.showByNames([DEFAULT_HANDLE_GROUP_NAME.ER], true);
      return;
    }

    let handles = [];

    switch (interactionMode) {
      case INTERACTIVE_MARKER_INTERACTION_MODES.NONE:
      case INTERACTIVE_MARKER_INTERACTION_MODES.MENU:
      case INTERACTIVE_MARKER_INTERACTION_MODES.BUTTON: {
        break;
      }
      case INTERACTIVE_MARKER_INTERACTION_MODES.MOVE_AXIS: {
        handles = [
          DEFAULT_HANDLE_GROUP_NAME.XPT,
          DEFAULT_HANDLE_GROUP_NAME.XNT,
        ];

        if (color !== undefined) {
          controlsManager.translationXP.setColor(color);
          controlsManager.translationXN.setColor(color);
        }

        break;
      }
      case INTERACTIVE_MARKER_INTERACTION_MODES.MOVE_PLANE: {
        handles = [DEFAULT_HANDLE_GROUP_NAME.PICK_PLANE_YZ];

        if (color !== undefined) {
          controlsManager.pickPlaneYZ.setColor(color);
        }

        break;
      }
      case INTERACTIVE_MARKER_INTERACTION_MODES.ROTATE_AXIS: {
        handles = [DEFAULT_HANDLE_GROUP_NAME.XR];

        if (color !== undefined) {
          controlsManager.rotationX.setColor(color);
        }

        break;
      }
      case INTERACTIVE_MARKER_INTERACTION_MODES.MOVE_ROTATE: {
        handles = [
          DEFAULT_HANDLE_GROUP_NAME.XR,
          DEFAULT_HANDLE_GROUP_NAME.PICK_PLANE_YZ,
        ];

        if (color !== undefined) {
          controlsManager.pickPlaneYZ.setColor(color);
          controlsManager.rotationX.setColor(color);
        }

        break;
      }
      case INTERACTIVE_MARKER_INTERACTION_MODES.MOVE_3D: {
        handles = [
          DEFAULT_HANDLE_GROUP_NAME.XPT,
          DEFAULT_HANDLE_GROUP_NAME.XNT,
          DEFAULT_HANDLE_GROUP_NAME.YPT,
          DEFAULT_HANDLE_GROUP_NAME.YNT,
          DEFAULT_HANDLE_GROUP_NAME.ZPT,
          DEFAULT_HANDLE_GROUP_NAME.ZNT,
          DEFAULT_HANDLE_GROUP_NAME.PICK,
        ];
        break;
      }
      case INTERACTIVE_MARKER_INTERACTION_MODES.ROTATE_3D: {
        handles = [
          DEFAULT_HANDLE_GROUP_NAME.XR,
          DEFAULT_HANDLE_GROUP_NAME.YR,
          DEFAULT_HANDLE_GROUP_NAME.ZR,
        ];
        break;
      }
      case INTERACTIVE_MARKER_INTERACTION_MODES.MOVE_ROTATE_3D: {
        // these handles are currently commented out
        // because these overlap with the extra 6-DOF controls
        // that are available in the example and also in kompose
        // proper fix requires increasing the scale of the below
        // handles so that they don't overlap
        handles = [
          // DEFAULT_HANDLE_GROUP_NAME.XPT,
          // DEFAULT_HANDLE_GROUP_NAME.XNT,
          // DEFAULT_HANDLE_GROUP_NAME.YPT,
          // DEFAULT_HANDLE_GROUP_NAME.YNT,
          // DEFAULT_HANDLE_GROUP_NAME.ZPT,
          // DEFAULT_HANDLE_GROUP_NAME.ZNT,
          // DEFAULT_HANDLE_GROUP_NAME.XR,
          // DEFAULT_HANDLE_GROUP_NAME.YR,
          // DEFAULT_HANDLE_GROUP_NAME.ZR,
          DEFAULT_HANDLE_GROUP_NAME.PICK,
        ];
        break;
      }
    }

    handles.map(handle => {
      object.userData.handlesControlsMap[handle] = controlName;
    });
    controlsManager.showByNames(handles, true);
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
