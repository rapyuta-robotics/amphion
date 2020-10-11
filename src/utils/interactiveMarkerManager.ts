import {
  ANCHOR_MODE,
  ControlsManager,
  DEFAULT_HANDLE_GROUP_NAME,
} from 'three-freeform-controls';
import { Euler, Object3D, Quaternion } from 'three';
import randomColor from 'randomcolor';
import Group from '../primitives/Group';
import MarkerManager from './markerManager';
import {
  INTERACTIVE_MARKER_INTERACTION_MODES,
  INTERACTIVE_MARKER_ORIENTATION_MODES,
  UNSUPPORTED_INTERACTIVE_MARKER_ORIENTATION_MODES,
  DEFAULT_SCALE,
} from './constants';
import Controls from 'three-freeform-controls/dist/types/controls';
import TfViewer from '../viewers/Tf';

export default class InteractiveMarkerManager {
  public object: Object3D;
  private readonly markerManagerMap: { [p: string]: MarkerManager } = {};
  private readonly controlsMap: {
    [p: string]: Controls[] | undefined;
  } = {};
  private readonly objectMap: {
    [p: string]: Group & { frameId?: string };
  } = {};
  private readonly viewer: TfViewer;
  private readonly hideOtherHandlesOnSelect: boolean;
  private readonly hideOtherControlsInstancesOnSelect: boolean;
  public visible: boolean;
  public namespaces: { [p: string]: boolean } = {};
  public callback: () => void = () => null;

  constructor(rootObject: Object3D, viewer: TfViewer, options: any) {
    this.object = rootObject;
    this.viewer = viewer;
    this.hideOtherHandlesOnSelect = options.hideOtherHandlesOnSelect;
    this.hideOtherControlsInstancesOnSelect =
      options.hideOtherControlsInstancesOnSelect;
    this.visible = options.visible;
    this.onChange = this.onChange.bind(this);
  }

  getMarkerManagerOrCreate(interactiveMarkerName: string) {
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

  onNamespaceChange(callback: () => void) {
    this.callback = callback;
  }

  initMarkers(
    interactiveMarker: RosMessage.InteractiveMarker,
    controlsManager: ControlsManager,
    visible: boolean,
  ) {
    const {
      controls,
      header: { frame_id },
      name,
      pose: { orientation, position },
      scale,
    } = interactiveMarker;
    const { manager, object } = this.getMarkerManagerOrCreate(name);

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
      if (this.controlsMap[key] === undefined) {
        this.controlsMap[key] = [];
      }
      if (this.controlsMap[key]?.length !== controls.length) {
        const attachMode =
          control.orientation_mode ===
          INTERACTIVE_MARKER_ORIENTATION_MODES.FIXED
            ? ANCHOR_MODE.FIXED
            : ANCHOR_MODE.INHERIT;
        const controls = controlsManager.anchor(object, {
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
        const newScale = scale || DEFAULT_SCALE;
        controls.scale.set(newScale, newScale, newScale);
        controls.visible = visible;

        InteractiveMarkerManager.enableControls(
          object,
          control.interaction_mode,
          control.orientation_mode,
          control.name,
          controls,
          randomColor({
            seed: `${key}-${control.name}-${2 * index}`, // 2 * for more variable color
          }),
        );

        this.controlsMap[key]?.push(controls);
      }

      if (control.markers.length > 0) {
        control.markers.forEach(marker => {
          manager.updateMarker(marker);
        });
      }
    });
  }

  setVisible(visible: boolean) {
    this.visible = visible;
    const controlGroups = Object.values(this.controlsMap);
    controlGroups.map(controls => {
      controls?.map(manager => {
        manager.visible = visible;
        manager.object.visible = visible;
      });
    });
  }

  updatePose(markerMessage: RosMessage.InteractiveMarkerPose) {
    const { name, pose } = markerMessage;
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
    object: Object3D,
    interactionMode: number,
    orientationMode: number,
    controlName: string,
    controls: Controls,
    givenColor: string,
  ) {
    controls.showAll(false);
    const controlsManagerOrientation = new Quaternion();
    controls.getWorldQuaternion(controlsManagerOrientation);
    const controlsManagerRotation = new Euler().setFromQuaternion(
      controlsManagerOrientation,
    );
    const alignmentColor = InteractiveMarkerManager.getAlignmentColor(
      controlsManagerRotation,
    );
    const color = alignmentColor ?? givenColor;

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
      controls.showByNames([DEFAULT_HANDLE_GROUP_NAME.ER], true);
      return;
    }

    let handles: string[] = [];
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
        controls.translationXP.setColor(color);
        controls.translationXN.setColor(color);
        break;
      }
      case INTERACTIVE_MARKER_INTERACTION_MODES.MOVE_PLANE: {
        handles = [DEFAULT_HANDLE_GROUP_NAME.PICK_PLANE_YZ];
        controls.pickPlaneYZ.setColor(color);
        break;
      }
      case INTERACTIVE_MARKER_INTERACTION_MODES.ROTATE_AXIS: {
        handles = [DEFAULT_HANDLE_GROUP_NAME.XR];
        controls.rotationX.setColor(color);
        break;
      }
      case INTERACTIVE_MARKER_INTERACTION_MODES.MOVE_ROTATE: {
        handles = [
          DEFAULT_HANDLE_GROUP_NAME.XR,
          DEFAULT_HANDLE_GROUP_NAME.PICK_PLANE_YZ,
        ];
        controls.pickPlaneYZ.setColor(color);
        controls.rotationX.setColor(color);
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
    controls.showByNames(handles, true);
  }

  static getAlignmentColor(rotation: Euler) {
    const threshold = 10 ** -3;
    const [x, y, z] = rotation.toArray();
    for (let i = -4; i <= 4; i++) {
      const angle = (i * Math.PI) / 2;
      if (
        Math.abs(x - angle) < threshold &&
        Math.abs(y) < threshold &&
        Math.abs(z) < threshold
      ) {
        return 'red';
      }
      if (
        Math.abs(y - angle) < threshold &&
        Math.abs(x) < threshold &&
        Math.abs(z) < threshold
      ) {
        return 'green';
      }
      if (
        Math.abs(z - angle) < threshold &&
        Math.abs(y) < threshold &&
        Math.abs(x) < threshold
      ) {
        return 'blue';
      }
    }

    return null;
  }

  removeObject(id: string) {
    const obj = this.objectMap[id];
    obj.parent?.remove(obj);
    delete this.objectMap[id];
  }

  reset(destroy: boolean) {
    this.onChange();

    if (destroy) {
      Object.keys(this.objectMap).forEach(id => {
        this.removeObject(id);
      });
    }
  }
}
