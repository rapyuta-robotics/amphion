import { DataSource } from '../data';
import { Object3D } from 'three';
import { assertIsDefined, isHTMLElement, isObject3D } from '../utils/helpers';
import { Listener } from 'xstream';

interface CoreOptions<T> {
  sources: Array<DataSource<T>>;
  options?: { [k: string]: any };
}

class LiveCore<T extends RosMessage.Base, V extends Object3D | HTMLElement> {
  private onHeaderChange = (headerFrameId: string) => {};
  private sources: Array<DataSource<T>>;
  protected options: { [k: string]: any };
  private headerFrameId = '';
  public object?: V;

  constructor(args: CoreOptions<T>) {
    this.sources = args.sources;
    this.options = args.options ?? {};

    this.update = this.update.bind(this);
    this.updateOptions = this.updateOptions.bind(this);
  }

  hide = () => {
    assertIsDefined(this.object);
    if (isObject3D(this.object)) {
      this.object.visible = false;
    } else if (isHTMLElement(this.object)) {
      this.object.style.visibility = 'hidden';
    }
  };

  show = () => {
    assertIsDefined(this.object);
    if (isObject3D(this.object)) {
      this.object.visible = true;
    } else if (isHTMLElement(this.object)) {
      this.object.style.visibility = 'visible';
    }
  };

  destroy = () => {
    this.unsubscribe();
    if (isObject3D(this.object)) {
      this.object?.parent?.remove(this.object);
    } else if (isHTMLElement(this.object)) {
      this.object?.parentElement?.removeChild(this.object);
    }
    this.object = undefined;
  };

  reset = () => {};

  subscribe = () => {
    this.sources.forEach(source => {
      const listener: Listener<T> = {
        next: this.update,
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

  update(message: T) {
    const headerFrameId = message.header?.frame_id ?? '';
    if (headerFrameId !== this.headerFrameId) {
      this.headerFrameId = headerFrameId;
      this.onHeaderChange(this.headerFrameId);
    }
  }

  updateOptions(options: { [k: string]: any }) {
    this.options = {
      ...this.options,
      ...options,
    };
  }

  changeSources(sources: Array<DataSource<T>>) {
    this.unsubscribe();
    this.sources = sources;
    this.subscribe();
  }
}

export default LiveCore;
