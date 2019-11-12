import Core from '../core';
import {
  DEFAULT_OPTIONS_IMAGE,
  DEFAULT_OPTIONS_IMAGE_STREAM,
} from '../utils/constants';

class ImageStream extends Core {
  constructor(ros, topicName, options = DEFAULT_OPTIONS_IMAGE_STREAM) {
    super(ros, null, null, {
      ...DEFAULT_OPTIONS_IMAGE_STREAM,
      ...options,
    });
    this.object = document.createElement('img');
    this.object.src = this.options.url;
    this.object.setAttribute('draggable', false);
    this.updateOptions({
      ...DEFAULT_OPTIONS_IMAGE,
      ...options,
    });
  }

  updateOptions(options) {
    super.updateOptions(options);
    const { defaultHeight, defaultWidth } = this.options;
    this.object.width = defaultWidth;
    this.object.height = defaultHeight;
  }

  hide() {
    this.object.style.visibility = 'hidden';
  }

  show() {
    this.object.style.visibility = 'visible';
  }
}

export default ImageStream;
