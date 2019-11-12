/* eslint-disable prettier/prettier */
import { Group } from 'three';

export const OBJECT_TYPE_ARROW = 'Arrow';
export const OBJECT_TYPE_ARROW_WITH_CIRCLE = 'ArrowWithCircle';
export const OBJECT_TYPE_AXES = 'Axes';
export const OBJECT_TYPE_FLAT_ARROW = 'FlatArrow';

export const MAX_POINTCLOUD_POINTS = 5000000;

export const DEFAULT_BACKGROUND_COLOR = '#000000';
export const DEFAULT_GRID_SIZE = 30;
export const DEFAULT_GRID_DIVISIONS = 30;
export const DEFAULT_GRID_COLOR = '#222222';
export const DEFAULT_GRID_COLOR_CENTERLINE = '#333333';

export const INTERACTIVE_MARKER_ORIENTATION_MODES = {
  'INHERIT': 0,
  'FIXED': 1,
  'VIEW_FACING': 2,
};

export const UNSUPPORTED_INTERACTIVE_MARKER_ORIENTATION_MODES = [
  INTERACTIVE_MARKER_ORIENTATION_MODES.VIEW_FACING,
];

export const INTERACTIVE_MARKER_INTERACTION_MODES = {
  'NONE': 0,
  'MENU': 1,
  'BUTTON': 2,
  'MOVE_AXIS': 3,
  'MOVE_PLANE': 4,
  'ROTATE_AXIS': 5,
  'MOVE_ROTATE': 6,
  'MOVE_3D': 7,
  'ROTATE_3D': 8,
  'MOVE_ROTATE_3D': 9,
};

/* * ***************************
 *   Message types
 * ************************** */
export const MESSAGE_TYPE_ROBOT_MODEL = 'robot_description';
export const MESSAGE_TYPE_ACCELSTAMPED = 'geometry_msgs/AccelStamped';
export const MESSAGE_TYPE_POINTSTAMPED = 'geometry_msgs/PointStamped';
export const MESSAGE_TYPE_POLYGONSTAMPED = 'geometry_msgs/PolygonStamped';
export const MESSAGE_TYPE_POSEARRAY = 'geometry_msgs/PoseArray';
export const MESSAGE_TYPE_POSECOVARIANCE = 'geometry_msgs/PoseWithCovariance';
export const MESSAGE_TYPE_POSESTAMPED = 'geometry_msgs/PoseStamped';
export const MESSAGE_TYPE_TWISTSTAMPED = 'geometry_msgs/TwistStamped';
export const MESSAGE_TYPE_VECTOR3STAMPED = 'geometry_msgs/Vector3Stamped';
export const MESSAGE_TYPE_WRENCHSTAMPED = 'geometry_msgs/WrenchStamped';

export const MESSAGE_TYPE_BOUNDINGVOLUME = 'moveit_msgs/BoundingVolume';
export const MESSAGE_TYPE_COLLISION_OBJECT = 'moveit_msgs/CollisionObject';
export const MESSAGE_TYPE_DISPLAYROBOTSTATE = 'moveit_msgs/DisplayRobotState';
export const MESSAGE_TYPE_DISPLAYTRAJECTORY = 'moveit_msgs/DisplayTrajectory';
export const MESSAGE_TYPE_PLANNINGSCENE = 'moveit_msgs/PlanningScene';

export const MESSAGE_TYPE_OCCUPANCYGRID = 'nav_msgs/OccupancyGrid';
export const MESSAGE_TYPE_ODOMETRY = 'nav_msgs/Odometry';
export const MESSAGE_TYPE_PATH = 'nav_msgs/Path';

export const MESSAGE_TYPE_COMPRESSEDIMAGE = 'sensor_msgs/CompressedImage';
export const MESSAGE_TYPE_DISPLAYJOINTSTATE = 'sensor_msgs/JointState';
export const MESSAGE_TYPE_IMAGE = 'sensor_msgs/Image';
export const MESSAGE_TYPE_LASERSCAN = 'sensor_msgs/LaserScan';
export const MESSAGE_TYPE_MAGNETICFIELD = 'sensor_msgs/MagneticField';
export const MESSAGE_TYPE_POINTCLOUD = 'sensor_msgs/PointCloud';
export const MESSAGE_TYPE_POINTCLOUD2 = 'sensor_msgs/PointCloud2';
export const MESSAGE_TYPE_RANGE = 'sensor_msgs/Range';

export const MESSAGE_TYPE_TF = 'tf/tfMessage';
export const MESSAGE_TYPE_TF2 = 'tf2_msgs/TFMessage';

