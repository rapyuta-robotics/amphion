import { Quaternion } from 'three';

export const setTransform = (
  object,
  {
    translation: { x: posX, y: posY, z: posZ },
    rotation: { x: orientX, y: orientY, z: orientZ, w: orientW },
  },
) => {
  object.position.set(posX, posY, posZ);
  object.quaternion.copy((new Quaternion(orientX, orientY, orientZ, orientW)).normalize());
};

export const setScale = (object, { x, y, z }) => {
  object.scale.set(x, y, z);
};

export const setColor = (object, { r, g, b }) => {
  object.material.color.setRGB(r, g, b);
};
