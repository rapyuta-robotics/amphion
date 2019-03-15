export const MESSAGE_TYPE_ACCELSTAMPED =                     'geometry_msgs/AccelStamped';
export const MESSAGE_TYPE_POLYGONSTAMPED =                   'geometry_msgs/PolygonStamped';
export const MESSAGE_TYPE_POSEARRAY =                        'geometry_msgs/PoseArray';
export const MESSAGE_TYPE_POSESTAMPED =                      'geometry_msgs/PoseStamped';
export const MESSAGE_TYPE_TWISTSTAMPED =                     'geometry_msgs/TwistStamped';
export const MESSAGE_TYPE_VECTOR3STAMPED =                   'geometry_msgs/Vector3Stamped';
export const MESSAGE_TYPE_WRENCHSTAMPED =                    'geometry_msgs/WrenchStamped';
export const MESSAGE_TYPE_BOUNDINGVOLUME =                   'moveit_msgs/BoundingVolume';
export const MESSAGE_TYPE_DISPLAYJOINTSTATE =                'sensor_msgs/JointState';
export const MESSAGE_TYPE_DISPLAYROBOTSTATE =                'moveit_msgs/DisplayRobotState';
export const MESSAGE_TYPE_DISPLAYTF =                        'tf2_msgs/TFMessage';
export const MESSAGE_TYPE_DISPLAYTRAJECTORY =                'moveit_msgs/DisplayTrajectory';
export const MESSAGE_TYPE_PLANNINGSCENE =                    'moveit_msgs/PlanningScene';
export const MESSAGE_TYPE_OCCUPANCYGRID =                    'nav_msgs/OccupancyGrid';
export const MESSAGE_TYPE_ODOMETRY =                         'nav_msgs/Odometry';
export const MESSAGE_TYPE_PATH =                             'nav_msgs/Path';
export const MESSAGE_TYPE_COMPRESSEDIMAGE =                  'sensor_msgs/CompressedImage';
export const MESSAGE_TYPE_IMAGE =                            'sensor_msgs/Image';
export const MESSAGE_TYPE_LASERSCAN =                        'sensor_msgs/LaserScan';
export const MESSAGE_TYPE_MAGNETICFIELD =                    'sensor_msgs/MagneticField';
export const MESSAGE_TYPE_POINTCLOUD =                       'sensor_msgs/PointCloud';
export const MESSAGE_TYPE_POINTCLOUD2 =                      'sensor_msgs/PointCloud2';
export const MESSAGE_TYPE_RANGE =                            'sensor_msgs/Range';
export const MESSAGE_TYPE_MARKER =                           'visualization_msgs/Marker';
export const MESSAGE_TYPE_MARKERARRAY =                      'visualization_msgs/MarkerArray';

export const SUPPORTED_MESSAGE_TYPES = [
  MESSAGE_TYPE_DISPLAYJOINTSTATE,
  MESSAGE_TYPE_DISPLAYROBOTSTATE,
  MESSAGE_TYPE_DISPLAYTF,
  MESSAGE_TYPE_OCCUPANCYGRID,
  MESSAGE_TYPE_MARKER,
  MESSAGE_TYPE_MARKERARRAY,
  MESSAGE_TYPE_POSESTAMPED,
  MESSAGE_TYPE_POSEARRAY,
  MESSAGE_TYPE_POINTCLOUD,
  MESSAGE_TYPE_POINTCLOUD2,
  MESSAGE_TYPE_POLYGONSTAMPED,
  MESSAGE_TYPE_LASERSCAN,
];

export const UNSUPPORTED_MESSAGE_TYPES = [
  MESSAGE_TYPE_DISPLAYTRAJECTORY,
  MESSAGE_TYPE_IMAGE,
  MESSAGE_TYPE_COMPRESSEDIMAGE,
  MESSAGE_TYPE_PATH,
  MESSAGE_TYPE_PLANNINGSCENE,
  MESSAGE_TYPE_ODOMETRY,
  MESSAGE_TYPE_RANGE,
  MESSAGE_TYPE_WRENCHSTAMPED,
  MESSAGE_TYPE_ACCELSTAMPED,
  MESSAGE_TYPE_BOUNDINGVOLUME,
  MESSAGE_TYPE_MAGNETICFIELD,
  MESSAGE_TYPE_TWISTSTAMPED,
  MESSAGE_TYPE_VECTOR3STAMPED,
];