export const MESSAGE_TYPE_MARKER = 'visualization_msgs/Marker';
export const MESSAGE_TYPE_MARKERARRAY = 'visualization_msgs/MarkerArray';
export const MESSAGE_TYPE_INTERACTIVEMARKER = 'visualization_msgs/InteractiveMarkerInit';
export const MESSAGE_TYPE_INTERACTIVEMARKER_UPDATE = 'visualization_msgs/InteractiveMarkerUpdate';
export const MESSAGE_TYPE_INTERACTIVEMARKER_FEEDBACK = 'visualization_msgs/InteractiveMarkerFeedback';

/** ***************************
 *   Visualizations
 * ************************** */
export const VIZ_TYPE_IMAGE = 'Image';
export const VIZ_TYPE_INTERACTIVEMARKER = 'InteractiveMarker';
export const VIZ_TYPE_LASERSCAN = 'LaserScan';
export const VIZ_TYPE_MAP = 'Map';
export const VIZ_TYPE_MARKER = 'Marker';
export const VIZ_TYPE_MARKERARRAY = 'MarkerArray';
export const VIZ_TYPE_ODOMETRY = 'Odometry';
export const VIZ_TYPE_PATH = 'Path';
export const VIZ_TYPE_POINT = 'Point';
export const VIZ_TYPE_POINTCLOUD = 'PointCloud';
export const VIZ_TYPE_POLYGON = 'Polygon';
export const VIZ_TYPE_POSE = 'Pose';
export const VIZ_TYPE_POSEARRAY = 'PoseArray';
export const VIZ_TYPE_RANGE = 'Range';
export const VIZ_TYPE_ROBOTMODEL = 'RobotModel';
export const VIZ_TYPE_TF = 'Tf';
export const VIZ_TYPE_WRENCH = 'Wrench';

/* * ***************************
 *   Viz specific constants
 * ************************** */

export const POINT_FIELD_DATATYPES = {
  INT8: 1,
  UINT8: 2,
  INT16: 3,
  UINT16: 4,
  INT32: 5,
  UINT32: 6,
  FLOAT32: 7,
  FLOAT64: 8,
};

export const COLLISION_OBJECT_OPERATIONS = {
  ADD: 0,
  REMOVE: 1,
  APPEND: 2,
  MOVE: 3,
};

export const SOLID_PRIMITIVE_TYPES = {
  BOX: 1,
  SPHERE: 2,
  CYLINDER: 3,
  CONE: 4,
};

export const MARKER_OBJECT_TYPES = {
  ARROW: 0,
  CUBE: 1,
  SPHERE: 2,
  CYLINDER: 3,
  LINE_STRIP: 4,
  LINE_LIST: 5,
  CUBE_LIST: 6,
  SPHERE_LIST: 7,
  POINTS: 8,
  TEXT_VIEW_FACING: 9,
  MESH_RESOURCE: 10,
  TRIANGLE_LIST: 11,
};

export const LINE_STYLES = {
  LINES: 'Lines',
  BILLBOARDS: 'Billboards',
};

export const MAP_COLOR_SCHEMES = {
  MAP: 'map',
  CONST_MAP: 'constmap',
  RAW: 'raw',
};

export const LASERSCAN_STYLES = {
  SQUARES: 'squares',
  POINTS: 'points',
  FLAT_SQUARES: 'flat_squares',
  SPHERES: 'spheres',
  BOXES: 'boxes',
};

export const COLOR_TRANSFORMERS = {
  INTENSITY: 'Intensity',
  AXIS_COLOR: 'AxisColor',
  FLAT_COLOR: 'FlatColor',
};

const DEPTHCLOUD_STREAMTYPES = {
  VP8: 'vp8',
  MJPEG: 'mjpeg',
};

export const POINTCLOUD_COLOR_CHANNELS = {
  RGB: 'rgb',
  INTENSITY: 'intensity',
};

export const AXES = {
  X: 'x',
  Y: 'y',
  Z: 'z',
};

export const INTENSITY_CHANNEL_OPTIONS = {
  INTENSITY: 'intensity',
  ...AXES,
};

export const ODOMETRY_OBJECT_TYPES = {
  arrow: OBJECT_TYPE_ARROW,
  axes: OBJECT_TYPE_AXES,
};

export const POSE_OBJECT_TYPES = {
  arrow: OBJECT_TYPE_ARROW,
  axes: OBJECT_TYPE_AXES,
  flatArrow: OBJECT_TYPE_FLAT_ARROW,
};

export const WRENCH_OBJECT_TYPES = {
  arrow: OBJECT_TYPE_ARROW,
  arrowWithCircle: OBJECT_TYPE_ARROW_WITH_CIRCLE,
};





/** ***************************
 *   Default Options
 * ************************** */
