import { Object3D } from 'three';
import { assertIsDefined, isHTMLElement, isObject3D } from '../utils/helpers';

interface CoreOptions {
  options?: { [k: string]: any };
}

class StaticCore<V extends Object3D | HTMLElement> {
  protected options: { [k: string]: any };
  public object?: V;

  constructor(args: CoreOptions) {
    this.options = args.options ?? {};
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
    if (isObject3D(this.object)) {
      this.object?.parent?.remove(this.object);
    } else if (isHTMLElement(this.object)) {
      this.object?.parentElement?.removeChild(this.object);
    }
    this.object = undefined;
  };

  reset = () => {};

  updateOptions(options: { [k: string]: any }) {
    this.options = {
      ...this.options,
      ...options,
    };
  }
}

export default StaticCore;
