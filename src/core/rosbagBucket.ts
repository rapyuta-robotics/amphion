const { open } = require('rosbag');

export interface BagReadResult {
  topic: string;
  message: RosMessage.Base;
  timestamp: {
    sec: number;
    nsec: number;
  };
  data: number[];
  chunkOffset: number;
  totalChunks: number;
}

type Reader = (file: File, result: BagReadResult) => void;

export default class RosbagBucket {
  public files: Set<File> = new Set();
  public topics: Array<{
    name: string;
    messageType: string;
    rosbagFileName: string;
  }> = [];
  private readers: {
    [fileName: string]: {
      topics: {
        [topicName: string]: Set<Reader> | undefined;
      };
      queue: Array<BagReadResult>;
      timer?: number;
      queueStartWaitTimer?: number;
    };
  } = {};
  private firstBagReadResult: BagReadResult | undefined;

  addFile = async (file: File) => {
    if (this.files.has(file)) {
      throw new Error('file already exists in the bucket');
    }
    this.files.add(file);
    this.readers[file.name] = { topics: {}, queue: [] };
    await this.processFile(file);
  };

  removeFile = async (file: File, cb: () => void) => {
    if (!this.files.has(file)) {
      throw new Error('file does not exist in the bucket');
    }
    this.files.delete(file);
    clearTimeout(this.readers[file.name].timer);
    clearTimeout(this.readers[file.name].queueStartWaitTimer);
    this.readers[file.name] = {
      topics: {},
      queue: [],
    };
    this.topics = this.topics.filter(x => x.rosbagFileName !== file.name);
    cb();
  };

  addReader = (topic: string, fileName: string, reader: Reader) => {
    const topicReadersMap = this.readers[fileName].topics;
    if (!topicReadersMap) {
      throw new Error(`add ${fileName} to the bucket first`);
    }
    if (!topicReadersMap[topic]) {
      topicReadersMap[topic] = new Set<Reader>();
    }
    topicReadersMap[topic]?.add(reader);
  };

  removeReader = (topic: string, fileName: string, reader: Reader) => {
    const topicReadersMap = this.readers[fileName].topics;
    if (!topicReadersMap) {
      throw new Error(`add ${fileName} to the bucket first`);
    }
    if (!topicReadersMap[topic]?.has(reader)) {
      throw new Error('reader has not yet been added to the bucket');
    }
    topicReadersMap[topic]?.delete(reader);
  };

  processQueue = (file: File) => {
    const { queue } = this.readers[file.name];
    if (queue.length === 0) {
      this.readers[file.name].queueStartWaitTimer = window.setTimeout(() => {
        this.processQueue(file);
      }, 500);
      return;
    }
    this.enqueueProcessing(0, file);
  };

  enqueueProcessing = (index: number, file: File) => {
    const { queue } = this.readers[file.name];
    const first = queue[index];
    const second: BagReadResult | undefined = queue[index + 1];
    this.processBagReadResult(first, file);
    if (!second) {
      // loop over at queue end
      // note that this loop also starts if the queue is still being
      // constructed while the message consumption outpaces the construction
      this.enqueueProcessing(0, file);
      return;
    }
    const { sec: secFirst, nsec: nsecFirst } = first.timestamp;
    const { sec, nsec } = second.timestamp;
    const firstTimestampMs = Math.floor(
      secFirst * 10 ** 3 + nsecFirst / 10 ** 6,
    );
    const timestampMs = Math.floor(sec * 10 ** 3 + nsec / 10 ** 6);
    let diff = 0;
    if (timestampMs > firstTimestampMs) {
      diff = timestampMs - firstTimestampMs;
    }
    // setTimeout is throttled to 4ms in HTML5 spec
    // not bypassing it in this case will cause the visualisation to slow down
    if (diff < 4) {
      this.enqueueProcessing(index + 1, file);
    } else {
      this.readers[file.name].timer = window.setTimeout(() => {
        this.enqueueProcessing(index + 1, file);
      }, diff);
    }
  };

  processBagReadResult = (result: BagReadResult, file: File) => {
    const topicsReadersMap = this.readers[file.name].topics;
    const globalReaders = topicsReadersMap['*'];
    const specificReaders = topicsReadersMap[result.topic];
    globalReaders?.forEach(reader => reader(file, result));
    specificReaders?.forEach(reader => reader(file, result));
  };

  async processFile(file: File) {
    const bag = await open(file);
    Object.keys(bag.connections).forEach((id: string) => {
      const connection = bag.connections[id];
      const { topic, type } = connection;
      const existing = this.topics.findIndex(
        x => x.name === topic && x.rosbagFileName === file.name,
      );
      if (existing === -1) {
        this.topics.push({
          name: topic,
          messageType: type,
          rosbagFileName: file.name,
        });
      }
    });
    bag.readMessages({}, (result: BagReadResult) => {
      this.readers[file.name].queue.push(result);
    });
    // processing starts without waiting for the full bag read to finish
    // this enables us to implement remote rosbags
    // to wait for the full bag read before processing, use await on
    // bag.readMessages above
    this.processQueue(file);
  }
}
