import Core from '../core';
import { DEFAULT_OPTIONS_IMAGE_STREAM } from '../utils/constants';

class ImageStream extends Core {
  constructor(url, options = DEFAULT_OPTIONS_IMAGE_STREAM) {
    super(null, null, null, {
      ...DEFAULT_OPTIONS_IMAGE_STREAM,
      ...options,
    });
    this.url = url;
    this.object = document.createElement('img');
    this.object.src = this.url;
    this.object.setAttribute('draggable', false);
    this.updateOptions({
      ...DEFAULT_OPTIONS_IMAGE_STREAM,
      ...options,
    });
  }

  updateOptions(options) {
    super.updateOptions(options);
    const { height, width } = this.options;
    this.object.width = width;
    this.object.height = height;
  }

  hide() {
    this.object.style.visibility = 'hidden';
  }

  show() {
    this.object.style.visibility = 'visible';
  }
}

export default ImageStream;
