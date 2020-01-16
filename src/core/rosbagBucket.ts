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
    [p: string]: Set<Reader> | undefined;
  } = {};
  constructor() {}

  addFile = async (file: File) => {
    if (this.files.has(file)) {
      throw new Error('file already exists in the bucket');
    }
    this.files.add(file);
    await this.processFile(file);
  };

  removeFile = async (file: File) => {
    // TODO: implement after figuring out how to stop the stream
  };

  addReader = (topic: string, reader: Reader) => {
    const readers = this.readers[topic];
    if (!readers) {
      this.readers[topic] = new Set();
    }
    this.readers[topic]?.add(reader);
  };

  removeReader = (topic: string, reader: Reader) => {
    const readers = this.readers[topic];
    if (!readers || !readers.has(reader)) {
      throw new Error('reader has not yet been added to the bucket');
    }
    this.readers[topic]?.delete(reader);
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
    await bag.readMessages({}, (result: BagReadResult) => {
      const readers = this.readers[result.topic];
      const globalReaders = this.readers['*'];
      globalReaders?.forEach(reader => reader(file, result));
      readers?.forEach(reader => reader(file, result));
    });
    await this.processFile(file);
  }
}
