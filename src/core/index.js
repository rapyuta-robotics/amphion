import ROSLIB from 'roslib';

class Core {
  constructor(ros, topicName, messageType, options = {}) {
    const { onHeaderChange } = options;
    this.options = options;
    this.ros = ros;
    this.headerFrameId = '';
    this.changeTopic(topicName, messageType, false);
    this.onHeaderChange = onHeaderChange || (() => {});
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
    if(this.object && this.object.parent) {
      this.object.parent.remove(this.object);
      this.object = null;
    }
  }

  reset() {}

  subscribe() {
    if (!this.topicInstances) {
      return;
    }
    this.topicInstances.forEach(t => {
      t.subscribe(this.update);
    });
  }

  unsubscribe() {
    if (!this.topicInstances) {
      return;
    }
    this.topicInstances.forEach(t => {
      t.unsubscribe();
    });
  }

  update(message) {
    const header = message.header ? message.header.frame_id : '';
    if (header !== this.headerFrameId) {
      this.headerFrameId = header;
      this.onHeaderChange(this.headerFrameId);
    }
  }

  updateOptions(options) {
    this.options = {
      ...this.options,
      ...options,
    };
  }

  changeTopic(topicName, type, autoSubscribe = true) {
    const { compression, queueSize, throttleRate } = this.options;

    if (autoSubscribe) {
      this.unsubscribe();
    }

    this.topicName = topicName;
    this.messageType = type || this.messageType;
    this.topicInstances = (Array.isArray(topicName)
      ? topicName
      : [{ name: topicName, messageType: type }]
    ).map(
      ({ name, messageType }) =>
        new ROSLIB.Topic({
          ros: this.ros,
          name,
          messageType,
          compression: compression || 'none',
          throttle_rate: throttleRate || 0,
          queue_size: queueSize || 10,
        }),
    );

    if (autoSubscribe) {
      this.reset();
      this.subscribe();
    }
  }
}

export default Core;
