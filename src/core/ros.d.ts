declare namespace RosMessage {
  interface Header {
    seq: number;
    stamp: {
      sec: number;
      nsec: number;
    };
    frame_id: string;
  }
  interface Base {
    header?: Header;
  }
}
