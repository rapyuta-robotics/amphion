import { DataSource } from '../data';
import { Object3D } from 'three';
import { assertIsDefined } from '../utils/helpers';
import { Listener } from 'xstream';

interface CoreOptions<T> {
  sources: Array<DataSource<T>>;
  options: { [k: string]: any };
}

class Core2<T extends RosMessage.Base> {
  private onHeaderChange = (headerFrameId: string) => {};
  private sources: Array<DataSource<T>>;
  private options: { [k: string]: any };
  private headerFrameId = '';
  public object?: Object3D;

  constructor(args: CoreOptions<T>) {
    this.sources = args.sources;
    this.options = args.options;
  }

  hide = () => {
    assertIsDefined(this.object);
    this.object.visible = false;
  };

  show = () => {
    assertIsDefined(this.object);
    this.object.visible = true;
  };

  destroy = () => {
    this.unsubscribe();
    this.object?.parent?.remove(this.object);
    this.object = undefined;
  };

  reset = () => {};

  subscribe = () => {
    this.sources.forEach(source => {
      const listener: Listener<T> = {
        next: () => {},
        error: error => console.log(error),
        complete: () => {},
      };
      source.addListener(listener);
    });
  };

  unsubscribe = () => {
    this.sources.forEach(source => {
      source.removeAllListeners();
    });
  };

  update = (message: T) => {
    const headerFrameId = message.header?.frame_id ?? '';
    if (headerFrameId !== this.headerFrameId) {
      this.headerFrameId = headerFrameId;
      this.onHeaderChange(this.headerFrameId);
    }
  };

  updateOptions = (options: { [k: string]: any }) => {
    this.options = {
      ...this.options,
      ...options,
    };
  };
}

export default Core2;
