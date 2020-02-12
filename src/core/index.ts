import { RosTopicDataSource } from '../data/rosTopic';
import { Ros } from 'roslib';
import { Object3D } from 'three';
import { assertIsDefined } from '../utils/helpers';
import { DataSource } from '../data';

class LegacyCore {
  public options: { [p: string]: any };
  public readonly ros: Ros | null;
  private headerFrameId: string;
  private readonly onHeaderChange: (headerId: string) => void;
  public object?: Object3D | null;
  private dataSourceInstances?: DataSource<RosMessage.Base>[];
  public topicName?: string | Array<{ name: string; messageType: string }>;
  public messageType?: string;

  constructor(
    ros: Ros | null,
    resourceName: string | null,
    messageType: string,
    options: { [p: string]: any } = {},
  ) {
    const { onHeaderChange } = options;
    this.options = options;
    this.ros = ros;
    this.headerFrameId = '';

    if (ros && resourceName) {
      this.changeTopic(resourceName, messageType, false);
    }
    this.onHeaderChange = onHeaderChange || (() => {});
    this.update = this.update.bind(this);
  }

  hide() {
    assertIsDefined(this.object);
    this.object.visible = false;
  }

  show() {
    assertIsDefined(this.object);
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
        error: (error: any) => console.log(error),
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

  update(message: RosMessage.Base) {
    const header = message.header ? message.header.frame_id : '';
    if (header !== this.headerFrameId) {
      this.headerFrameId = header;
      this.onHeaderChange(this.headerFrameId);
    }
  }

  updateOptions(options: { [p: string]: any }) {
    this.options = {
      ...this.options,
      ...options,
    };
  }

  changeTopic(
    resourceName: string | Array<{ name: string; messageType: string }>,
    type: string,
    autoSubscribe = true,
  ) {
    const { compression, queueSize, throttleRate } = this.options;

    if (autoSubscribe) {
      this.unsubscribe();
    }

    // unused variable; left for legacy purposes
    this.topicName = resourceName;

    this.messageType = type || this.messageType;
    this.dataSourceInstances = (Array.isArray(resourceName)
      ? resourceName
      : [{ name: resourceName, messageType: type }]
    ).map(
      ({ name, messageType }) =>
        new RosTopicDataSource({
          ros: this.ros!,
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

export default LegacyCore;
