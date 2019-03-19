import ROSLIB from 'roslib';

class Core {
  constructor(ros, topicName, messageType) {
    this.ros = ros;
    this.topicName = topicName;
    this.messageType = messageType;
    this.topic = new ROSLIB.Topic({
      ros,
      name: topicName,
      messageType,
    });
  }

  hide() {
    this.object.visible = false;
  }

  show() {
    this.object.visible = true;
  }

  destroy() {

  }

  subscribe() {
    this.topic.subscribe(this.update.bind(this));
  }

  unsubscribe() {
    this.topic.unsubscribe();
  }

  update(message) {
  }
}

export default Core;
