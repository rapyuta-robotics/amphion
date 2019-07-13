import ROSLIB from 'roslib';
import Amphion from '../../build/amphion.module';

// Setup ros instance and viewer
const ros = new ROSLIB.Ros();
const viewer = new Amphion.Viewer3d(ros);
viewer.setContainer(document.getElementById('scene'));
ros.connect('ws://10.91.1.111:9090');

// Add path
const path = new Amphion.Path(ros, '/path_rosbag');
path.subscribe();
viewer.addVisualization(path);

// Add Marker
const marker = new Amphion.Marker(ros, '/cube_list');
marker.subscribe();
viewer.addVisualization(marker);

// Add robot model
const robotModel = new Amphion.RobotModel(
  ros,
  'robot_description',
);
viewer.addRobot(robotModel, { packages: [
    {
      name: 'franka_description',
      value:
        'https://storage.googleapis.com/kompose-artifacts/franka_description',
    }
  ]
});
