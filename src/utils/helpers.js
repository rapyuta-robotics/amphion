import { POSE_VIZ_TYPES } from '../viz/Pose';

export const checkToleranceThresholdExceed = (oldPose, newPose, options) => {
  const { positionTolerance, angleTolerance } = options;
  const { position, quaternion } = newPose;
  const { position: oldPosition, quaternion: oldQuaternion } = oldPose;

  const positionToleranceBool = oldPosition.distanceTo(position) > positionTolerance;
  const angleToleranceBool = oldQuaternion.angleTo(quaternion) > angleTolerance;

  return positionToleranceBool || angleToleranceBool;
};

export const setObjectDimension = (object, options) => {
  switch (object.type) {
    case POSE_VIZ_TYPES.arrow: {
      const {
        color,
        alpha,
        shaftLength,
        shaftRadius,
        headLength,
        headRadius
      } = options;

      object.setHeadDimensions({ radius: headRadius, length: headLength });
      object.setShaftDimensions({ radius: shaftRadius, length: shaftLength });
      object.setAlpha(alpha);
      object.setColor({ cone: new THREE.Color(color), cylinder: new THREE.Color(color) });
      break;
    }
    case POSE_VIZ_TYPES.axes: {
      const { axesLength, axesRadius } = options;

      object.setLength(axesLength);
      object.setRadius(axesRadius);
      break;
    }
    case POSE_VIZ_TYPES.flatArrow: {
      const { arrowLength, color } = options;

      object.setLength(arrowLength);
      object.setColor(new THREE.Color(color));
      break;
    }
  }
};
