import ROSLIB from 'roslib';
import Amphion from '../../build/amphion.module';
import CONFIG from '../config.json';

// Setup ros instance and viewer
const ros = new ROSLIB.Ros();
const viewer = new Amphion.TfViewer(ros);

viewer.setContainer(document.getElementById('scene'));
ros.connect(CONFIG.ROS_WEBSOCKET_ENDPOINT);

// Add path
const path = new Amphion.Path(ros, '/path_rosbag');
path.subscribe();
path.updateOptions({
  color: 0xff0000,
});
viewer.addVisualization(path);
