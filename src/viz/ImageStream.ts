import { DEFAULT_OPTIONS_IMAGE_STREAM } from '../utils/constants';
import StaticCore from '../core/static';
import { assertIsDefined } from '../utils/helpers';

class ImageStream extends StaticCore<HTMLImageElement> {
  private readonly url: string;

  constructor(url: string, options = DEFAULT_OPTIONS_IMAGE_STREAM) {
    super({
      options: {
        ...DEFAULT_OPTIONS_IMAGE_STREAM,
        ...options,
      },
    });
    const { height, width } = this.options;
    this.url = url;
    this.object = document.createElement('img');
    this.object.src = this.url;
    this.object.setAttribute('draggable', 'false');
    this.object.width = width;
    this.object.height = height;
  }

  hide = () => {
    assertIsDefined(this.object);
    this.object.style.visibility = 'hidden';
  };

  show = () => {
    assertIsDefined(this.object);
    this.object.style.visibility = 'visible';
  };
}

export default ImageStream;
