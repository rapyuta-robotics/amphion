export const COLOR_TYPES = {
  OCCUPIED: 100,
  UNOCCUPIED: 0,
  UNKNOWN: -1,
  OTHER: 127,
};

export const populateImageDataFromNavMsg = (
  imageData,
  width,
  height,
  dataSource
) => {
  for (let row = 0; row < height; row++) {
    for (let col = 0; col < width; col++) {
      const mapI = col + (height - row - 1) * width;
      const data = dataSource[mapI];
      let val;
      switch (data) {
        case COLOR_TYPES.UNOCCUPIED: {
          val = 255;
          break;
        }
        case COLOR_TYPES.OCCUPIED: {
          val = 0;
          break;
        }
        case COLOR_TYPES.UNKNOWN: {
          val = 127;
          break;
        }
        default: {
          val = data;
        }
      }
      let i = (col + row * width) * 4;

      imageData.data[i] = val;
      imageData.data[++i] = val;
      imageData.data[++i] = val;
      imageData.data[++i] = 255;
    }
  }
};

export const populateRawImageDataFromNavMsg = (
  imageData,
  width,
  height,
  dataSource
) => {
  for (let row = 0; row < height; row++) {
    for (let col = 0; col < width; col++) {
      const mapI = col + (height - row - 1) * width;
      const data = dataSource[mapI];

      let i = (col + row * width) * 4;

      if (data === COLOR_TYPES.UNKNOWN) {
        imageData.data[i] = 127;
        imageData.data[++i] = 127;
        imageData.data[++i] = 127;
        imageData.data[++i] = 255;
      } else {
        imageData.data[i] = data;
        imageData.data[++i] = data;
        imageData.data[++i] = data;
        imageData.data[++i] = data;
      }
    }
  }
};

export const populateConstImageDataFromNavMsg = (
  imageData,
  width,
  height,
  dataSource
) => {
  for (let row = 0; row < height; row++) {
    for (let col = 0; col < width; col++) {
      const mapI = col + (height - row - 1) * width;
      const data = dataSource[mapI];

      let i = (col + row * width) * 4;


      switch (data) {
        case COLOR_TYPES.OCCUPIED: {
          imageData.data[i] = 252;
          imageData.data[++i] = 15;
          imageData.data[++i] = 192;
          imageData.data[++i] = 255;
          break;
        }
        case COLOR_TYPES.UNKNOWN: {
          imageData.data[i] = 127;
          imageData.data[++i] = 127;
          imageData.data[++i] = 127;
          imageData.data[++i] = 255;
          break;
        }
        default: {
          imageData.data[i] = data;
          imageData.data[++i] = data;
          imageData.data[++i] = data;
          imageData.data[++i] = 255;
        }
      }
    }
  }
};

export const imageDataToCanvas = (imageData) => {
  const canvas = document.createElement('canvas');
  canvas.width = imageData.width;
  canvas.height = imageData.height;
  const context = canvas.getContext('2d');
  context.putImageData(imageData, 0, 0);
  return canvas;
};
