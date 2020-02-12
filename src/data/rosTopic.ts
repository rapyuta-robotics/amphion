import { DataSource } from './index';
import { Message, Ros, Topic } from 'roslib';
import xs, { Listener, Producer, Stream } from 'xstream';

interface RosTopicDataSourceOptions {
  ros: Ros;
  topicName: string;
  messageType: string;
  memory?: boolean;
  compression?: 'png' | 'cbor';
  // the rate (in ms in between messages) at which to throttle the topics
  throttleRate?: number;
  // the queue created at bridge side for re-publishing webtopics (defaults to 100)
  queueSize?: number;
  // the queue length at bridge side used when subscribing (defaults to 0, no queueing)
  queueLength?: number;
}

export class RosTopicDataSource<T extends Message> implements DataSource<T> {
  public readonly createdAt: Date = new Date();
  public readonly hasMemory: boolean;
  private readonly ros: Ros;
  private readonly topic: Topic;
  private readonly producer: Producer<T>;
  private stream: Stream<T>;
  private isStreamLive: boolean = false;
  private isStreamPaused: boolean = false;
  private internalListener: ((message: Message) => void) | null = null;
  private readonly listeners = new Set<Listener<T>>();
  private readonly rosConnectionHook: (() => void) | null = null;
  private rosCloseHook: (() => void) | null = null;
  private rosErrorHook: ((error: any) => void) | null = null;

  constructor(options: RosTopicDataSourceOptions) {
    this.ros = options.ros;
    this.hasMemory = options.memory ?? false;

    const topicOptions: any = {
      ros: this.ros,
      name: options.topicName,
      messageType: options.messageType,
    };
    if (options.compression) {
      topicOptions.compression = options.compression;
    }
    if (options.queueSize) {
      topicOptions.queue_size = options.queueSize;
    }
    if (options.queueLength) {
      topicOptions.queue_length = options.queueLength;
    }
    this.topic = new Topic(topicOptions);
    this.producer = {
      start: listener => {
        if (!this.rosCloseHook && !this.rosErrorHook) {
          this.addRosHealthHooks();
        }
        this.internalListener = (message: Message) => {
          if (this.isStreamPaused) {
            return;
          }
          listener.next(message as T);
        };
        this.topic.subscribe(this.internalListener);
      },
      stop: () => {
        this.topic.unsubscribe(this.internalListener!);
        this.removeRosHealthHooks();
      },
    };
    this.stream = this.hasMemory
      ? xs.createWithMemory(this.producer)
      : xs.create(this.producer);
    this.isStreamLive = true;

    this.rosConnectionHook = () => {
      if (this.isStreamLive) {
        return;
      }
      this.stream = this.hasMemory
        ? xs.createWithMemory(this.producer)
        : xs.create(this.producer);
      this.isStreamLive = true;
      this.listeners.forEach(listener => {
        this.stream.addListener(listener);
      });
    };
    this.ros.on('connection', this.rosConnectionHook);
  }

  private addRosHealthHooks = () => {
    this.rosCloseHook = () => {
      this.isStreamLive = false;
      this.cleanStream('complete');
    };
    this.rosErrorHook = error => {
      this.isStreamLive = false;
      this.cleanStream('error', error);
    };
    this.ros.on('error', this.rosErrorHook);
    this.ros.on('close', this.rosCloseHook);
  };

  private removeRosHealthHooks = () => {
    // type definitions for ros do not expose "off" function
    (this.ros as any).off('error', this.rosErrorHook);
    (this.ros as any).off('close', this.rosCloseHook);
    this.rosErrorHook = null;
    this.rosCloseHook = null;
  };

  public addListener = (listener: Listener<T>) => {
    if (this.listeners.has(listener)) {
      return { success: false, reason: 'listener already present' };
    }
    this.listeners.add(listener);
    if (this.isStreamLive) {
      this.stream.addListener(listener);
    }
    return { success: true };
  };

  public removeListener = (listener: Listener<T>) => {
    if (!this.listeners.has(listener)) {
      return { success: false, reason: 'listener not present' };
    }
    this.listeners.delete(listener);
    this.stream.removeListener(listener);
    return { success: true };
  };

  private cleanStream = (event: 'error' | 'complete', error?: any) => {
    if (event === 'error') {
      this.stream.shamefullySendError(error);
    } else {
      this.stream.shamefullySendComplete();
    }
    this.listeners.forEach(listener => {
      this.stream.removeListener(listener);
    });
  };

  public removeAllListeners = () => {
    this.listeners.forEach(listener => {
      this.stream.removeListener(listener);
    });
    this.listeners.clear();
    return { success: true };
  };

  public pause = () => {
    this.isStreamPaused = true;
    return { success: true };
  };

  public resume = () => {
    this.isStreamPaused = false;
    return { success: true };
  };
}
