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
    this.topic.subscribe(this.update);
  }

  unsubscribe() {
    this.topic.unsubscribe();
  }

  update(message) {
  }

  changeTopic(newTopic) {
    this.unsubscribe();
    this.topicName = newTopic;

    this.reset();

    this.topic = new ROSLIB.Topic({
      ros: this.ros,
      name: newTopic,
      messageType: this.messageType,
    });

    this.subscribe();
  }
}

export default Core;
