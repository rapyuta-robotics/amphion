import { DataSource } from './index';
import { Message } from 'roslib';
import xs, { Listener, Producer, Stream } from 'xstream';
import RosbagBucket, { BagReadResult } from '../core/rosbagBucket';

interface RosBagDataSourceOptions {
  bucket: RosbagBucket;
  memory?: boolean;
  topicName: string;
  fileName: string;
}

export class RosbagDataSource<T extends Message> implements DataSource<T> {
  public readonly createdAt: Date = new Date();
  public readonly hasMemory: boolean;
  private readonly bucket: RosbagBucket;
  private readonly producer: Producer<T>;
  private stream: Stream<T>;
  private isStreamPaused: boolean = false;
  private internalListener:
    | ((file: File, bagReadResult: BagReadResult) => void)
    | null = null;
  private readonly listeners = new Set<Listener<T>>();

  constructor(options: RosBagDataSourceOptions) {
    this.hasMemory = options.memory ?? false;
    this.bucket = options.bucket;
    this.producer = {
      start: listener => {
        this.internalListener = (file: File, bagReadResult: BagReadResult) => {
          if (this.isStreamPaused) {
            return;
          }
          listener.next(bagReadResult.message as T);
        };
        this.bucket.addReader(
          options.topicName,
          options.fileName,
          this.internalListener,
        );
      },
      stop: () => {
        if (!this.internalListener) {
          return;
        }
        this.bucket.removeReader(
          options.topicName,
          options.fileName,
          this.internalListener,
        );
      },
    };
    this.stream = this.hasMemory
      ? xs.createWithMemory(this.producer)
      : xs.create(this.producer);
  }

  public addListener = (listener: Listener<T>) => {
    if (this.listeners.has(listener)) {
      return { success: false, reason: 'listener already present' };
    }
    this.listeners.add(listener);
    this.stream.addListener(listener);
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