export const DEFAULT_CYLINDER_HEIGHT = 1;
export const DEFAULT_CYLINDER_RADIUS = 1;
export const DEFAULT_RADIAL_SEGMENTS = 32;

export const DEFAULT_CONE_HEIGHT = 1;
export const DEFAULT_CONE_RADIUS = 1;

export const DEFAULT_COLOR_X_AXIS = '#ff0000';
export const DEFAULT_COLOR_Y_AXIS = '#008000';
export const DEFAULT_COLOR_Z_AXIS = '#0000ff';
export const DEFAULT_COLOR_ARROW = '#f0ff00';
export const DEFAULT_COLOR_LINE = '#f0ff00';

export const DEFAULT_OPTIONS_SCENE = {
  backgroundColor: DEFAULT_BACKGROUND_COLOR,
  gridSize: DEFAULT_GRID_SIZE,
  gridDivisions: DEFAULT_GRID_DIVISIONS,
  gridColor: DEFAULT_GRID_COLOR,
  gridCenterlineColor: DEFAULT_GRID_COLOR_CENTERLINE,
};

export const DEFAULT_OPTIONS_TF_VIEWER = {
  selectedFrame: '',
};

export const DEFAULT_OPTIONS_ARROW = {
  shaftLength: 1,
  shaftRadius: 0.05,
  headLength: 0.3,
  headRadius: 0.1,
};

export const DEFAULT_OPTIONS_AXES = {
  axesLength: 1,
  axesRadius: 0.1,
};

export const DEFAULT_OPTIONS_FLATARROW = {
  arrowLength: 0.3,
};

export const DEFAULT_OPTIONS_DISPLAYTRAJECTORY = {
  robot: new Group(),
  loop: true,
};

const DEFAULT_OPTIONS_INTENSITY = {
  channelName: INTENSITY_CHANNEL_OPTIONS.INTENSITY,
  useRainbow: false,
  invertRainbow: false,
  minColor: '#000000',
  maxColor: '#ffffff',
  autocomputeIntensityBounds: false,
  maxIntensity: 3730,
  minIntensity: 388,
};

export const DEFAULT_OPTIONS_COLLISION_OBJECT = {};

const DEFAULT_OPITONS_AXIS_COLOR = {
  axis: AXES.X,
  autocomputeValueBounds: false,
  useFixedFrame: false,
  minAxisValue: 0,
  maxAxisValue: 0,
};

export const DEFAULT_OPTIONS_DEPTHCLOUD = {
  streamType: DEPTHCLOUD_STREAMTYPES.MJPEG,
  f: 526,
  maxDepthPerTile: 1.0,
  pointSize: 3,
  width: 1024,
  height: 1024,
  whiteness: 0,
  varianceThreshold: 0.000016667,
};

export const DEFAULT_OPTIONS_IMAGE = {
  queueSize: 1,
  defaultWidth: 320,
  defaultHeight: 240,
  compression: 'cbor',
};

export const DEFAULT_OPTIONS_LASERSCAN = {
  selectable: false,
  style: LASERSCAN_STYLES.FLAT_SQUARES,
  size: 0.05,
  alpha: 1,
  decayTime: 0,
  queueSize: 10,
  compression: 'cbor',
  colorTransformer: COLOR_TRANSFORMERS.INTENSITY,
  flatColor: '#ffffff',
  ...DEFAULT_OPTIONS_INTENSITY,
  ...DEFAULT_OPITONS_AXIS_COLOR,
};

export const DEFAULT_OPTIONS_MAP = {
  alpha: 1,
  colorScheme: MAP_COLOR_SCHEMES.MAP,
  compression: 'cbor',
  drawBehind: false,
};

export const DEFAULT_OPTIONS_MARKER = {
  queueSize: 1,
  namespaces: [],
};

export const DEFAULT_OPTIONS_MARKERARRAY = {
  queueSize: 1,
  namespaces: [],
  throttleRate: 0,
};

export const DEFAULT_OPTIONS_INTERACTIVE_MARKER = {
  queueSize: 1,
  namespaces: [],
  throttleRate: 0,
  publishThrottleRate: 0,
  hideOtherHandlesOnSelect: true,
  hideOtherControlsInstancesOnSelect: true,
};

export const DEFAULT_OPTIONS_ODOMETRY = {
  type: OBJECT_TYPE_ARROW,
  color: DEFAULT_COLOR_X_AXIS,
  alpha: 1,
  ...DEFAULT_OPTIONS_ARROW,
  ...DEFAULT_OPTIONS_AXES,
  ...DEFAULT_OPTIONS_FLATARROW,
  positionTolerance: 0.1,
  angleTolerance: 0.1,
  keep: 100,
};

