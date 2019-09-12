import SpriteText from 'three-spritetext';
import { Color } from 'three';
import Mesh from './Mesh';

class ViewFacingText extends Mesh {
  constructor(text, options) {
    super();
    this.text = new SpriteText(text, options.size, options.color);
    this.add(this.text);
    this.color = options.color;
  }

  setColor(color) {
    const { b, g, r } = color;
    if (
      typeof this.color === 'string' ||
      !(this.color.r === r && this.color.g === g && this.color.b === b)
    ) {
      this.color = new Color(r, g, b);
      this.text.color = `#${this.color.getHexString()}`;
    }
  }
}

export default ViewFacingText;
