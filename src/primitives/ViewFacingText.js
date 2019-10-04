import SpriteText from 'three-spritetext';
import { Color } from 'three';
import Mesh from './Mesh';

class ViewFacingText extends Mesh {
  constructor(text) {
    super();
    this.color = new Color(1, 1, 1);
    this.text = new SpriteText(text, 1, `#${this.color.getHexString()}`);
    this.add(this.text);
  }

  setColor(color) {
    const { b, g, r } = color;
    if (!(this.color.r === r && this.color.g === g && this.color.b === b)) {
      this.color = new Color(r, g, b);
      this.text.color = `#${this.color.getHexString()}`;
    }
  }
}

export default ViewFacingText;
