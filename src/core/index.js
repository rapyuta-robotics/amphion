import { RosTopicDataSource } from '../data/rosTopic';

class Core {
  constructor(ros, topicName, messageType, options = {}) {
    const { onHeaderChange } = options;
    this.options = options;
    this.ros = ros;
    this.headerFrameId = '';
    if (ros && topicName) {
      this.changeTopic(topicName, messageType, false);
    }
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
    if (this.object && this.object.parent) {
      this.object.parent.remove(this.object);
      this.object = null;
    }
  }

  reset() {}

  subscribe() {
    if (!this.dataSourceInstances) {
      return;
    }
    this.dataSourceInstances.forEach(t => {
      const listener = {
        next: this.update,
        error: error => console.log(error),
        complete: () => console.log('stream complete'),
      };
      t.addListener(listener);
    });
  }

  unsubscribe() {
    if (!this.dataSourceInstances) {
      return;
    }
    this.dataSourceInstances.forEach(t => {
      t.removeAllListeners();
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
    this.dataSourceInstances = (Array.isArray(topicName)
      ? topicName
      : [{ name: topicName, messageType: type }]
    ).map(
      ({ name, messageType }) =>
        new RosTopicDataSource({
          ros: this.ros,
          topicName: name,
          messageType,
          compression: compression || 'none',
          throttleRate: throttleRate || 0,
          queueSize: queueSize || 10,
        }),
    );

    if (autoSubscribe) {
      this.reset();
      this.subscribe();
    }
  }
}

export default Core;
