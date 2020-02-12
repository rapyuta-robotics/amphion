import ROSLIB from 'roslib';
import Amphion from '../../build/amphion';
import CONFIG from '../config.json';

// Setup ros instance and viewer
const ros = new ROSLIB.Ros();
const scene = new Amphion.Scene();

const viewer3d = new Amphion.Viewer3d(scene);
viewer3d.setContainer(document.getElementById('scene3d'));

const viewer2d = new Amphion.Viewer2d(scene);
viewer2d.setContainer(document.getElementById('scene2d'));

ros.connect(CONFIG.ROS_WEBSOCKET_ENDPOINT);

// Add path
const path = new Amphion.Path(ros, '/path_rosbag');
path.subscribe();
scene.addVisualization(path);

// Add Marker
const marker = new Amphion.Marker(ros, '/cube_list');
marker.subscribe();
scene.addVisualization(marker);

// Add Marker Aray
const markerArray = new Amphion.MarkerArray(ros, '/markers_demo');
markerArray.subscribe();
scene.addVisualization(markerArray);

// Add Odometry
const odometry = new Amphion.Odometry(ros, '/odom_rosbag');
odometry.subscribe();
scene.addVisualization(odometry);