export const DEFAULT_OPTIONS_PATH = {
  color: '#ffffff',
  alpha: 1,
};

export const DEFAULT_OPTIONS_PLANNINGSCENE = {};

export const DEFAULT_OPTIONS_POINTCLOUD = {
  compression: 'cbor',
  colorChannel: POINTCLOUD_COLOR_CHANNELS.RGB,
  size: 0.0125,
  useRainbow: true,
  queueSize: 1,
};

export const DEFAULT_OPTIONS_POINT = {
  color: '#ff0000',
  alpha: 1,
  radius: 0.2,
};

export const DEFAULT_OPTIONS_POLYGON = {
  color: '#ffffff',
  alpha: 1,
};

export const DEFAULT_OPTIONS_POSE = {
  color: DEFAULT_COLOR_X_AXIS,
  alpha: 1,
  ...DEFAULT_OPTIONS_ARROW,
  ...DEFAULT_OPTIONS_AXES,
  type: POSE_OBJECT_TYPES.arrow,
};

export const DEFAULT_OPTIONS_TORUS = {
  circleRadius: 0.3,
  tube: 0.03,
  radialSegments: 16,
  tubularSegments: 100,
  arc: 1.7*Math.PI,
};

export const DEFAULT_OPTIONS_ARROW_WITH_CIRCLE = {
  ...DEFAULT_OPTIONS_ARROW,
  ...DEFAULT_OPTIONS_TORUS,
  circleConeLength: 0.1,
  circleConeRadius: 0.1,
};

export const DEFAULT_OPTIONS_WRENCH = {
    forceColor: DEFAULT_COLOR_X_AXIS,
    torqueColor: DEFAULT_COLOR_ARROW,
    alpha: 1,
    forceArrowScale: 1,
    torqueArrowScale: 1,
    arrowWidth: 1,
    ...DEFAULT_OPTIONS_ARROW_WITH_CIRCLE,
    type: WRENCH_OBJECT_TYPES.arrow,
};

export const DEFAULT_OPTIONS_POSEARRAY = {
  color: DEFAULT_COLOR_X_AXIS,
  alpha: 1,
  ...DEFAULT_OPTIONS_ARROW,
  ...DEFAULT_OPTIONS_AXES,
  ...DEFAULT_OPTIONS_FLATARROW,
  type: POSE_OBJECT_TYPES.arrow,
};

export const DEFAULT_OPTIONS_RANGE = {
  color: DEFAULT_COLOR_X_AXIS,
  alpha: 1,
};

export const DEFAULT_OPTIONS_ROBOTMODEL = {};

export const DEFAULT_OPTIONS_TF = {};

/** ***************************
 *   Zethus exports
 * ************************** */
export const SUPPORTED_MESSAGE_TYPES = [
  MESSAGE_TYPE_IMAGE,
  MESSAGE_TYPE_LASERSCAN,
  MESSAGE_TYPE_MARKER,
  MESSAGE_TYPE_MARKERARRAY,
  MESSAGE_TYPE_OCCUPANCYGRID,
  MESSAGE_TYPE_ODOMETRY,
  MESSAGE_TYPE_PATH,
  MESSAGE_TYPE_PLANNINGSCENE,
  MESSAGE_TYPE_POINTCLOUD2,
  MESSAGE_TYPE_POLYGONSTAMPED,
  MESSAGE_TYPE_POSESTAMPED,
  MESSAGE_TYPE_POSEARRAY,
  MESSAGE_TYPE_POSESTAMPED,
  MESSAGE_TYPE_ROBOT_MODEL,
  MESSAGE_TYPE_TF,
  MESSAGE_TYPE_TF2,
];

export const UNSUPPORTED_MESSAGE_TYPES = [
  MESSAGE_TYPE_ACCELSTAMPED,
  MESSAGE_TYPE_BOUNDINGVOLUME,
  MESSAGE_TYPE_COMPRESSEDIMAGE,
  MESSAGE_TYPE_DISPLAYJOINTSTATE,
  MESSAGE_TYPE_DISPLAYROBOTSTATE,
  MESSAGE_TYPE_DISPLAYTRAJECTORY,
  MESSAGE_TYPE_INTERACTIVEMARKER,
  MESSAGE_TYPE_MAGNETICFIELD,
  MESSAGE_TYPE_POINTCLOUD,
  MESSAGE_TYPE_POSECOVARIANCE,
  MESSAGE_TYPE_RANGE,
  MESSAGE_TYPE_TWISTSTAMPED,
  MESSAGE_TYPE_VECTOR3STAMPED,
  MESSAGE_TYPE_WRENCHSTAMPED,
];
