import Core from '../core';
import { DEFAULT_OPTIONS_DEPTHCLOUD } from '../utils/constants';
import DepthCloudObject from '../primitives/DepthCloudObject';

class DepthCloud extends Core {
  constructor(url, options) {
    super(null, url, null, {
      ...DEFAULT_OPTIONS_DEPTHCLOUD,
      ...options,
    });
    this.url = url;
    this.object = new DepthCloudObject(url, options);
  }

  subscribe() {
    this.object.initVideo();
    this.object.startStream();
  }

  unsubscribe() {
    this.object.stopStream();
  }
}

export default DepthCloud;
