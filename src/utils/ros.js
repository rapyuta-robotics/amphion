import ROSLIB from 'roslib';
import { MESSAGE_TYPE_INTERACTIVEMARKER_FEEDBACK } from './constants';

export const makeInteractiveMarkerFeedbackTopic = (ros, name) =>
  new ROSLIB.Topic({
    ros,
    name,
    messageType: MESSAGE_TYPE_INTERACTIVEMARKER_FEEDBACK,
  });

export const makeInteractiveMarkerFeedbackMessage = ({
  seq,
  frame_id: frameId,
  client_id: clientId,
  marker_name: markerName,
  control_name: controlName,
  position,
  quaternion,
}) =>
  new ROSLIB.Message({
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
