import { Mesh as Mesh$1, Math as Math$1, CylinderGeometry, MeshStandardMaterial, ConeGeometry, Group as Group$1, Line as Line$1, Geometry, Vector3, LineBasicMaterial, Color, VertexColors, FontLoader, TextGeometry, MeshBasicMaterial, DefaultLoadingManager, PointsMaterial, BufferGeometry, BufferAttribute, Points as Points$2, BoxGeometry, SphereGeometry, LineSegments as LineSegments$1, FaceColors, DoubleSide, Face3, Object3D, TextureLoader, PlaneGeometry, FrontSide, CanvasTexture, NearestFilter, Quaternion, Scene as Scene$1, DirectionalLight, AmbientLight, GridHelper, EventDispatcher, Box3, Matrix3, Vector2, Spherical, Sphere as Sphere$1, OrthographicCamera, WebGLRenderer, PerspectiveCamera, Matrix4 } from 'three';
import ROSLIB from 'roslib';
import URDFLoader from 'urdf-loader';
import Stats from 'stats-js';
import { ResizeObserver as ResizeObserver$1 } from '@juggle/resize-observer';
import { EditorControls } from 'three/examples/jsm/controls/EditorControls';

class Core {
  constructor(ros, topicName, messageType, options = {}) {
    const { onHeaderChange } = options;
    this.options = options;
    this.ros = ros;
    this.headerFrameId = '';
    this.changeTopic(topicName, messageType, false);
    this.onHeaderChange = onHeaderChange || (() => {});
    this.update = this.update.bind(this);
  }

  hide() {
    this.object.visible = false;
  }

  show() {
    this.object.visible = true;
  }

  destroy() {
    this.unsubscribe();
    this.object.parent.remove(this.object);
    this.object = null;
  }

  reset() {}

  subscribe() {
    if (!this.topicInstances) {
      return;
    }
    this.topicInstances.forEach(t => {
      t.subscribe(this.update);
    });
  }

  unsubscribe() {
    if (!this.topicInstances) {
      return;
    }
    this.topicInstances.forEach(t => {
      t.unsubscribe();
    });
  }

  update(message) {
    const header = message.header ? message.header.frame_id : '';
    if (header !== this.headerFrameId) {
      this.headerFrameId = header;
      this.onHeaderChange(this.headerFrameId);
    }
  }

  updateOptions(options) {
    this.options = {
      ...this.options,
      ...options,
    };
  }

  changeTopic(topicName, type, autoSubscribe = true) {
    const { queueSize, throttleRate } = this.options;

    if (autoSubscribe) {
      this.unsubscribe();
    }

    this.topicName = topicName;
    this.messageType = type || this.messageType;
    this.topicInstances = (Array.isArray(topicName)
      ? topicName
      : [{ name: topicName, type }]
    ).map(
      ({ name, messageType }) =>
        new ROSLIB.Topic({
          ros: this.ros,
          name,
          messageType,
          throttle_rate: throttleRate || 0,
          queue_size: queueSize || 10,
        }),
    );

    if (autoSubscribe) {
      this.reset();
      this.subscribe();
    }
  }
}

const OBJECT_TYPE_ARROW = 'Arrow';
const OBJECT_TYPE_AXES = 'Axes';
const OBJECT_TYPE_FLAT_ARROW = 'FlatArrow';

const MAX_POINTCLOUD_POINTS = 100000;

const DEFAULT_BACKGROUND_COLOR = '#000000';
const DEFAULT_GRID_SIZE = 30;
const DEFAULT_GRID_DIVISIONS = 30;
const DEFAULT_GRID_COLOR = '#222222';
const DEFAULT_GRID_COLOR_CENTERLINE = '#333333';
const MESSAGE_TYPE_POLYGONSTAMPED = 'geometry_msgs/PolygonStamped';
const MESSAGE_TYPE_POSEARRAY = 'geometry_msgs/PoseArray';
const MESSAGE_TYPE_POSESTAMPED = 'geometry_msgs/PoseStamped';

const MESSAGE_TYPE_OCCUPANCYGRID = 'nav_msgs/OccupancyGrid';
const MESSAGE_TYPE_ODOMETRY = 'nav_msgs/Odometry';
const MESSAGE_TYPE_PATH = 'nav_msgs/Path';
const MESSAGE_TYPE_IMAGE = 'sensor_msgs/Image';
const MESSAGE_TYPE_LASERSCAN = 'sensor_msgs/LaserScan';
const MESSAGE_TYPE_POINTCLOUD2 = 'sensor_msgs/PointCloud2';

const MESSAGE_TYPE_MARKER = 'visualization_msgs/Marker';
const MESSAGE_TYPE_MARKERARRAY = 'visualization_msgs/MarkerArray';

/** ***************************
 *   Viz specific constants
 * ************************** */
