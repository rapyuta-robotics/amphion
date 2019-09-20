import ROSLIB from 'roslib';
import Amphion from '../../build/amphion.module';
import CONFIG from '../config.json';

// Setup ros instance and viewer
const ros = new ROSLIB.Ros();
const viewer = new Amphion.TfViewer(ros, {
  backgroundColor: '#ffffff',
});

viewer.setContainer(document.getElementById('scene'));
ros.connect(CONFIG.ROS_WEBSOCKET_ENDPOINT);

// Add path
const path = new Amphion.Path(ros, '/path_rosbag');
path.subscribe();
path.updateOptions({
  color: 0xff0000,
});
viewer.addVisualization(path);

// Add path
const depthcloud = new Amphion.DepthCloudObject('http://10.91.1.111:8888/stream?topic=/depthcloud_encoded_throttled', {
  streamType: 'vp8',
});
depthcloud.metaLoaded = true;
depthcloud.initStreamer();
viewer.scene.add(depthcloud);
// depthcloud.initStreamer();
window.depthcloud = depthcloud;
// depthcloud.startStream();

document.getElementById('root').appendChild(depthcloud.video);
