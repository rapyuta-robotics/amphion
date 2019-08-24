import ROSLIB from 'roslib';
import Amphion from '../../build/amphion.module';
import CONFIG from '../config.json';

// Setup ros instance and viewer
const ros = new ROSLIB.Ros();
const viewer = new Amphion.Viewer3d();

viewer.setContainer(document.getElementById('scene'));
ros.connect(CONFIG.ROS_WEBSOCKET_ENDPOINT);

// Add path
const path = new Amphion.Path(ros, '/path_rosbag');
path.subscribe();
viewer.addVisualization(path);

// Add Marker
const marker = new Amphion.Marker(ros, '/cube_list');
marker.subscribe();
viewer.addVisualization(marker);

// Load robot model
const robotModel = new Amphion.RobotModel(ros, 'robot_description', {
  packages: {
    franka_description: 'https://storage.googleapis.com/kompose-artifacts/franka_description',
  }
});
robotModel.load();
viewer.addVisualization(robotModel);

