export const COLOR_TYPES = {
  OCCUPIED: 100,
  UNOCCUPIED: 0,
  UNKNOWN: -1,
  OTHER: 127,
};

export const populateImageDataFromNavMsg = (
  imageData: ImageData,
  width: number,
  height: number,
  dataSource: number[],
) => {
  for (let row = 0; row < height; row++) {
    for (let col = 0; col < width; col++) {
      const mapI = col + (height - row - 1) * width;
      const data = dataSource[mapI];
      const val = new DataView(Uint8Array.from([data]).buffer).getUint8(0);
      let i = (col + row * width) * 4;

      if (val >= 0 && val <= 100) {
        const v = 255 - (255 * val) / 100;
        imageData.data[i] = v; // red
        imageData.data[++i] = v; // green
        imageData.data[++i] = v; // blue
        imageData.data[++i] = 255; // alpha
      } else if (val >= 101 && val <= 127) {
        // illegal positive values in green
        imageData.data[i] = 0; // red
        imageData.data[++i] = 255; // green
        imageData.data[++i] = 0; // blue
        imageData.data[++i] = 255; // alpha
      } else if (val >= 128 && val <= 254) {
        // illegal negative (char) values in shades of red/yellow
        imageData.data[i] = 255; // red
        imageData.data[++i] = (255 * (val - 128)) / (254 - 128); // green
        imageData.data[++i] = 0; // blue
        imageData.data[++i] = 255; // alpha
      } else {
        // legal -1 value is tasteful blueish greenish grayish color
        imageData.data[i] = 0x70; // red
        imageData.data[++i] = 0x89; // green
        imageData.data[++i] = 0x86; // blue
        imageData.data[++i] = 255; // alpha
      }
    }
  }
};

export const populateRawImageDataFromNavMsg = (
  imageData: ImageData,
  width: number,
  height: number,
  dataSource: number[],
) => {
  for (let row = 0; row < height; row++) {
    for (let col = 0; col < width; col++) {
      const mapI = col + (height - row - 1) * width;
      const data = dataSource[mapI];

      let i = (col + row * width) * 4;

      const Uint8DV = new DataView(Uint8Array.from([data]).buffer);
      const val = Uint8DV.getUint8(0);

      imageData.data[i] = val;
      imageData.data[++i] = val;
      imageData.data[++i] = val;
      imageData.data[++i] = 255;
    }
  }
};

export const populateConstImageDataFromNavMsg = (
  imageData: ImageData,
  width: number,
  height: number,
  dataSource: number[],
) => {
  for (let row = 0; row < height; row++) {
    for (let col = 0; col < width; col++) {
      const mapI = col + (height - row - 1) * width;
      const data = dataSource[mapI];
      const val = new DataView(Uint8Array.from([data]).buffer).getUint8(0);

      let i = (col + row * width) * 4;

      if (val === 0) {
        imageData.data[i] = 0;
        imageData.data[++i] = 0;
        imageData.data[++i] = 0;
        imageData.data[++i] = 0; // alpha
      } else if (val >= 1 && val <= 98) {
        // Blue to red spectrum for most normal cost values
        const v = (255 * val) / 100;
        imageData.data[i] = v; // red
        imageData.data[++i] = 0; // green
        imageData.data[++i] = 255 - v; // blue
        imageData.data[++i] = 255; // alpha
      } else if (val === 99) {
        // inscribed obstacle values (99) in cyan
        imageData.data[i] = 0; // red
        imageData.data[++i] = 255; // green
        imageData.data[++i] = 255; // blue
        imageData.data[++i] = 255; // alpha
      } else if (val === 100) {
        // lethal obstacle values (100) in purple
        imageData.data[i] = 255; // red
        imageData.data[++i] = 0; // green
        imageData.data[++i] = 255; // blue
        imageData.data[++i] = 255; // alpha
      } else if (val > 100 && val <= 127) {
        // illegal positive values in green
        imageData.data[i] = 0; // red
        imageData.data[++i] = 255; // green
        imageData.data[++i] = 0; // blue
        imageData.data[++i] = 255; // alpha
      } else if (val >= 128 && val <= 254) {
        // illegal negative (char) values in shades of red/yellow
        imageData.data[i] = 255; // red
        imageData.data[++i] = (255 * (val - 128)) / (254 - 128); // green
        imageData.data[++i] = 0; // blue
        imageData.data[++i] = 255; // alpha
      } else {
        // legal -1 value is tasteful blueish greenish grayish color
        imageData.data[i] = 0x70; // red
        imageData.data[++i] = 0x89; // green
        imageData.data[++i] = 0x86; // blue
        imageData.data[++i] = 255; // alpha
      }
    }
  }
};

export const imageDataToCanvas = (imageData: ImageData) => {
  const canvas = document.createElement('canvas');
  canvas.width = imageData.width;
  canvas.height = imageData.height;
  const context = canvas.getContext('2d');
  context?.putImageData(imageData, 0, 0);
  return canvas;
};

export const populateImageDataFromImageMsg = (
  message: RosMessage.Image,
  offset: number,
  rgbaOrder: number[],
  imageData: ImageData,
) => {
  const { data: rawData, height, step } = message;
  const typedArray = Uint8Array.from(rawData);
  // endianness is required for > 8bit encodings
  const encodedDataView = new DataView(typedArray.buffer);

  let j = 0;
  for (let i = 0; i < step * height; i += offset) {
    for (let k = 0; k < rgbaOrder.length; k++) {
      imageData.data[j++] = encodedDataView.getUint8(i + rgbaOrder[k]);
    }
    if (rgbaOrder.length === 3) {
      imageData.data[j++] = 255;
    }
  }
};
