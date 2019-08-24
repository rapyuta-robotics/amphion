import { Quaternion, Color } from 'three';

export const setTransform = (
  object,
  {
    translation: { x: posX, y: posY, z: posZ },
    rotation: { x: orientX, y: orientY, z: orientZ, w: orientW },
  },
) => {
  object.position.set(posX, posY, posZ);
  object.quaternion.copy(
    new Quaternion(orientX, orientY, orientZ, orientW).normalize(),
  );
};

export const setScale = (object, { x, y, z }) => {
  object.scale.set(x, y, z);
};

export const setColor = (object, color) => {
  if (typeof color === 'string') {
    object.material.color = new Color(color);
  } else {
    object.material.color.setRGB(color.r, color.g, color.b);
  }
};
