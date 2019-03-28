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
        case 100: {
          val = 0;
          break;
        }
        case 0: {
          val = 255;
          break;
        }
        default: {
          val = 127;
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

export const imageDataToCanvas = (imageData) => {
  const canvas = document.createElement('canvas');
  canvas.width = imageData.width;
  canvas.height = imageData.height;
  const context = canvas.getContext('2d');
  context.putImageData(imageData, 0, 0);
  return canvas;
};
