declare namespace RosMessage {
  interface Header {
    seq: number;
    stamp: {
      sec: number;
      nsec: number;
    };
    frame_id: string;
  }
  interface Base {
    header?: Header;
  }
  interface Duration {
    sec: number;
    nsec: number;
  }
  interface Vector3 {
    x: number;
    y: number;
    z: number;
  }
  interface Accel {
    linear: Vector3;
    angular: Vector3;
  }
  interface AccelStamped extends Base {
    header: Header;
    accel: Accel;
  }
  interface Point {
    x: number;
    y: number;
    z: number;
  }
  interface Quaternion {
    x: number;
    y: number;
    z: number;
    w: number;
  }
  interface PointStamped extends Base {
    header: Header;
    point: Point;
  }
  interface Polygon {
    points: Point[];
  }
  interface PolygonStamped extends Base {
    header: Header;
    polygon: Polygon;
  }
  interface Pose {
    position: Point;
    orientation: Quaternion;
  }
  interface PoseArray extends Base {
    header: Header;
    poses: Pose[];
  }
  interface PoseWithCovariance extends Base {
    pose: Pose;
    covariance: number[];
  }
  interface PoseStamped extends Base {
    header: Header;
    pose: Pose;
  }
  interface Twist {
    linear: Vector3;
    angular: Vector3;
  }
  interface TwistStamped extends Base {
    header: Header;
    twist: Twist;
  }
  interface Vector3Stamped extends Base {
    header: Header;
    vector: Vector3;
  }
  interface Wrench {
    force: Vector3;
    torque: Vector3;
  }
  interface WrenchStamped extends Base {
    header: Header;
    wrench: Wrench;
  }
  enum SolidPrimitiveShape {
    BOX_X = 0,
    SPHERE_RADIUS = 0,
    CYLINDER_HEIGHT = 0,
    CONE_HEIGHT = 0,
    BOX = 1,
    BOX_Y = 1,
    CYLINDER_RADIUS = 1,
    CONE_RADIUS = 1,
    SPHERE = 2,
    BOX_Z = 2,
    CYLINDER = 3,
    CONE = 4,
  }
  interface SolidPrimitive {
    type: SolidPrimitiveShape;
    dimensions: number[];
  }
  interface MeshTriangle {
    vertex_indices: [number, number, number];
  }
  interface Mesh {
    triangles: MeshTriangle[];
    vertices: Point[];
  }
  interface BoundingVolume extends Base {
    primitives: SolidPrimitive[];
    primitive_poses: Pose[];
    meshes: Mesh[];
    mesh_poses: Pose[];
  }
  enum CollisionObjectOperation {
    ADD,
    REMOVE,
    APPEND,
    MOVE,
  }
  interface ObjectType {
    key: string;
    db: string;
  }
  interface Plane {
    coef: [number, number, number, number];
  }
  interface CollisionObject extends Base {
    header: Header;
    id: string;
    type: ObjectType;
    primitives: SolidPrimitive[];
    primitive_poses: Pose[];
    meshes: Mesh[];
    mesh_poses: Pose[];
    planes: Plane[];
    plane_poses: Pose[];
    subframe_names: string[];
    subframe_poses: Pose[];
    operation: CollisionObjectOperation;
  }
  interface JointState extends Base {
    name: string[];
    position: number[];
    velocity: number[];
    effort: number[];
  }
  interface Transform {
    translation: Vector3;
    rotation: Quaternion;
  }
  interface MultiDOFJointState {
    header: Header;
    joint_names: string[];
    transforms: Transform[];
    twist: Twist[];
    wrench: Wrench[];
  }
  interface JointTrajectoryPoint {
    positions: number[];
    velocities: number[];
    accelerations: number[];
    effort: number[];
    time_from_start: Duration;
  }
  interface JointTrajectory {
    header: Header;
    joint_names: string[];
    points: JointTrajectoryPoint[];
  }
  interface AttachedCollisionObject {
    link_name: string;
    object: CollisionObject;
    touch_links: string[];
    detach_posture: JointTrajectory;
    weight: number;
  }
  interface RobotState {
    joint_state: JointState;
    multi_dof_joint_state: MultiDOFJointState;
    attached_collision_objects: AttachedCollisionObject[];
    is_diff: boolean;
  }
  interface Color {
    r: number;
    g: number;
    b: number;
  }
  interface ColorRGBA {
    r: number;
    g: number;
    b: number;
    a: number;
  }
  interface ObjectColor {
    id: string;
    color: ColorRGBA;
  }
  interface DisplayRobotState extends Base {
    state: RobotState;
    highlight_links: ObjectColor[];
  }
  interface MultiDOFJointTrajectoryPoint {
    transforms: Transform[];
    velocities: Twist[];
    accelerations: Twist[];
    time_from_start: number;
  }
  interface MultiDOFJointTrajectory {
    header: Header;
    joint_names: string[];
    points: MultiDOFJointTrajectoryPoint[];
  }
  interface RobotTrajectory {
    joint_trajectory: JointTrajectory;
    multi_dof_joint_trajectory: MultiDOFJointTrajectory;
  }
  interface DisplayTrajectory extends Base {
    model_id: string;
    trajectory: RobotTrajectory[];
    trajectory_start: RobotState;
  }
  interface TransformStamped {
    header: Header;
    child_frame_id: string;
    transform: Transform;
  }
  interface AllowedCollisionEntry {
    enabled: boolean[];
  }
  interface AllowedCollisionMatrix {
    entry_names: string[];
    entry_values: AllowedCollisionEntry[];
    default_entry_names: string[];
    default_entry_values: boolean[];
  }
  interface LinkPadding {
    link_name: string;
    padding: number;
  }
  interface LinkScale {
    link_name: string;
    scale: number;
  }
  interface Octomap {
    header: Header;
    binary: boolean;
    id: string;
    resolution: number;
    data: number[];
  }
  interface OctomapWithPose {
    header: Header;
    origin: Pose;
    octomap: Octomap;
  }
  interface PlanningSceneWorld {
    collision_objects: CollisionObject[];
    octomap: Octomap;
  }
  interface PlanningScene extends Base {
    name: string;
    robot_state: RobotState;
    robot_model_name: string;
    fixed_frame_transforms: TransformStamped[];
    allowed_collision_matrix: AllowedCollisionMatrix;
    link_padding: LinkPadding[];
    link_scale: LinkScale[];
    object_colors: ObjectColor[];
    world: PlanningSceneWorld;
    is_diff: boolean;
  }
  interface MapMetaData {
    map_load_time: number;
    resolution: number;
    width: number;
    height: number;
    origin: Pose;
  }
  interface OccupancyGrid extends Base {
    header: Header;
    info: MapMetaData;
    data: number[];
  }
  interface TwistWithCovariance {
    twist: Twist;
    covariance: number[];
  }
  interface Odometry extends Base {
    header: Header;
    child_frame_id: string;
    pose: PoseWithCovariance;
    twist: TwistWithCovariance;
  }
  interface Path extends Base {
    header: Header;
    poses: PoseStamped[];
  }
  interface CompressedImage extends Base {
    header: Header;
    format: string;
    data: number[];
  }
  interface Image extends Base {
    header: Header;
    height: number;
    width: number;
    encoding: string;
    is_bigendian: number;
    step: number;
    data: number[];
  }
  interface LaserScan extends Base {
    header: Header;
    angle_min: number;
    angle_max: number;
    angle_increment: number;
    time_increment: number;
    scan_time: number;
    range_min: number;
    range_max: number;
    ranges: number[];
    intensities: number[];
  }
  interface MagneticField extends Base {
    header: Header;
    magnetic_field: Vector3;
    magnetic_field_covariance: number[];
  }
  interface Channel {
    name: string;
    values: number[];
  }
  interface PointCloud extends Base {
    header: Header;
    points: Point[];
    channels: Channel[];
  }
  enum PointFieldDataType {
    INT8 = 1,
    UINT8 = 2,
    INT16 = 3,
    UINT16 = 4,
    INT32 = 5,
    UINT32 = 6,
    FLOAT32 = 7,
    FLOAT64 = 8,
  }
  interface PointField {
    name: string;
    offset: number;
    datatype: PointFieldDataType;
    count: number;
  }
  interface PointCloud2 extends Base {
    header: Header;
    height: number;
    width: number;
    fields: PointField[];
    is_bigendian: boolean;
    point_step: number;
    row_step: number;
    data: number[];
    is_dense: boolean;
  }
  enum RadiationType {
    ULTRASOUND,
    INFRARED,
  }
  interface Range extends Base {
    header: Header;
    radiation_type: RadiationType;
    field_of_view: number;
    min_range: number;
    max_range: number;
    range: number;
  }
  interface TFMessage extends Base {
    transforms: TransformStamped[];
  }
  enum MarkerType {
    ARROW = 0,
    CUBE = 1,
    SPHERE = 2,
    CYLINDER = 3,
    LINE_STRIP = 4,
    LINE_LIST = 5,
    CUBE_LIST = 6,
    SPHERE_LIST = 7,
    POINTS = 8,
    TEXT_VIEW_FACING = 9,
    MESH_RESOURCE = 10,
    TRIANGLE_LIST = 11,
  }
  enum MarkerAction {
    ADD = 0,
    MODIFY = 0,
    DELETE = 2,
    DELETEALL = 3,
  }
  interface Marker extends Base {
    header: Header;
    ns: string;
    id: number;
    type: number;
    action: number;
    pose: Pose;
    scale: Vector3;
    color: ColorRGBA;
    lifetime: Duration;
    frame_locked: boolean;
    points: Point[];
    colors: ColorRGBA[];
    text: string;
    mesh_resource: string;
    mesh_use_embedded_materials: boolean;
  }
  interface MarkerArray extends Base {
    markers: Marker[];
  }
  enum CommandType {
    FEEDBACK,
    ROSRUN,
    ROSLAUNCH,
  }
  interface MenuEntry {
    id: number;
    parent_id: number;
    title: string;
    command: string;
    command_type: CommandType;
  }
  enum InteractiveMarkerOrientation {
    INHERIT,
    FIXED,
    VIEW_FACING,
  }
  enum InteractiveMarkerInteractionMode {
    NONE = 0,
    MENU = 1,
    BUTTON = 2,
    MOVE_AXIS = 3,
    MOVE_PLANE = 4,
    ROTATE_AXIS = 5,
    MOVE_ROTATE = 6,
    MOVE_3D = 7,
    ROTATE_3D = 8,
    MOVE_ROTATE_3D = 9,
  }
  interface InteractiveMarkerControl {
    name: string;
    orientation: Quaternion;
    orientation_mode: InteractiveMarkerOrientation;
    interaction_mode: InteractiveMarkerInteractionMode;
    always_visible: boolean;
    markers: Marker[];
    independent_marker_orientation: boolean;
    description: string;
  }
  interface InteractiveMarker {
    header: Header;
    pose: Pose;
    name: string;
    description: string;
    scale: number;
    menu_entries: MenuEntry[];
    controls: InteractiveMarkerControl[];
  }
  interface InteractiveMarkerInit extends Base {
    server_id: string;
    seq_num: number;
    markers: InteractiveMarker[];
  }
  interface InteractiveMarkerPose {
    header: Header;
    pose: Pose;
    name: string;
  }
  enum InteractiveMarkerUpdateType {
    KEEP_ALIVE,
    UPDATE,
  }
  interface InteractiveMarkerUpdate extends Base {
    server_id: string;
    seq_num: number;
    type: InteractiveMarkerUpdateType;
    markers: InteractiveMarker[];
    poses: InteractiveMarkerPose[];
    erases: string[];
  }
  enum InteractiveMarkerFeedbackEventType {
    KEEP_ALIVE = 0,
    POSE_UPDATE = 1,
    MENU_SELECT = 2,
    BUTTON_CLICK = 3,
    MOUSE_DOWN = 4,
    MOUSE_UP = 5,
  }
  interface InteractiveMarkerFeedback extends Base {
    header: Header;
    client_id: string;
    marker_name: string;
    control_name: string;
    event_type: InteractiveMarkerFeedbackEventType;
    pose: Pose;
    menu_entry_id: number;
    mouse_point: Point;
    mouse_point_valid: boolean;
  }
}