const MARKER_OBJECT_TYPES = {
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

const MAP_COLOR_SCHEMES = {
  MAP: 'map',
  CONST_MAP: 'constmap',
  RAW: 'raw',
};

const LASERSCAN_STYLES = {
  SQUARES: 'squares',
  POINTS: 'points',
  FLAT_SQUARES: 'flat_squares',
  SPHERES: 'spheres',
  BOXES: 'boxes',
};

const COLOR_TRANSFORMERS = {
  INTENSITY: 'Intensity',
  AXIS_COLOR: 'AxisColor',
  FLAT_COLOR: 'FlatColor',
};

const AXES = {
  X: 'x',
  Y: 'y',
  Z: 'z',
};

const INTENSITY_CHANNEL_OPTIONS = {
  INTENSITY: 'intensity',
  ...AXES,
};

const ODOMETRY_OBJECT_TYPES = {
  arrow: OBJECT_TYPE_ARROW,
  axes: OBJECT_TYPE_AXES,
};

const POSE_OBJECT_TYPES = {
  arrow: OBJECT_TYPE_ARROW,
  axes: OBJECT_TYPE_AXES,
  flatArrow: OBJECT_TYPE_FLAT_ARROW,
};

/** ***************************
 *   Default Options
 * ************************** */
const DEFAULT_CYLINDER_HEIGHT = 1;
const DEFAULT_CYLINDER_RADIUS = 1;
const DEFAULT_RADIAL_SEGMENTS = 32;

const DEFAULT_CONE_HEIGHT = 1;
const DEFAULT_CONE_RADIUS = 1;

const DEFAULT_COLOR_X_AXIS = '#ff0000';
const DEFAULT_COLOR_Y_AXIS = '#008000';
const DEFAULT_COLOR_Z_AXIS = '#0000ff';
const DEFAULT_COLOR_ARROW = '#f0ff00';

const DEFAULT_OPTIONS_SCENE = {
  backgroundColor: DEFAULT_BACKGROUND_COLOR,
  gridSize: DEFAULT_GRID_SIZE,
  gridDivisions: DEFAULT_GRID_DIVISIONS,
  gridColor: DEFAULT_GRID_COLOR,
  gridCenterlineColor: DEFAULT_GRID_COLOR_CENTERLINE,
};

const DEFAULT_OPTIONS_ARROW = {
  shaftLength: 1,
  shaftRadius: 0.05,
  headLength: 0.3,
  headRadius: 0.1,
};

const DEFAULT_OPTIONS_AXES = {
  axesLength: 1,
  axesRadius: 0.1,
};

const DEFAULT_OPTIONS_FLATARROW = {
  arrowLength: 0.3,
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

const DEFAULT_OPITONS_AXIS_COLOR = {
  axis: AXES.X,
  autocomputeValueBounds: false,
  useFixedFrame: false,
  minAxisValue: 0,
  maxAxisValue: 0,
};

const DEFAULT_OPTIONS_IMAGE = {
  queueSize: 1,
};

const DEFAULT_OPTIONS_LASERSCAN = {
  selectable: false,
  style: LASERSCAN_STYLES.FLAT_SQUARES,
  size: 0.05,
  alpha: 1,
  decayTime: 0,
  queueSize: 10,
  colorTransformer: COLOR_TRANSFORMERS.INTENSITY,
  flatColor: '#ffffff',
  ...DEFAULT_OPTIONS_INTENSITY,
  ...DEFAULT_OPITONS_AXIS_COLOR,
};

const DEFAULT_OPTIONS_MAP = {
  alpha: 1,
  colorScheme: MAP_COLOR_SCHEMES.MAP,
  drawBehind: false,
};

const DEFAULT_OPTIONS_MARKER = {
  queueSize: 1,
  namespaces: [],
};

const DEFAULT_OPTIONS_MARKERARRAY = {
  queueSize: 1,
  namespaces: [],
  throttleRate: 0,
};

const DEFAULT_OPTIONS_ODOMETRY = {
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

const DEFAULT_OPTIONS_PATH = {
  color: '#ffffff',
  alpha: 1,
};

const DEFAULT_OPTIONS_POINTCLOUD = {};

const DEFAULT_OPTIONS_POLYGON = {
  color: '#ffffff',
  alpha: 1,
};

const DEFAULT_OPTIONS_POSE = {
  color: DEFAULT_COLOR_X_AXIS,
  alpha: 1,
  ...DEFAULT_OPTIONS_ARROW,
  ...DEFAULT_OPTIONS_AXES,
  type: POSE_OBJECT_TYPES.arrow,
};

const DEFAULT_OPTIONS_POSEARRAY = {
  color: DEFAULT_COLOR_X_AXIS,
  alpha: 1,
  ...DEFAULT_OPTIONS_ARROW,
  ...DEFAULT_OPTIONS_AXES,
  ...DEFAULT_OPTIONS_FLATARROW,
  type: POSE_OBJECT_TYPES.arrow,
};

const DEFAULT_OPTIONS_ROBOTMODEL = {};

const DEFAULT_OPTIONS_TF = {};

const setTransform = (
  object,
  {
    translation: { x: posX, y: posY, z: posZ },
    rotation: { x: orientX, y: orientY, z: orientZ, w: orientW },
  },
) => {
  object.position.set(posX, posY, posZ);
  object.quaternion.set(orientX, orientY, orientZ, orientW);
};

const setScale = (object, { x, y, z }) => {
  object.scale.set(x, y, z);
};

const setColor = (object, { r, g, b }) => {
  object.material.color.setRGB(r, g, b);
};

class Mesh extends Mesh$1 {
  setTransform(transform) {
    setTransform(this, transform);
  }

  setScale(scale) {
    setScale(this, scale);
  }

  setColor(colors) {
    setColor(this, colors);
  }

  setAlpha(alpha) {
    this.material.opacity = Math$1.clamp(alpha, 0, 1);
  }
}

class Cylinder extends Mesh {
  constructor(
    color = DEFAULT_COLOR_ARROW,
    radius = DEFAULT_CYLINDER_RADIUS,
    height = DEFAULT_CYLINDER_HEIGHT,
  ) {
    super();
    this.geometry = new CylinderGeometry(
      radius,
      radius,
      height,
      DEFAULT_RADIAL_SEGMENTS,
    );
    this.material = new MeshStandardMaterial({ color });
    this.material.transparent = true;
    this.rotateX(Math.PI / 2);
  }
}

class Cone extends Mesh {
  constructor(color) {
    super();
    this.geometry = new ConeGeometry(
      DEFAULT_CONE_RADIUS,
      DEFAULT_CONE_HEIGHT,
      DEFAULT_RADIAL_SEGMENTS,
    );
    this.material = new MeshStandardMaterial({ color });
    this.material.transparent = true;
  }
}

class Group extends Group$1 {
  setTransform(transform) {
    setTransform(this, transform);
  }

  setScale(scale) {
    setScale(this, scale);
  }

  setColor(colors) {
    this.children.forEach(child => {
      setColor(child, colors);
    });
  }
}

class Arrow extends Group {
  constructor() {
    super();

    this.cone = new Cone(DEFAULT_COLOR_X_AXIS);
    this.cone.rotateZ(-Math.PI / 2);

    this.cylinder = new Cylinder(DEFAULT_COLOR_X_AXIS);
    this.cylinder.rotateZ(-Math.PI / 2);

    this.cone.setScale({
      x: DEFAULT_CONE_RADIUS,
      y: DEFAULT_CONE_HEIGHT,
      z: DEFAULT_CONE_RADIUS,
    });

    this.cylinder.setScale({
      x: DEFAULT_CYLINDER_RADIUS,
      y: DEFAULT_CYLINDER_HEIGHT,
      z: DEFAULT_CYLINDER_RADIUS,
    });
    this.cylinder.translateY(this.cylinder.scale.y / 2);
    this.cone.translateY(this.cylinder.scale.y + this.cone.scale.y / 2);

    this.type = OBJECT_TYPE_ARROW;
    this.add(this.cone);
    this.add(this.cylinder);
  }

  setColor({ cone, cylinder }) {
    if (cone) {
      this.cone.setColor(cone);
    }

    if (cylinder) {
      this.cylinder.setColor(cylinder);
    }
  }

  setHeadDimensions({ radius, length }) {
    const parsedRadius = parseFloat(radius);
    const parsedLength = parseFloat(length);

    if (parsedRadius) {
      const { y } = this.cone.scale;
      this.cone.setScale({ x: radius, y, z: radius });
    }

    if (parsedLength) {
      const { x, z } = this.cone.scale;
      this.cone.setScale({ x, y: parsedLength, z });
      this.cone.position.set(0, 0, 0);
      this.cone.translateY(this.cylinder.scale.y + parsedLength / 2);
    }
  }

  setShaftDimensions({ radius, length }) {
    const parsedRadius = parseFloat(radius);
    const parsedLength = parseFloat(length);

    if (radius) {
      const { y } = this.cylinder.scale;
      this.cylinder.setScale({ x: parsedRadius, y, z: parsedRadius });
    }

    if (length) {
      const { x, z } = this.cylinder.scale;
      this.cylinder.setScale({ x, y: parsedLength, z });
      this.cylinder.position.set(0, 0, 0);
      this.cylinder.translateY(parsedLength / 2);
      this.setHeadDimensions({ length: this.cone.scale.y });
    }
  }

  setAlpha(alpha) {
    this.cylinder.setAlpha(alpha);
    this.cone.setAlpha(alpha);
  }

  setScale(scale) {
    const { x } = scale;
    const [y, z] = [x / 2, x / 2];
    setScale(this, { x, y, z });
  }
}

class Axes extends Group {
  constructor(radius, height) {
    super();
    this.x = new Cylinder(DEFAULT_COLOR_X_AXIS, radius, height);
    this.y = new Cylinder(DEFAULT_COLOR_Y_AXIS, radius, height);
    this.z = new Cylinder(DEFAULT_COLOR_Z_AXIS, radius, height);

    this.x.translateX((height || DEFAULT_CYLINDER_HEIGHT) / 2);
    this.y.translateZ(-(height || DEFAULT_CYLINDER_HEIGHT) / 2);
    this.z.translateY((height || DEFAULT_CYLINDER_HEIGHT) / 2);

    this.x.rotateZ(-Math.PI / 2);
    this.y.rotateX(Math.PI / 2);

    this.type = OBJECT_TYPE_AXES;
    this.add(this.x);
    this.add(this.y);
    this.add(this.z);
  }

  setLength(length) {
    length = parseFloat(length);
    [this.x, this.y, this.z].forEach(axis => {
      axis.position.set(0, 0, 0);
      axis.scale.setY(length);
    });

    this.x.translateY(length / 2);
    this.y.translateY(-length / 2);
    this.z.translateY(length / 2);
  }

  setRadius(radius) {
    this.children.forEach(child => {
      child.scale.setX(parseFloat(radius));
      child.scale.setZ(parseFloat(radius));
    });
  }
}

class Line extends Line$1 {
  constructor(color, disableVertexColor) {
    super();
    this.geometry = new Geometry();
    this.geometry.vertices.push(new Vector3(0, 0, 0));
    const colorOptions = {};

    if (!disableVertexColor) {
      colorOptions.vertexColors = VertexColors;
    }

    this.material = new LineBasicMaterial({ ...colorOptions });
    this.material.transparent = true;
  }

  setColor(colors) {
    setColor(this, colors);
  }

  updatePoints(points, colors = []) {
    this.geometry.vertices = points.map(
      ({ x, y, z }) => new Vector3(x, y, z),
    );
    this.geometry.verticesNeedUpdate = true;

    const color = [];
    colors.forEach(({ r, g, b }) => {
      color.push(new Color(r, g, b));
    });

    this.geometry.colors = color;
    this.geometry.colorsNeedUpdate = true;
  }

  setTransform(transform) {
    setTransform(this, transform);
  }

  setAlpha(alpha) {
    this.material.opacity = alpha;
  }
}

class LineArrow extends Group {
  constructor() {
    super();
    this.type = OBJECT_TYPE_FLAT_ARROW;
    this.arrowTop = new Line(0xff0000, true);
    this.topPoints = [];
    this.topPoints.push(new Vector3(2, 1, 0));
    this.topPoints.push(new Vector3(3, 0, 0));
    this.topPoints.push(new Vector3(2, -1, 0));
    this.arrowTop.updatePoints(this.topPoints);
    this.add(this.arrowTop);

    this.arrowLength = new Line(0xff0000, true);
    this.arrowLength.updatePoints([
      new Vector3(0, 0, 0),
      new Vector3(3, 0, 0),
    ]);
    this.add(this.arrowLength);

    this.scale.set(0.1, 0.1, 0.1);
  }

  setLength(length) {
    this.scale.set(length, length, length);
  }

  setColor(color) {
    const { b, g, r } = color;
    this.arrowTop.material.color.setRGB(r, g, b);
    this.arrowLength.material.color.setRGB(r, g, b);
  }
}

const checkToleranceThresholdExceed = (oldPose, newPose, options) => {
  const { angleTolerance, positionTolerance } = options;
  const { position, quaternion } = newPose;
  const { position: oldPosition, quaternion: oldQuaternion } = oldPose;

  const positionToleranceBool =
    oldPosition.distanceTo(position) > positionTolerance;
  const angleToleranceBool = oldQuaternion.angleTo(quaternion) > angleTolerance;

  return positionToleranceBool || angleToleranceBool;
};

const setObjectDimension = (object, options) => {
  switch (options.type) {
    case OBJECT_TYPE_ARROW: {
      const {
        alpha,
        color,
        headLength,
        headRadius,
        shaftLength,
        shaftRadius,
      } = options;

      object.setHeadDimensions({ radius: headRadius, length: headLength });
      object.setShaftDimensions({ radius: shaftRadius, length: shaftLength });
      object.setAlpha(alpha);
      object.setColor({
        cone: new Color(color),
        cylinder: new Color(color),
      });
      break;
    }
    case OBJECT_TYPE_AXES: {
      const { axesLength, axesRadius } = options;

      object.setLength(axesLength);
      object.setRadius(axesRadius);
      break;
    }
    case OBJECT_TYPE_FLAT_ARROW: {
      const { arrowLength, color } = options;

      object.setLength(arrowLength);
      object.setColor(new Color(color));
      break;
    }
  }
};

class Pose extends Core {
  constructor(ros, topicName, options = DEFAULT_OPTIONS_POSE) {
    super(ros, topicName, MESSAGE_TYPE_POSESTAMPED, options);
    this.object = new Group$1();
    this.primitive = null;
    this.updateOptions({
      ...DEFAULT_OPTIONS_POSE,
      ...options,
    });
  }

  static getNewPrimitive(options) {
    const { type } = options;
    let newObject = null;

    switch (type) {
      case POSE_OBJECT_TYPES.arrow:
        newObject = new Arrow();
        break;
      case POSE_OBJECT_TYPES.axes:
        newObject = new Axes();
        break;
      case POSE_OBJECT_TYPES.flatArrow:
        newObject = new LineArrow();
        break;
    }

    return newObject;
  }

  updateOptions(options) {
    super.updateOptions(options);
    const { type } = this.options;

    if (this.primitive && this.primitive.type !== type) {
      this.object.remove(this.primitive);
      this.primitive = null;
    }

    if (!this.primitive) {
      this.primitive = Pose.getNewPrimitive(this.options);
      this.object.add(this.primitive);
    }

    setObjectDimension(this.primitive, this.options);
  }

  update(message) {
    super.update(message);
    const {
      pose: { position, orientation },
    } = message;
    this.primitive.setTransform({
      translation: position,
      rotation: orientation,
    });
  }
}

class Polygon extends Core {
  constructor(ros, topicName, options = DEFAULT_OPTIONS_POLYGON) {
    super(ros, topicName, MESSAGE_TYPE_POLYGONSTAMPED, options);
    this.object = new Group();
    this.line = new Line(null, true);
    this.updateOptions({
      ...DEFAULT_OPTIONS_POLYGON,
      ...options,
    });
  }

  updateOptions(options) {
    super.updateOptions(options);
    const { alpha, color } = this.options;
    this.line.setColor(new Color(color));
    this.line.setAlpha(alpha);
  }

  update(message) {
    super.update(message);
    const {
      polygon: { points },
    } = message;
    points.push(points[0]);
    this.line.updatePoints(points);
    this.object.add(this.line);
  }
}

class Text extends Mesh {
  constructor(text) {
    super();
    const loader = new FontLoader();

    loader.load(
      'https://raw.githubusercontent.com/mrdoob/three.js/dev/examples/fonts/helvetiker_regular.typeface.json',
      font => {
        this.geometry = new TextGeometry(text, {
          font,
          size: 0.05,
          height: 0.005,
          curveSegments: 12,
          bevelEnabled: false,
          bevelThickness: 10,
          bevelSize: 8,
          bevelSegments: 5,
        });
        this.material = new MeshBasicMaterial({ color: 0xdddddd });
      },
    );

    this.rotateX(Math.PI / 2);
    this.rotateY(Math.PI);
  }
}

class TfFrame extends Group {
  constructor(frameId) {
    super();
    this.add(new Axes(0.015, 0.25));
    const textObject = new Text(frameId);
    textObject
      .rotateY(Math.PI)
      .translateX(0.03)
      .translateY(0.03);
    this.add(textObject);
    this.arrow = new Arrow();
    this.arrow.setHeadDimensions({
      length: (DEFAULT_CONE_HEIGHT * 0.3) / 2,
      radius: (DEFAULT_CONE_RADIUS * 0.1) / 2,
    });
    this.arrow.setShaftDimensions({
      length: DEFAULT_CYLINDER_HEIGHT * 0.85,
      radius: (DEFAULT_CYLINDER_RADIUS * 0.05) / 6,
    });
    this.arrow.setColor({
      cone: new Color('#FF1493'),
      cylinder: new Color(DEFAULT_COLOR_ARROW),
    });
    this.add(this.arrow);
    this.name = TfFrame.getName(frameId);
  }

  static getName(frameId) {
    return `tf-${frameId}`;
  }
}

class Tf extends Core {
  constructor(ros, topics, options = DEFAULT_OPTIONS_TF) {
    super(ros, topics, null, options);
    this.object = new Group$1();
    this.object.name = 'test';
  }

  update(message) {
    const { transforms } = message;
    transforms.forEach(
      ({
        header: { frame_id: parentFrameId },
        child_frame_id: childFrameId,
        transform,
      }) => {
        const [childFrame, parentFrame] = [
          this.getFrameOrCreate(childFrameId),
          this.getFrameOrCreate(parentFrameId),
        ];

        parentFrame.add(childFrame);
        childFrame.setTransform(transform);

        if (childFrame.position.length() < 0.1) {
          childFrame.arrow.visible = false;
        } else {
          childFrame.arrow.lookAt(
            parentFrame.getWorldPosition(new Vector3()),
          );
          childFrame.arrow.rotateY(-Math.PI / 2);
          childFrame.arrow.visible = true;

          const arrowConeLength = childFrame.arrow.cone.scale.y;
          childFrame.arrow.setShaftDimensions({
            length: childFrame.position.length() - arrowConeLength,
          });
        }
      },
    );

    this.object.children.forEach(child => {
      child.arrow.visible = false;
    });
  }

  getFrameOrCreate(frameId) {
    const existingFrame = this.object.getObjectByName(TfFrame.getName(frameId));
    if (existingFrame) {
      return existingFrame;
    }

    const newFrame = new TfFrame(frameId);
    this.object.add(newFrame);
    return newFrame;
  }
}

const excludedObjects = [
  'PerspectiveCamera',
  'OrthographicCamera',
  'AmbientLight',
  'DirectionalLight',
  'HemisphereLight',
  'Light',
  'RectAreaLight',
  'SpotLight',
  'PointLight',
];

const removeExcludedObjects = mesh => {
  const objectArray = [mesh];
  while (Object.keys(objectArray).length > 0) {
    const currentItem = objectArray.shift();
    currentItem.children.forEach(child => {
      if (!child) {
        return;
      }
      if (excludedObjects.indexOf(child.type) > -1) {
        const { parent } = child;
        parent.children = parent.children.filter(c => c !== child);
      } else {
        objectArray.push(child);
      }
    });
  }
};

class RobotModel extends URDFLoader {
  constructor(ros, paramName, options = DEFAULT_OPTIONS_ROBOTMODEL) {
    super(DefaultLoadingManager);
    const { packages } = options;
    this.param = new ROSLIB.Param({
      ros,
      name: paramName,
    });
    this.object = new Group();
    this.packages = packages || {};
    this.updateOptions({
      ...DEFAULT_OPTIONS_ROBOTMODEL,
      ...options,
    });

    this.defaultLoadMeshCallback = this.defaultLoadMeshCallback.bind(this);
  }

  static onComplete(object) {
    removeExcludedObjects(object);
  }

  updateOptions() {}

  load(onComplete = RobotModel.onComplete, options = {}) {
    this.param.get(robotString => {
      const robotModel = super.parse(robotString, {
        packages: this.packages,
        loadMeshCb: options.loadMeshCb || this.defaultLoadMeshCallback,
        fetchOptions: { mode: 'cors', credentials: 'same-origin' },
        ...options,
      });
      this.object.add(robotModel);
      this.object.name = robotModel.robotName;

      onComplete(this.object);
    });
  }

  defaultLoadMeshCallback(path, ext, done) {
    super.defaultMeshLoader(path, ext, mesh => {
      removeExcludedObjects(mesh);
      done(mesh);
    });
  }

  getPackages(onComplete) {
    this.param.get(robotString => {
      const parser = new DOMParser();
      const urdf = parser.parseFromString(robotString, 'text/xml');
      const packages = [...urdf.querySelectorAll('mesh')].map(mesh => {
        const [targetPkg] = mesh
          .getAttribute('filename')
          .replace(/^package:\/\//, '')
          .split(/\/(.+)/);
        return targetPkg;
      });
      onComplete([...new Set(packages)]);
    });
  }

  destroy() {
    if (this.object.parent) {
      this.object.parent.remove(this.object);
    }
  }

  hide() {
    this.object.visible = false;
  }

  show() {
    this.object.visible = true;
  }
}

const readPoint = (offsets, dataView, index, isBigendian, pointStep) => {
  const baseOffset = index * pointStep;
  const rgb = dataView.getUint32(baseOffset + offsets.rgb, !isBigendian);
  const hex = rgb.toString(16).padStart(6, '0');
  return {
    x: dataView.getFloat32(baseOffset + offsets.x, !isBigendian),
    y: dataView.getFloat32(baseOffset + offsets.y, !isBigendian),
    z: dataView.getFloat32(baseOffset + offsets.z, !isBigendian),
    hex,
  };
};

const BASE64 =
  'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=';
function decode64(x) {
  const a = [];
  let z = 0;
  let bits = 0;

  for (let i = 0, len = x.length; i < len; i++) {
    z += BASE64.indexOf(x[i]);
    bits += 6;
    if (bits >= 8) {
      bits -= 8;
      a.push(z >> bits);
      z &= 2 ** bits - 1;
    }
    z <<= 6;
  }
  return a;
}

const editPointCloudPoints = function(message) {
  const positions = [];
  const colors = [];
  if (message) {
    const { fields } = message;
    const offsets = {};

    fields.forEach(f => {
      offsets[f.name] = f.offset;
    });

    const n = message.height * message.width;
    const uint8Buffer = Uint8Array.from(decode64(message.data)).buffer;
    const dataView = new DataView(uint8Buffer);
    for (let i = 0; i < n; i++) {
      const pt = readPoint(
        offsets,
        dataView,
        i,
        message.is_bigendian,
        message.point_step,
      );
      if (pt.x && pt.y && pt.z) {
        positions.push(pt.x, pt.y, pt.z);
        const color = new Color(`#${pt.hex}`);
        colors.push(color.r, color.g, color.b);
      }
    }
  }
  return {
    positions: Float32Array.from(positions),
    colors: Float32Array.from(colors),
  };
};

class PointCloud extends Core {
  constructor(
    ros,
    topicName,
    messageType = MESSAGE_TYPE_POINTCLOUD2,
    options = DEFAULT_OPTIONS_POINTCLOUD,
  ) {
    super(ros, topicName, messageType, options);
    const cloudMaterial = new PointsMaterial({
      size: 0.1,
      vertexColors: VertexColors,
    });
    const geometry = new BufferGeometry();
    geometry.addAttribute(
      'position',
      new BufferAttribute(
        new Float32Array(MAX_POINTCLOUD_POINTS * 3),
        3,
      ).setDynamic(true),
    );
    geometry.addAttribute(
      'color',
      new BufferAttribute(
        new Float32Array(MAX_POINTCLOUD_POINTS * 3),
        3,
      ).setDynamic(true),
    );
    geometry.setDrawRange(0, 0);
    this.object = new Points$2(geometry, cloudMaterial);
    this.object.frustumCulled = false;
    this.updateOptions({
      ...DEFAULT_OPTIONS_POINTCLOUD,
      ...options,
    });
  }

  updatePointCloudGeometry(positions, colors) {
    const { geometry } = this.object;
    const l = Math.min(MAX_POINTCLOUD_POINTS, positions.length);
    geometry.setDrawRange(0, l);
    const geoPositions = geometry.attributes.position.array;
    const geoColors = geometry.attributes.color.array;

    for (let i = 0, arrayLength = l * 3; i < arrayLength; i++) {
      geoPositions[i] = positions[i] || 0;
      geoColors[i] = colors[i] || 0;
    }
    for (let i = l * 3; i < MAX_POINTCLOUD_POINTS; i++) {
      geoPositions[i] = 0;
    }

    geometry.attributes.position.needsUpdate = true;
    geometry.attributes.color.needsUpdate = true;
  }

  update(message) {
    super.update(message);
    const { colors, positions } = editPointCloudPoints(message);
    this.updatePointCloudGeometry(positions, colors);
  }
}

class Cube extends Mesh {
  constructor() {
    super();
    this.geometry = new BoxGeometry();
    this.material = new MeshStandardMaterial();
  }

  setScale({ x }) {
    super.setScale({ x, y: x, z: x });
  }
}

class Sphere extends Mesh {
  constructor(color, size = 1) {
    super();
    this.geometry = new SphereGeometry(
      size,
      DEFAULT_RADIAL_SEGMENTS,
      DEFAULT_RADIAL_SEGMENTS,
    );
    this.material = new MeshStandardMaterial();
  }
}

class LineSegments extends LineSegments$1 {
  constructor(color, linewidth = 5) {
    super();
    this.geometry = new Geometry();
    this.material = new LineBasicMaterial({ linewidth });
    this.material.vertexColors = VertexColors;
  }

  setColor(colors) {
    setColor(this, colors);
  }

  updatePoints(points, colors) {
    this.geometry.vertices = points.map(
      ({ x, y, z }) => new Vector3(x, y, z),
    );
    this.geometry.verticesNeedUpdate = true;

    if (colors.length > 0) {
      this.geometry.colors = colors.map(
        ({ r, g, b }) => new Color(r, g, b),
      );
      this.geometry.colorsNeedUpdate = true;
    }
  }

  setTransform(transform) {
    setTransform(this, transform);
  }
}

class ObjectCacher {
  constructor(objectPool, Primitive) {
    this.objectPool = objectPool;
    this.Primitive = Primitive;
  }

  setObjectDimension(object, { x, y, z }, color, scale) {
    object.setColor(color);
    object.setScale(scale);
    object.position.set(x, y, z);
  }

  reusePool(points, colors, options) {
    const { scale } = options;
    const currentCount = points.length;

    for (let i = 0; i < currentCount; i++) {
      const currentChild = this.objectPool.children[i];
      this.setObjectDimension(currentChild, points[i], colors[i], scale);
    }

    for (let i = currentCount; i < this.objectPool.children.length; i++) {
      this.objectPool.children[i].visible = false;
    }
  }

  increasePool(points, colors, options) {
    const currentCount = this.objectPool.children.length;
    const { scale } = options;

    for (let i = 0; i < currentCount; i++) {
      const currentChild = this.objectPool.children[i];
      this.setObjectDimension(currentChild, points[i], colors[i], scale);
    }

    for (let i = currentCount; i < points.length; i++) {
      const sphere = new this.Primitive();
      const { x, y, z } = points[i];

      sphere.setColor(colors[i]);
      sphere.setScale(scale);
      sphere.position.set(x, y, z);
      this.objectPool.add(sphere);
    }
  }
}

class SphereList extends Mesh {
  constructor() {
    super();
    this.geometry = new Geometry();
    this.material = new MeshBasicMaterial();
    this.objectCacher = new ObjectCacher(this, Sphere);
  }

  updatePoints(points, colors, options = {}) {
    options.subtype = MARKER_OBJECT_TYPES.SPHERE;

    if (points.length < this.children.length) {
      this.objectCacher.reusePool(points, colors, options);
    } else {
      this.objectCacher.increasePool(points, colors, options);
    }
  }
}

class Points extends Points$2 {
  constructor() {
    super();
    this.geometry = new Geometry();
    this.material = new PointsMaterial({
      vertexColors: VertexColors,
    });
  }

  setTransform(transform) {
    setTransform(this, transform);
  }

  updatePoints(points, colors, options = {}) {
    const {
      scale: { x },
    } = options;

    this.material.size = x;
    this.geometry.vertices = points.map(
      vertex => new Vector3(vertex.x, vertex.y, vertex.z),
    );
    this.geometry.verticesNeedUpdate = true;

    if (colors.length > 0) {
      this.geometry.colors = colors.map(
        color => new Color(color.r, color.g, color.b),
      );
      this.geometry.colorsNeedUpdate = true;
    }
  }

  setScale({ x: size }) {
    this.material.size = size;
  }
}

class TriangleList extends Mesh {
  constructor() {
    super();
    this.geometry = new Geometry();

    this.material = new MeshBasicMaterial({
      vertexColors: FaceColors,
    });
    this.material.side = DoubleSide;
  }

  updatePoints(points, colors = [], options) {
    const vertices = [];
    const faces = [];
    const {
      scale: { x, y, z },
    } = options;

    this.scale.set(x, y, z);
    for (let index = 0, l = points.length / 3; index < l; index++) {
      const verticesArray = [
        points[3 * index],
        points[3 * index + 1],
        points[3 * index + 2],
      ];
      verticesArray.map(side => {
        vertices.push(new Vector3(side.x, side.y, side.z));
      });

      const color =
        colors.length === 0 ? { r: 1, g: 0, b: 0 } : colors[3 * index];
      faces.push(
        new Face3(
          3 * index,
          3 * index + 2,
          3 * index + 1,
          new Vector3(),
          new Color(color.r, color.g, color.b),
        ),
      );
    }

    this.geometry.vertices = vertices;
    this.geometry.faces = faces;

    this.geometry.computeFaceNormals();
    this.geometry.computeVertexNormals();
    this.geometry.elementsNeedUpdate = true;
    this.geometry.verticesNeedUpdate = true;
  }
}

class CubeList extends Mesh {
  constructor() {
    super();
    this.geometry = new Geometry();
    this.material = new MeshBasicMaterial();
    this.objectCacher = new ObjectCacher(this, Cube);
  }

  updatePoints(points, colors, options = {}) {
    options.subtype = MARKER_OBJECT_TYPES.CUBE;

    if (points.length < this.children.length) {
      this.objectCacher.reusePool(points, colors, options);
    } else {
      this.objectCacher.increasePool(points, colors, options);
    }
  }
}

const getNewPrimitive = marker => {
  switch (marker.type) {
    case MARKER_OBJECT_TYPES.CUBE:
      return new Cube();
    case MARKER_OBJECT_TYPES.SPHERE:
      return new Sphere();
    case MARKER_OBJECT_TYPES.CYLINDER: {
      const group = new Group();
      group.add(new Cylinder());
      return group;
    }
    case MARKER_OBJECT_TYPES.LINE_LIST:
      return new LineSegments();
    case MARKER_OBJECT_TYPES.LINE_STRIP:
      return new Line();
    case MARKER_OBJECT_TYPES.SPHERE_LIST:
      return new SphereList();
    case MARKER_OBJECT_TYPES.POINTS:
      return new Points();
    case MARKER_OBJECT_TYPES.TRIANGLE_LIST:
      return new TriangleList();
    case MARKER_OBJECT_TYPES.CUBE_LIST:
      return new CubeList();
    case MARKER_OBJECT_TYPES.ARROW:
    default: {
      const arrow = new Arrow();
      arrow.setHeadDimensions({
        radius: DEFAULT_CONE_RADIUS * 0.1,
        length: DEFAULT_CONE_HEIGHT * 0.3,
      });
      arrow.setShaftDimensions({
        radius: DEFAULT_CYLINDER_RADIUS * 0.05,
        length: DEFAULT_CYLINDER_HEIGHT * 0.7,
      });
      return arrow;
    }
  }
};

class MarkerManager {
  constructor(rootObject, onChangeCb) {
    this.objectMap = {};
    this.object = rootObject;
    this.namespaces = {};
    this.onChangeCb = onChangeCb;
  }

  getMarkerOrCreate(marker) {
    const id = MarkerManager.getId(marker);
    if (!this.objectMap[id]) {
      const object = getNewPrimitive(marker);
      this.objectMap[id] = object;
      this.object.add(object);
    }

    this.objectMap[id].visible = this.namespaces[marker.ns];
    return this.objectMap[id];
  }

  extractNameSpace(str) {
    const tokens = str.split('-');
    return tokens[0];
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
    const { namespaces, queueSize } = options;
    const { queueSize: currentQueueSize } = context;

    if (currentQueueSize !== queueSize) {
      this.setQueueSize(queueSize, context);
    }

    this.namespaces = namespaces;

    for (const key in this.objectMap) {
      // eslint-disable-next-line no-prototype-builtins
      if (this.objectMap.hasOwnProperty(key)) {
        const namespace = this.extractNameSpace(key);
        this.objectMap[key].visible = this.namespaces[namespace];
      }
    }
  }

  onChange() {
    this.onChangeCb();
  }

  updateMarker(marker) {
    const {
      color,
      colors,
      points,
      pose: { position, orientation },
      scale,
    } = marker;
    const markerObject = this.getMarkerOrCreate(marker);

    if (markerObject.updatePoints) {
      markerObject.updatePoints(points, colors, marker);
    }

    markerObject.setTransform({ translation: position, rotation: orientation });

    // To avoid settings these properties for list types: LINE, TRIANGLE, CUBELIST etc
    if (markerObject.setScale && !markerObject.updatePoints) {
      markerObject.setScale({ x: scale.x, y: scale.y, z: scale.z });
    }
    if (markerObject.setColor && colors.length <= 0) {
      markerObject.setColor(color);
    }

    const { ns } = marker;
    if (!(ns in this.namespaces)) {
      this.namespaces[ns] = true;
      this.onChange();
    }
  }

  removeObject(id) {
    const obj = this.objectMap[id];
    obj.parent.remove(obj);
    delete this.objectMap[id];
  }

  reset() {
    this.namespaces = {};
    this.onChange();

    Object.keys(this.objectMap).forEach(id => {
      this.removeObject(id);
    });
  }

  static getId({ ns, id }) {
    return `${ns}-${id}`;
  }
}

class MarkerArray extends Core {
  constructor(ros, topicName, options = DEFAULT_OPTIONS_MARKERARRAY) {
    super(ros, topicName, MESSAGE_TYPE_MARKERARRAY, options);

    this.object = new Group();
    this.onChange = this.onChange.bind(this);

    const { queueSize } = options;
    this.markerManager = new MarkerManager(this.object, this.onChange);
    this.queueSize = queueSize;
    this.updateOptions({
      ...DEFAULT_OPTIONS_MARKERARRAY,
      ...options,
    });
  }

  updateOptions(options) {
    super.updateOptions(options);
    this.markerManager.updateOptions(this.options, this);
  }

  onChange() {
    if (this.callback) {
      this.callback();
    }
  }

  onNamespaceChange(callback) {
    this.callback = callback;
  }

  update(message) {
    super.update(message);
    if (message.markers.length > 0) {
      message.markers.forEach(marker => {
        this.markerManager.updateMarker(marker);
      });
    }
  }

  reset() {
    this.markerManager.reset();
  }
}

class Points$1 {
  constructor(options = {}) {
    this.max_pts = options.max_pts || 10000;
    this.rootObject = options.rootObject || new Object3D();
  }

  setup(type, size, alpha) {
    this.rootObject.children.forEach(child => {
      this.rootObject.remove(child);
    });

    this.positions = new BufferAttribute(
      new Float32Array(this.max_pts * 3),
      3,
      false,
    );
    this.colors = new BufferAttribute(
      new Float32Array(this.max_pts * 3),
      3,
      false,
    );

    let options = {};

    if (type === LASERSCAN_STYLES.POINTS) {
      const sprite = new TextureLoader().load(
        'https://raw.githubusercontent.com/mrdoob/three.js/master/examples/textures/sprites/circle.png',
      );

      options = {
        map: sprite,
        alphaTest: 0.5,
      };
    }

    this.geomtry = new BufferGeometry();
    this.geomtry.addAttribute('position', this.positions.setDynamic(true));
    this.geomtry.addAttribute('color', this.colors.setDynamic(true));

    this.material = new PointsMaterial({
      color: 0x888888,
      size,
      ...options,
    });
    this.material.vertexColors = VertexColors;
    this.material.transparent = true;
    this.material.opacity = alpha;

    this.object = new Points$2(this.geomtry, this.material);
    this.rootObject.add(this.object);
  }

  update(data) {
    this.geomtry.setDrawRange(0, data);
    this.positions.needsUpdate = true;
    this.colors.needsUpdate = true;
    this.positions.updateRange.count = data * this.positions.itemSize;
    this.colors.updateRange.count = data * this.colors.itemSize;
  }

  setAlpha(alpha) {
    this.material.opacity = alpha;
  }

  setSize(size) {
    this.material.size = size;
  }
}

class LaserScan extends Core {
  constructor(ros, topicName, options = DEFAULT_OPTIONS_LASERSCAN) {
    super(ros, topicName, MESSAGE_TYPE_LASERSCAN, options);

    this.points = new Points$1(LASERSCAN_STYLES.POINTS);
    this.sphereList = new SphereList();
    this.cubeList = new CubeList();

    this.object = new Group();
    this.object.add(this.points.rootObject);
    this.object.add(this.sphereList);
    this.object.add(this.cubeList);
    this.prevMessage = null;
    this.updateOptions({
      ...DEFAULT_OPTIONS_LASERSCAN,
      ...options,
    });
  }

  getNormalizedIntensity(data) {
    const { maxIntensity, minIntensity } = this.options;

    return (data - minIntensity) / (maxIntensity - minIntensity);
  }

  applyIntensityTransform(intensity, position) {
    const { channelName, maxColor, minColor } = this.options;
    const { x, y, z } = position;

    let normI;

    switch (channelName) {
      case INTENSITY_CHANNEL_OPTIONS.INTENSITY:
        normI = this.getNormalizedIntensity(intensity);
        break;
      case INTENSITY_CHANNEL_OPTIONS.X:
        normI = this.getNormalizedIntensity(x);
        break;
      case INTENSITY_CHANNEL_OPTIONS.Y:
        normI = this.getNormalizedIntensity(y);
        break;
      case INTENSITY_CHANNEL_OPTIONS.Z:
        normI = this.getNormalizedIntensity(z);
        break;
      default:
        break;
    }

    const minColorHex = new Color(minColor);
    const maxColorHex = new Color(maxColor);

    const finalColor =
      normI * maxColorHex.getHex() + (1 - normI) * minColorHex.getHex();
    return new Color(finalColor);
  }

  getNormalizedAxisValue(data) {
    const { maxAxisValue, minAxisValue } = this.options;

    return (data - minAxisValue) / (maxAxisValue - minAxisValue);
  }

  applyAxisColorTransform(intensity, position) {
    const { axis, maxAxisValue, minAxisValue } = this.options;
    const { x, y, z } = position;

    let normI;

    switch (axis) {
      case AXES.X:
        normI = this.getNormalizedAxisValue(x);
        break;
      case AXES.Y:
        normI = this.getNormalizedAxisValue(y);
        break;
      case AXES.Z:
        normI = this.getNormalizedAxisValue(z);
        break;
      default:
        break;
    }

    const finalColor = normI * maxAxisValue + (1 - normI) * minAxisValue;
    return new Color(finalColor);
  }

  colorTransformer(intensity, position) {
    const { colorTransformer, flatColor } = this.options;

    switch (colorTransformer) {
      case COLOR_TRANSFORMERS.INTENSITY:
        return this.applyIntensityTransform(intensity, position);
      case COLOR_TRANSFORMERS.AXIS_COLOR:
        return this.applyAxisColorTransform(intensity, position);
      case COLOR_TRANSFORMERS.FLAT_COLOR:
        return new Color(flatColor);
      default:
        return null;
    }
  }

  setupPoints({ j, position, color }) {
    this.points.colors.array[j] = color.r;
    this.points.positions.array[j++] = position.x;
    this.points.colors.array[j] = color.g;
    this.points.positions.array[j++] = position.y;
    this.points.colors.array[j] = color.b;
    this.points.positions.array[j++] = position.z;
  }

  hideAllObjects() {
    this.points.rootObject.visible = false;
    this.sphereList.visible = false;
    this.cubeList.visible = false;
  }

  setStyleDimensions(message) {
    if (!message) {
      return;
    }
    const { alpha, style } = this.options;
    const { size } = this.options;
    const { intensities, ranges } = message;
    const n = ranges.length;
    const positions = [];
    const colors = [];

    if (size < 0.001 || !size) {
      return;
    }

    this.hideAllObjects();
    this.points.setup(style, size, alpha);

    let j = 0;
    for (let i = 0; i < n; i++) {
      const range = message.ranges[i];

      if (range >= message.range_min && range <= message.range_max) {
        const angle = message.angle_min + i * message.angle_increment;
        const position = {
          x: range * Math.cos(angle),
          y: range * Math.sin(angle),
          z: 0,
        };
        const color = this.colorTransformer(intensities[i], position);

        switch (style) {
          case LASERSCAN_STYLES.POINTS:
          case LASERSCAN_STYLES.SQUARES:
          case LASERSCAN_STYLES.FLAT_SQUARES: {
            this.setupPoints({ j, position, color });
            j += 3;
            break;
          }
          default:
            positions.push(position);
            colors.push(color);
            break;
        }
      }
    }

    const options = { scale: { x: size, y: size, z: size } };

    switch (style) {
      case LASERSCAN_STYLES.SPHERES: {
        this.sphereList.visible = true;
        this.sphereList.updatePoints(positions, colors, options);
        break;
      }
      case LASERSCAN_STYLES.BOXES: {
        this.cubeList.visible = true;
        this.cubeList.updatePoints(positions, colors, options);
        break;
      }
      default:
        this.points.rootObject.visible = true;
        this.points.update(j / 3);
        break;
    }
  }

  updateOptions(options) {
    super.updateOptions(options);
    this.setStyleDimensions(this.prevMessage);
  }

  update(message) {
    super.update(message);
    this.setStyleDimensions(message);
    this.prevMessage = message;
  }
}

const populateImageDataFromNavMsg = (
  imageData,
  width,
  height,
  dataSource,
) => {
  for (let row = 0; row < height; row++) {
    for (let col = 0; col < width; col++) {
      const mapI = col + (height - row - 1) * width;
      const data = dataSource[mapI];
      const val = new DataView(Uint8Array.from([data]).buffer).getUint8(0);
      let i = (col + row * width) * 4;

      if (val >= 0 && val <= 100) {
        const v = 255 - (255 * val) / 100;
        imageData.data[i] = v; // red
        imageData.data[++i] = v; // green
        imageData.data[++i] = v; // blue
        imageData.data[++i] = 255; // alpha
      } else if (val >= 101 && val <= 127) {
        // illegal positive values in green
        imageData.data[i] = 0; // red
        imageData.data[++i] = 255; // green
        imageData.data[++i] = 0; // blue
        imageData.data[++i] = 255; // alpha
      } else if (val >= 128 && val <= 254) {
        // illegal negative (char) values in shades of red/yellow
        imageData.data[i] = 255; // red
        imageData.data[++i] = (255 * (val - 128)) / (254 - 128); // green
        imageData.data[++i] = 0; // blue
        imageData.data[++i] = 255; // alpha
      } else {
        // legal -1 value is tasteful blueish greenish grayish color
        imageData.data[i] = 0x70; // red
        imageData.data[++i] = 0x89; // green
        imageData.data[++i] = 0x86; // blue
        imageData.data[++i] = 255; // alpha
      }
    }
  }
};

const populateRawImageDataFromNavMsg = (
  imageData,
  width,
  height,
  dataSource,
) => {
  for (let row = 0; row < height; row++) {
    for (let col = 0; col < width; col++) {
      const mapI = col + (height - row - 1) * width;
      const data = dataSource[mapI];

      let i = (col + row * width) * 4;

      const Uint8DV = new DataView(Uint8Array.from([data]).buffer);
      const val = Uint8DV.getUint8(0);

      imageData.data[i] = val;
      imageData.data[++i] = val;
      imageData.data[++i] = val;
      imageData.data[++i] = 255;
    }
  }
};

const populateConstImageDataFromNavMsg = (
  imageData,
  width,
  height,
  dataSource,
) => {
  for (let row = 0; row < height; row++) {
    for (let col = 0; col < width; col++) {
      const mapI = col + (height - row - 1) * width;
      const data = dataSource[mapI];
      const val = new DataView(Uint8Array.from([data]).buffer).getUint8(0);

      let i = (col + row * width) * 4;

      if (val === 0) {
        imageData.data[i] = 0;
        imageData.data[++i] = 0;
        imageData.data[++i] = 0;
        imageData.data[++i] = 0; // alpha
      } else if (val >= 1 && val <= 98) {
        // Blue to red spectrum for most normal cost values
        const v = (255 * val) / 100;
        imageData.data[i] = v; // red
        imageData.data[++i] = 0; // green
        imageData.data[++i] = 255 - v; // blue
        imageData.data[++i] = 255; // alpha
      } else if (val === 99) {
        // inscribed obstacle values (99) in cyan
        imageData.data[i] = 0; // red
        imageData.data[++i] = 255; // green
        imageData.data[++i] = 255; // blue
        imageData.data[++i] = 255; // alpha
      } else if (val === 100) {
        // lethal obstacle values (100) in purple
        imageData.data[i] = 255; // red
        imageData.data[++i] = 0; // green
        imageData.data[++i] = 255; // blue
        imageData.data[++i] = 255; // alpha
      } else if (val > 100 && val <= 127) {
        // illegal positive values in green
        imageData.data[i] = 0; // red
        imageData.data[++i] = 255; // green
        imageData.data[++i] = 0; // blue
        imageData.data[++i] = 255; // alpha
      } else if (val >= 128 && val <= 254) {
        // illegal negative (char) values in shades of red/yellow
        imageData.data[i] = 255; // red
        imageData.data[++i] = (255 * (val - 128)) / (254 - 128); // green
        imageData.data[++i] = 0; // blue
        imageData.data[++i] = 255; // alpha
      } else {
        // legal -1 value is tasteful blueish greenish grayish color
        imageData.data[i] = 0x70; // red
        imageData.data[++i] = 0x89; // green
        imageData.data[++i] = 0x86; // blue
        imageData.data[++i] = 255; // alpha
      }
    }
  }
};

const imageDataToCanvas = imageData => {
  const canvas = document.createElement('canvas');
  canvas.width = imageData.width;
  canvas.height = imageData.height;
  const context = canvas.getContext('2d');
  context.putImageData(imageData, 0, 0);
  return canvas;
};

class Plane extends Mesh {
  constructor() {
    super();
    this.geometry = new PlaneGeometry();
    this.material = new MeshBasicMaterial();
  }
}

class Map extends Core {
  constructor(ros, topicName, options = DEFAULT_OPTIONS_MAP) {
    super(ros, topicName, MESSAGE_TYPE_OCCUPANCYGRID, options);
    this.object = new Plane();
    this.object.material.transparent = true;
    this.updateOptions({
      ...DEFAULT_OPTIONS_MAP,
      ...options,
    });
  }

  onMessage(callback) {
    this.callback = callback;
  }

  updateOptions(options) {
    super.updateOptions(options);
    const { alpha, drawBehind } = this.options;

    this.object.material.opacity = alpha;

    if (drawBehind) {
      this.object.material.side = DoubleSide;
    } else {
      this.object.material.side = FrontSide;
    }
    this.object.material.needsUpdate = true;
    if (this.prevMessage) {
      this.setCanvasData(this.prevMessage);
    }
  }

  updateCanvasDimensions(message) {
    const {
      info: { height, width, resolution, origin },
    } = message;

    this.object.scale.set(width * resolution, -1 * height * resolution, 1);
    const translatedX = (width * resolution) / 2 + origin.position.x;
    const translatedY = (height * resolution) / 2 + origin.position.y;
    this.object.position.set(translatedX, translatedY, 0);
  }

  setCanvasData(message) {
    const { colorScheme } = this.options;
    const {
      data,
      info: { height, width },
    } = message;

    const imageData = new ImageData(width, height);
    let bitmapCanvas = null;

    switch (colorScheme) {
      case MAP_COLOR_SCHEMES.MAP:
        populateImageDataFromNavMsg(imageData, width, height, data);
        bitmapCanvas = imageDataToCanvas(imageData);
        break;
      case MAP_COLOR_SCHEMES.CONST_MAP:
        populateConstImageDataFromNavMsg(imageData, width, height, data);
        bitmapCanvas = imageDataToCanvas(imageData);
        break;
      case MAP_COLOR_SCHEMES.RAW:
        populateRawImageDataFromNavMsg(imageData, width, height, data);
        bitmapCanvas = imageDataToCanvas(imageData);
        break;
      default:
        break;
    }

    this.object.material.map = new CanvasTexture(bitmapCanvas);
    this.object.material.map.minFilter = NearestFilter;
    this.object.material.map.magFilter = NearestFilter;
    this.object.material.needsUpdate = true;

    this.updateCanvasDimensions(message);
  }

  update(message) {
    super.update(message);
    if (this.callback) {
      this.callback(message);
    }

    this.setCanvasData(message);
    this.prevMessage = message;
  }
}

class Odometry extends Core {
  constructor(ros, topicName, options = DEFAULT_OPTIONS_ODOMETRY) {
    super(ros, topicName, MESSAGE_TYPE_ODOMETRY);

    this.object = null;
    this.objectPool = [];
    this.keepSize = 100;
    this.currentObject = -1;
    this.setVizType(options.controlledObject);
    this.updateOptions({
      ...DEFAULT_OPTIONS_ODOMETRY,
      ...options,
    });
  }

  setVizType(controlledObject) {
    if (controlledObject) {
      this.object = controlledObject;
    } else {
      this.object = new Group();
    }
  }

  setKeepSize(size) {
    let newKeepList = [];

    if (size === 0) {
      this.keepSize = 0;
      return;
    }

    if (size < this.keepSize && size < this.objectPool.length) {
      const removeCount = this.objectPool.length - size;
      for (let i = 0; i < removeCount; i++) {
        this.object.remove(this.objectPool[i]);
      }

      const slicedList = this.objectPool.slice(
        this.objectPool.length - size,
        this.objectPool.length,
      );
      newKeepList = [...slicedList];
    } else {
      newKeepList = [...this.objectPool];
    }

    this.objectPool = newKeepList;
    this.keepSize = size;
    this.currentObject = this.objectPool.length - 1;
  }

  removeAllObjects() {
    this.objectPool.forEach((obj, index) => {
      obj.parent.remove(obj);
      delete this.objectPool[index];
    });
    this.objectPool = [];
  }

  checkToleranceThresholdExceed(newPose) {
    if (this.objectPool.length === 0) {
      return true;
    }

    const oldPose = {
      position: this.objectPool[this.currentObject].position,
      quaternion: this.objectPool[this.currentObject].quaternion,
    };

    return checkToleranceThresholdExceed(oldPose, newPose, this.options);
  }

  getObject() {
    const { type } = this.options;
    switch (type) {
      case ODOMETRY_OBJECT_TYPES.arrow:
        return new Arrow();
      case ODOMETRY_OBJECT_TYPES.axes:
        return new Axes();
    }

    return new Object3D();
  }

  changeObjectPoolType() {
    const tempObjectPool = [];

    // remove prev type objects and push the new ones in place of them.
    this.objectPool.forEach((object, index) => {
      const { position, quaternion } = object;
      object.parent.remove(object);
      delete this.objectPool[index];

      const newObj = this.getObject();
      newObj.position.set(position.x, position.y, position.z);
      newObj.quaternion.set(
        quaternion.x,
        quaternion.y,
        quaternion.z,
        quaternion.w,
      );
      tempObjectPool.push(newObj);
      this.object.add(newObj);
      setObjectDimension(newObj, this.options);
    });

    this.objectPool = tempObjectPool;
  }

  updateOptions(options) {
    const { type: currentType } = this.options;
    super.updateOptions(options);
    const { keep, type } = this.options;

    if (type !== currentType) {
      this.changeObjectPoolType();
    }

    this.objectPool.forEach(object => {
      setObjectDimension(object, this.options);
    });

    this.setKeepSize(keep);
  }

  update(message) {
    super.update(message);
    if (!this.keepSize) {
      this.removeAllObjects();
      return;
    }

    const {
      pose: {
        pose: { position, orientation },
      },
    } = message;
    const transform = {
      translation: position,
      rotation: orientation,
    };

    const newPose = {
      position: new Vector3(position.x, position.y, position.z),
      quaternion: new Quaternion(
        orientation.x,
        orientation.y,
        orientation.z,
        orientation.w,
      ),
    };
    const toleranceThresholdExceed = this.checkToleranceThresholdExceed(
      newPose,
    );

    if (toleranceThresholdExceed) {
      const newObject = this.getObject();
      setObjectDimension(newObject, this.options);

      this.objectPool.push(newObject);
      this.currentObject += 1;
      this.currentObject = Math$1.clamp(
        this.currentObject,
        0,
        this.keepSize - 1,
      );
      this.object.add(newObject);
      setTransform(newObject, transform);

      // remove excess object from object pool wrt to keepsize
      if (this.objectPool.length > this.keepSize) {
        const objToRemove = this.objectPool[0];
        this.object.remove(objToRemove);
        delete this.objectPool[0];

        const newObjectPool = this.objectPool.slice(1);
        this.objectPool = [...newObjectPool];
      }
    }
  }
}

class PoseArray extends Core {
  constructor(ros, topicName, options = DEFAULT_OPTIONS_POSEARRAY) {
    super(ros, topicName, MESSAGE_TYPE_POSEARRAY, options);
    this.object = new Group$1();
    this.updateOptions({
      ...DEFAULT_OPTIONS_POSEARRAY,
      ...options,
    });
  }

  update(message) {
    super.update(message);
    this.object.children.forEach(obj => {
      obj.parent.remove(obj);
    });
    this.object.children = [];

    for (let i = 0; i < message.poses.length; i++) {
      this.object.add(Pose.getNewPrimitive(this.options));
    }

    for (let i = 0; i < message.poses.length; i++) {
      setTransform(this.object.children[i], {
        translation: message.poses[i].position,
        rotation: message.poses[i].orientation,
      });
      setObjectDimension(this.object.children[i], this.options);
    }
  }
}

class Path extends Core {
  constructor(ros, topicName, options = DEFAULT_OPTIONS_PATH) {
    super(ros, topicName, MESSAGE_TYPE_PATH, options);
    this.object = new Group();
    this.line = new Line(null, true);
    this.updateOptions({
      ...DEFAULT_OPTIONS_PATH,
      ...options,
    });
  }

  updateOptions(options) {
    super.updateOptions(options);
    const { alpha, color } = this.options;
    this.line.setColor(new Color(color));
    this.line.setAlpha(alpha);
  }

  update(message) {
    super.update(message);
    const { poses } = message;
    const points = (poses || []).map(poseData => poseData.pose.position);

    this.line.updatePoints(points);
    this.object.add(this.line);
  }
}

class Image extends Core {
  constructor(ros, topicName, options = DEFAULT_OPTIONS_IMAGE) {
    super(ros, topicName, MESSAGE_TYPE_IMAGE, options);
    this.object = document.createElement('canvas');
    this.updateOptions({
      ...DEFAULT_OPTIONS_IMAGE,
      ...options,
    });
  }

  applyImageData(message) {
    const {
      data,
      encoding,
      height,
      is_bigendian: isBigEndian,
      step,
      width,
    } = message;

    const ctx = this.object.getContext('2d');
    const imgData = ctx.createImageData(width, height);

    const decodedData = atob(data);
    const newData = [];
    decodedData.split('').forEach((_, index) => {
      newData.push(decodedData.charCodeAt(index));
    });

    const encodeToUInt8 = Uint8Array.from(newData);
    const encodedDataView = new DataView(encodeToUInt8.buffer);

    switch (encoding) {
      case 'mono8': {
        let j = 0;
        for (let i = 0; i < step * height; i++) {
          imgData.data[j++] = encodedDataView.getUint8(i, !isBigEndian);
          imgData.data[j++] = encodedDataView.getUint8(i, !isBigEndian);
          imgData.data[j++] = encodedDataView.getUint8(i, !isBigEndian);
          imgData.data[j++] = 255;
        }
        break;
      }
      case 'bgr8': {
        const offset = 3;

        let j = 0;
        for (let i = 0; i < step * height; i += offset) {
          imgData.data[j++] = encodedDataView.getUint8(i + 2, !isBigEndian);
          imgData.data[j++] = encodedDataView.getUint8(i + 0, !isBigEndian);
          imgData.data[j++] = encodedDataView.getUint8(i + 1, !isBigEndian);
          imgData.data[j++] = 255;
        }
        break;
      }
      case 'rgb8': {
        const offset = 3;

        let j = 0;
        for (let i = 0; i < step * height; i += offset) {
          imgData.data[j++] = encodedDataView.getUint8(i + 0, !isBigEndian);
          imgData.data[j++] = encodedDataView.getUint8(i + 1, !isBigEndian);
          imgData.data[j++] = encodedDataView.getUint8(i + 2, !isBigEndian);
          imgData.data[j++] = 255;
        }
        break;
      }
      default:
        break;
    }

    ctx.putImageData(imgData, 0, 0);
  }

  update(message) {
    const { height, width } = message;

    this.object.width = width;
    this.object.height = height;

    this.applyImageData(message);
  }
}

class Marker extends Core {
  constructor(ros, topicName, options = DEFAULT_OPTIONS_MARKER) {
    super(ros, topicName, MESSAGE_TYPE_MARKER, options);

    this.object = new Group();
    this.onChange = this.onChange.bind(this);

    const { queueSize } = options;
    this.markerManager = new MarkerManager(this.object, this.onChange);
    this.queueSize = queueSize;
    this.updateOptions({
      ...DEFAULT_OPTIONS_MARKER,
      ...options,
    });
  }

  updateOptions(options) {
    super.updateOptions(options);
    this.markerManager.updateOptions(this.options, this);
  }

  update(message) {
    super.update(message);
    this.markerManager.updateMarker(message);
  }

  onChange() {
    if (this.callback) {
      this.callback();
    }
  }

  onNamespaceChange(callback) {
    this.callback = callback;
  }

  reset() {
    this.markerManager.reset();
  }
}

class Scene extends Scene$1 {
  constructor(options = {}) {
    super();
    this.vizWrapper = new Group$1();
    this.add(this.vizWrapper);

    this.stats = new Stats();
    this.stats.showPanel(0);

    this.initLights();
    this.initGrid();
    this.updateOptions(options);
  }

  initLights() {
    [[-1, 0], [1, 0], [0, -1], [0, 1]].forEach(positions => {
      const directionalLight = new DirectionalLight(0xffffff, 0.4);
      [directionalLight.position.x, directionalLight.position.z] = positions;
      directionalLight.position.y = 1;
      this.add(directionalLight);
    });
    const ambientLight = new AmbientLight(0xffffff, 0.2);
    this.add(ambientLight);
  }

  initGrid() {
    this.grid = new GridHelper(0, 0);
    this.add(this.grid);
  }

  addObject(object) {
    this.vizWrapper.add(object);
  }

  addVisualization({ object }) {
    if (!this.vizWrapper.getObjectById(object.id)) {
      this.addObject(object);
    }
  }

  getObjectByName(name) {
    return this.vizWrapper.getObjectByName(name);
  }

  updateOptions(options) {
    this.options = {
      ...DEFAULT_OPTIONS_SCENE,
      ...options,
    };

    const {
      backgroundColor,
      gridCenterlineColor,
      gridColor,
      gridDivisions,
      gridSize,
    } = this.options;

    this.grid.copy(
      new GridHelper(
        gridSize,
        gridDivisions,
        gridCenterlineColor,
        gridColor,
      ),
    );

    this.background = new Color(backgroundColor);
  }
}

/** *
Edited from THREE.EditorControls
Change in this.zoom to adjust camera zoom rather than position
Change in this.pan to consider camera zoom rather than position
Change in this.rotate to disable spherical.phi
Change to this.panSpeed and this.zoomSpeed
** */

const MapControls2D = function(object, domElement) {
  domElement = domElement !== undefined ? domElement : document;

  // API

  this.enabled = true;
  this.center = new Vector3();
  this.panSpeed = 0.01;
  this.zoomSpeed = 0.05;
  this.rotationSpeed = 0.005;

  // internals

  const scope = this;
  const vector = new Vector3();
  const delta = new Vector3();
  const box = new Box3();

  const STATE = { NONE: -1, ROTATE: 0, ZOOM: 1, PAN: 2 };
  let state = STATE.NONE;

  const { center } = this;
  const normalMatrix = new Matrix3();
  const pointer = new Vector2();
  const pointerOld = new Vector2();
  const spherical = new Spherical();
  const sphere = new Sphere$1();

  // events

  const changeEvent = { type: 'change' };

  this.focus = function(target) {
    let distance;

    box.setFromObject(target);

    if (box.isEmpty() === false) {
      box.getCenter(center);
      distance = box.getBoundingSphere(sphere).radius;
    } else {
      // Focusing on an Group, AmbientLight, etc

      center.setFromMatrixPosition(target.matrixWorld);
      distance = 0.1;
    }

    delta.set(0, 0, 1);
    delta.applyQuaternion(object.quaternion);
    delta.multiplyScalar(distance * 4);

    object.position.copy(center).add(delta);

    scope.dispatchEvent(changeEvent);
  };

  this.pan = function(positionDelta) {
    // var distance = object.position.distanceTo( center );

    const { zoom } = object;

    positionDelta.multiplyScalar(scope.panSpeed / zoom);
    positionDelta.applyMatrix3(normalMatrix.getNormalMatrix(object.matrix));

    object.position.add(positionDelta);
    center.add(positionDelta);

    scope.dispatchEvent(changeEvent);
  };

  this.zoom = function(zoomDelta) {
    object.zoom -= (zoomDelta.z || 0) * object.zoom * 0.1;
    object.updateProjectionMatrix();

    scope.dispatchEvent(changeEvent);
  };

  this.rotate = function(rotationDelta) {
    vector.copy(object.position).sub(center);

    spherical.setFromVector3(vector);

    spherical.theta += rotationDelta.x * scope.rotationSpeed;
    // spherical.phi += rotationDelta.y * scope.rotationSpeed;

    spherical.makeSafe();

    vector.setFromSpherical(spherical);

    object.position.copy(center).add(vector);

    object.lookAt(center);

    scope.dispatchEvent(changeEvent);
  };

  // mouse

  function onMouseMove(event) {
    if (scope.enabled === false) return;

    pointer.set(event.clientX, event.clientY);

    const movementX = pointer.x - pointerOld.x;
    const movementY = pointer.y - pointerOld.y;

    if (state === STATE.ROTATE) {
      scope.rotate(delta.set(-movementX, -movementY, 0));
    } else if (state === STATE.ZOOM) {
      scope.zoom(delta.set(0, 0, movementY));
    } else if (state === STATE.PAN) {
      scope.pan(delta.set(-movementX, movementY, 0));
    }

    pointerOld.set(event.clientX, event.clientY);
  }

  function onMouseUp() {
    domElement.removeEventListener('mousemove', onMouseMove, false);
    domElement.removeEventListener('mouseup', onMouseUp, false);
    domElement.removeEventListener('mouseout', onMouseUp, false);
    domElement.removeEventListener('dblclick', onMouseUp, false);

    state = STATE.NONE;
  }

  function onMouseWheel(event) {
    event.preventDefault();

    // Normalize deltaY due to https://bugzilla.mozilla.org/show_bug.cgi?id=1392460
    scope.zoom(delta.set(0, 0, event.deltaY > 0 ? 1 : -1));
  }

  function onMouseDown(event) {
    if (scope.enabled === false) return;

    if (event.button === 0) {
      state = STATE.ROTATE;
    } else if (event.button === 1) {
      state = STATE.ZOOM;
    } else if (event.button === 2) {
      state = STATE.PAN;
    }

    pointerOld.set(event.clientX, event.clientY);

    domElement.addEventListener('mousemove', onMouseMove, false);
    domElement.addEventListener('mouseup', onMouseUp, false);
    domElement.addEventListener('mouseout', onMouseUp, false);
    domElement.addEventListener('dblclick', onMouseUp, false);
  }

  function contextmenu(event) {
    event.preventDefault();
  }

  domElement.addEventListener('contextmenu', contextmenu, false);
  domElement.addEventListener('mousedown', onMouseDown, false);
  domElement.addEventListener('wheel', onMouseWheel, false);

  // touch

  const touches = [new Vector3(), new Vector3(), new Vector3()];
  const prevTouches = [new Vector3(), new Vector3(), new Vector3()];

  let prevDistance = null;

  function touchStart(event) {
    if (scope.enabled === false) return;

    switch (event.touches.length) {
      case 1:
        touches[0]
          .set(event.touches[0].pageX, event.touches[0].pageY, 0)
          .divideScalar(window.devicePixelRatio);
        touches[1]
          .set(event.touches[0].pageX, event.touches[0].pageY, 0)
          .divideScalar(window.devicePixelRatio);
        break;

      case 2:
        touches[0]
          .set(event.touches[0].pageX, event.touches[0].pageY, 0)
          .divideScalar(window.devicePixelRatio);
        touches[1]
          .set(event.touches[1].pageX, event.touches[1].pageY, 0)
          .divideScalar(window.devicePixelRatio);
        prevDistance = touches[0].distanceTo(touches[1]);
        break;
    }

    prevTouches[0].copy(touches[0]);
    prevTouches[1].copy(touches[1]);
  }

  function touchMove(event) {
    if (scope.enabled === false) return;

    event.preventDefault();
    event.stopPropagation();

    function getClosest(touch, allTouches) {
      let closest = allTouches[0];

      for (const i in allTouches) {
        if (closest.distanceTo(touch) > allTouches[i].distanceTo(touch))
          closest = allTouches[i];
      }

      return closest;
    }

    switch (event.touches.length) {
      case 1:
        touches[0]
          .set(event.touches[0].pageX, event.touches[0].pageY, 0)
          .divideScalar(window.devicePixelRatio);
        touches[1]
          .set(event.touches[0].pageX, event.touches[0].pageY, 0)
          .divideScalar(window.devicePixelRatio);
        scope.rotate(
          touches[0]
            .sub(getClosest(touches[0], prevTouches))
            .multiplyScalar(-1),
        );
        break;

      case 2:
        touches[0]
          .set(event.touches[0].pageX, event.touches[0].pageY, 0)
          .divideScalar(window.devicePixelRatio);
        touches[1]
          .set(event.touches[1].pageX, event.touches[1].pageY, 0)
          .divideScalar(window.devicePixelRatio);
        const distance = touches[0].distanceTo(touches[1]);
        scope.zoom(delta.set(0, 0, prevDistance - distance));
        prevDistance = distance;

        const offset0 = touches[0]
          .clone()
          .sub(getClosest(touches[0], prevTouches));
        const offset1 = touches[1]
          .clone()
          .sub(getClosest(touches[1], prevTouches));
        offset0.x = -offset0.x;
        offset1.x = -offset1.x;

        scope.pan(offset0.add(offset1));

        break;
    }

    prevTouches[0].copy(touches[0]);
    prevTouches[1].copy(touches[1]);
  }

  domElement.addEventListener('touchstart', touchStart, false);
  domElement.addEventListener('touchmove', touchMove, false);

  this.dispose = function() {
    domElement.removeEventListener('contextmenu', contextmenu, false);
    domElement.removeEventListener('mousedown', onMouseDown, false);
    domElement.removeEventListener('wheel', onMouseWheel, false);

    domElement.removeEventListener('mousemove', onMouseMove, false);
    domElement.removeEventListener('mouseup', onMouseUp, false);
    domElement.removeEventListener('mouseout', onMouseUp, false);
    domElement.removeEventListener('dblclick', onMouseUp, false);

    domElement.removeEventListener('touchstart', touchStart, false);
    domElement.removeEventListener('touchmove', touchMove, false);
  };
};

MapControls2D.prototype = Object.create(EventDispatcher.prototype);
MapControls2D.prototype.constructor = MapControls2D;

class Viewer2d {
  constructor(scene, options = {}) {
    this.options = {
      ...DEFAULT_OPTIONS_SCENE,
      ...options,
    };
    this.scene = scene || new Scene();
    this.previousWidth = 0;
    this.previousHeight = 0;

    this.initCamera();
    this.animate = this.animate.bind(this);
    this.onWindowResize = this.onWindowResize.bind(this);
  }

  animate() {
    this.scene.stats.begin();
    this.scene.updateMatrixWorld();

    this.renderer.render(this.scene, this.camera);
    this.scene.stats.end();
    requestAnimationFrame(this.animate);
  }

  initCamera() {
    this.camera = new OrthographicCamera(-100, 100, 100, -100, 0.1, 1000);
    this.camera.zoom = 0.5;
    this.camera.position.set(0, 10, 0);
    this.camera.lookAt(new Vector3());

    this.scene.add(this.camera);
  }

  setContainer(domNode) {
    this.container = domNode;
    this.initRenderer(domNode);
    this.controls = new MapControls2D(this.camera, this.container);
    this.controls.enableDamping = true;
    window.addEventListener('resize', this.onWindowResize);
    requestAnimationFrame(this.animate);
    this.onWindowResize();
  }

  initRenderer() {
    const renderer = new WebGLRenderer({ antialias: true });
    renderer.autoClear = false;
    renderer.autoUpdateScene = false;
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setSize(this.container.offsetWidth, this.container.offsetHeight);
    this.renderer = renderer;
    this.container.appendChild(renderer.domElement);
  }

  updateOptions(options) {
    this.options = {
      ...this.options,
      ...options,
    };
    this.scene.updateOptions(this.options);
  }

  destroy() {
    window.removeEventListener('resize', this.onWindowResize);
  }

  onWindowResize() {
    const { camera } = this;
    const { offsetHeight, offsetWidth } = this.container;
    if (
      Math.abs(offsetWidth - this.previousWidth) > 10 ||
      Math.abs(offsetHeight - this.previousHeight) > 10
    ) {
      const [cameraWidth, cameraHeight] = [
        offsetWidth / 100,
        offsetHeight / 100,
      ];
      camera.left = -cameraWidth / 2;
      camera.right = cameraWidth / 2;
      camera.top = cameraHeight / 2;
      camera.bottom = -cameraHeight / 2;
      camera.updateProjectionMatrix();
      this.renderer.setSize(offsetWidth, offsetHeight);
      this.previousWidth = offsetWidth;
      this.previousHeight = offsetHeight;
    }
  }

  addVisualization(vizObject) {
    this.scene.addVisualization(vizObject);
  }
}

const ResizeObserver = window.ResizeObserver || ResizeObserver$1;

class Viewer3d {
  constructor(scene, options = {}) {
    this.options = {
      ...DEFAULT_OPTIONS_SCENE,
      ...options,
    };
    this.scene = scene || new Scene(this.options);
    this.previousWidth = 0;
    this.previousHeight = 0;

    this.ro = new ResizeObserver(entries => {
      if (entries.length > 0) {
        this.onWindowResize();
      }
    });

    this.initCamera();
    this.animate = this.animate.bind(this);
    this.onWindowResize = this.onWindowResize.bind(this);
  }

  animate() {
    this.scene.stats.begin();
    this.scene.updateMatrixWorld();

    this.renderer.render(this.scene, this.camera);
    this.scene.stats.end();
    requestAnimationFrame(this.animate);
  }

  initCamera() {
    this.camera = new PerspectiveCamera(50, 1, 0.01, 1000);
    this.camera.position.set(0, 5, 10);
    this.camera.lookAt(new Vector3());

    this.scene.add(this.camera);
  }

  setContainer(domNode) {
    this.container = domNode;
    this.initRenderer(domNode);
    this.controls = new EditorControls(this.camera, this.container);
    this.controls.enableDamping = true;
    this.ro.observe(this.container);
    requestAnimationFrame(this.animate);
    this.onWindowResize();
  }

  initRenderer() {
    const renderer = new WebGLRenderer({ antialias: true });
    renderer.autoClear = false;
    renderer.autoUpdateScene = false;
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setSize(this.container.offsetWidth, this.container.offsetHeight);
    this.renderer = renderer;
    this.container.appendChild(renderer.domElement);
  }

  updateOptions(options) {
    this.options = {
      ...this.options,
      ...options,
    };
    this.scene.updateOptions(this.options);
  }

  destroy() {
    // this.container.removeEventListener('resize', this.onWindowResize);
  }

  onWindowResize() {
    const { camera } = this;
    const { offsetHeight, offsetWidth } = this.container;
    if (
      Math.abs(offsetWidth - this.previousWidth) > 10 ||
      Math.abs(offsetHeight - this.previousHeight) > 10
    ) {
      camera.aspect = offsetWidth / offsetHeight;
      camera.updateProjectionMatrix();
      this.renderer.setSize(offsetWidth, offsetHeight);
      this.previousWidth = offsetWidth;
      this.previousHeight = offsetHeight;
    }
  }

  addVisualization(vizObject) {
    this.scene.addVisualization(vizObject);
  }
}

class TfViewer extends Viewer3d {
  constructor(rosInstance, options) {
    super(null, options);
    const { onFramesListUpdate } = this.options;
    this.ros = rosInstance;
    this.framesList = [];
    this.selectedFrame = '';
    this.onFramesListUpdate = onFramesListUpdate || (() => {});

    this.initRosEvents();
    this.getTFMessages = this.getTFMessages.bind(this);
    this.setFrameTransform = this.setFrameTransform.bind(this);
    this.addRobot = this.addRobot.bind(this);
  }

  initRosEvents() {
    this.ros.on('connection', () => {
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
    });
  }

  getTFMessages({ transforms }) {
    transforms.forEach(
      ({
        header: { frame_id: parentFrameId },
        child_frame_id: childFrameId,
        transform: {
          translation: { x, y, z },
          rotation: { x: rx, y: ry, z: rz, w: rw },
        },
      }) => {
        const [childObject, parentObject] = [
          this.getObjectOrCreate(childFrameId),
          this.getObjectOrCreate(parentFrameId),
        ];

        parentObject.add(childObject);
        childObject.position.set(x, y, z);
        childObject.quaternion.set(rx, ry, rz, rw);

        [parentFrameId, childFrameId].forEach(frame => {
          if (this.framesList.indexOf(frame) === -1) {
            this.framesList.push(frame);
          }
        });
      },
    );
    this.setFrameTransform();
  }

  getObjectOrCreate(frameId) {
    if (this.framesList.indexOf(frameId) === -1) {
      this.framesList.push(frameId);
      this.onFramesListUpdate(this.framesList);
    }
    const existingFrame = this.scene.getObjectByName(frameId);
    if (existingFrame) {
      return existingFrame;
    }

    const newFrame = new Group$1();
    newFrame.name = frameId;
    this.scene.addObject(newFrame);
    return newFrame;
  }

  updateSelectedFrame(selectedFrame) {
    this.selectedFrame = selectedFrame;
    this.setFrameTransform();
  }

  setFrameTransform() {
    const {
      scene: { vizWrapper },
      selectedFrame,
    } = this;
    if (!selectedFrame) {
      return;
    }
    const currentFrameObject = vizWrapper.getObjectByName(selectedFrame);

    if (currentFrameObject) {
      const tempObject = new Object3D();
      tempObject.position.copy(vizWrapper.position);
      tempObject.rotation.copy(vizWrapper.rotation);

      const objectWorldPosition = currentFrameObject.getWorldPosition(
        new Vector3(),
      );
      const objectWorldQuaternion = currentFrameObject.getWorldQuaternion(
        new Quaternion(),
      );
      const wrapperWorldPosition = tempObject.getWorldPosition(
        new Vector3(),
      );
      const wrapperWorldQuaternion = tempObject.getWorldQuaternion(
        new Quaternion(),
      );

      const relPosition = wrapperWorldPosition.sub(objectWorldPosition);
      tempObject.position.set(relPosition.x, relPosition.z, -relPosition.y);
      tempObject.rotation.setFromQuaternion(
        wrapperWorldQuaternion.premultiply(objectWorldQuaternion.conjugate()),
      );
      tempObject.updateMatrixWorld();
      tempObject.setRotationFromMatrix(
        new Matrix4()
          .makeRotationAxis(new Vector3(1, 0, 0), -Math.PI / 2)
          .multiply(tempObject.matrix),
      );

      vizWrapper.rotation.copy(tempObject.rotation);
      vizWrapper.position.copy(relPosition);
    }
  }

  addVisualization(vizObject) {
    super.addVisualization(vizObject);

    vizObject.onHeaderChange = newFrameId => {
      const frameObject = this.getObjectOrCreate(newFrameId);
      frameObject.add(vizObject.object);
    };
  }

  addRobot(robotModel) {
    robotModel.load(object => {
      RobotModel.onComplete(object);
      super.addVisualization(robotModel);
      // eslint-disable-next-line guard-for-in
      for (const linkName in object.children[0].links) {
        const o = object.children[0].links[linkName];
        const existingObject = this.scene.getObjectByName(o.name);
        if (existingObject) {
          o.children.forEach(child => {
            existingObject.add(child);
          });
        }
      }
    });
  }

  setFixedFrame() {}
}

var index = {
  PointCloud,
  Polygon,
  Pose,
  PoseArray,
  Tf,
  RobotModel,
  MarkerArray,
  LaserScan,
  Map,
  Odometry,
  Path,
  Image,
  Marker,

  Scene,

  Viewer2d,
  Viewer3d,
  TfViewer,
};

export default index;
