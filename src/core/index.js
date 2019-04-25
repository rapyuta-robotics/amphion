import ROSLIB from 'roslib';
import _ from 'lodash';

class Core {
  constructor(ros, topicName, messageType, options) {
    const { queueSize } = options || {};
    this.ros = ros;
    this.topicName = topicName;
    this.messageType = messageType;
    this.topic = topicName ? new ROSLIB.Topic({
      ros,
      name: topicName,
      messageType,
      queue_size: queueSize,
    }) : null;
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
    if (_.isArray(this.topic)) {
      _.each(this.topic, (t) => {
        t.subscribe(this.update);
      });
    } else {
      this.topic.subscribe(this.update);
    }
  }

  unsubscribe() {
    if (_.isArray(this.topic)) {
      _.each(this.topic, (t) => {
        t.unsubscribe();
      });
    } else {
      this.topic.unsubscribe();
    }
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
