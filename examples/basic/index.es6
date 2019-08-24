import ROSLIB from 'roslib';
import Amphion from '../../build/amphion.module';
import CONFIG from '../config.json';

// Setup ros instance and viewer
const ros = new ROSLIB.Ros();
const viewer = new Amphion.TfViewer(ros);

viewer.setContainer(document.getElementById('scene'));
ros.connect(CONFIG.ROS_WEBSOCKET_ENDPOINT);

// // Add path
const path = new Amphion.Path(ros, '/path_rosbag');
path.subscribe();
// path.updateOptions({
//   color: 0xff0000,
// });
viewer.addVisualization(path);

// // Add tf
// const tf = new Amphion.Tf(ros, [
//   {
//     name: '/tf',
//     messageType: 'tf2_msgs/TFMessage'
//   },
//   {
//     name: '/tf_static',
//     messageType: 'tf2_msgs/TFMessage'
//   }
// ]);
// tf.subscribe();
// viewer.addVisualization(tf);

// // Add Robot model
// const robotModel = new Amphion.RobotModel(ros, 'robot_description', {
//   packages: {
//     franka_description: 'https://storage.googleapis.com/kompose-artifacts/franka_description',
//   }
// });
// viewer.addRobot(robotModel);

// // Add Marker
// const marker = new Amphion.Marker(ros, '/text_view_facing');
// marker.subscribe();
// viewer.addVisualization(marker);

// Add markers array
const marker = new Amphion.MarkerArray(ros, '/markers_demo');
marker.subscribe();
viewer.addVisualization(marker);


// // Add pointcloud
// const pcl = new Amphion.PointCloud(ros, '/pointcloud2_throttled');
// pcl.subscribe();
// viewer.addVisualization(pcl);

// // Add laser scan
// const laser = new Amphion.LaserScan(ros, '/laser_scan');
// laser.subscribe();
// viewer.addVisualization(laser);

// // Add map
// const map = new Amphion.Map(ros, '/occupancy_grid');
// map.subscribe();
// map.updateOptions({
//   colorScheme: 'constmap',
// });
// viewer.addVisualization(map);

// // Add pose
// const pose = new Amphion.Pose(ros, '/pose_stamped');
// pose.subscribe();
// viewer.addVisualization(pose);

// // Add pose
// const pose = new Amphion.Pose(ros, '/pose_stamped');
// pose.subscribe();
// viewer.addVisualization(pose);

// // Add pose array
// const posearr = new Amphion.PoseArray(ros, '/pose_array_rosbag');
// posearr.subscribe();
// viewer.addVisualization(posearr);

/*************
To test
 Path: /path_rosbag
 Tf: /tf, /tf_static
 Marker: /arrow, /cube, /cube_list, /cylinder, /line_list, /line_strip, /sphere, /sphere_list
 Marker Array: /markers_demo
 Point cloud: /pointcloud2_throttled
 Odometry: /odom_rosbag
 Laser scan: /laser_scan
 Map: /occupancy_grid
 Pose stamped: /pose_stamped
 Pose array: /pose_array_rosbag


 Image: /camera/rgb/image_raw_throttled

*************/
