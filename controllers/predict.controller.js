const tf = require('@tensorflow/tfjs-node');
const fs = require('fs');
const Jimp = require('jimp');
exports.makePredictions = async (res, cropName) => {
  const imagePath = './images/test-image.jpg';
  try {
    console.log(`Loading model ${cropName}/model.json`);
    const model = await tf.loadLayersModel(
      tf.io.fileSystem(`./models/${cropName}/model.json`)
    );
    console.log(`Loaded model`);

    const image = await Jimp.read(imagePath);
    image.cover(
      224,
      224,
      Jimp.HORIZONTAL_ALIGN_CENTER | Jimp.VERTICAL_ALIGN_MIDDLE
    );
    const NUM_OF_CHANNELS = 3;
    let values = new Float32Array(224 * 224 * NUM_OF_CHANNELS);
    let i = 0;
    image.scan(0, 0, image.bitmap.width, image.bitmap.height, (x, y, _idx) => {
      const pixel = Jimp.intToRGBA(image.getPixelColor(x, y));
      pixel.r = pixel.r / 127.0 - 1;
      pixel.g = pixel.g / 127.0 - 1;
      pixel.b = pixel.b / 127.0 - 1;
      pixel.a = pixel.a / 127.0 - 1;
      values[i * NUM_OF_CHANNELS + 0] = pixel.r;
      values[i * NUM_OF_CHANNELS + 1] = pixel.g;
      values[i * NUM_OF_CHANNELS + 2] = pixel.b;
      i++;
    });
    const outShape = [224, 224, NUM_OF_CHANNELS];
    let img_tensor = tf.tensor3d(values, outShape, 'float32');
    img_tensor = img_tensor.expandDims(0);

    const predictions = await model.predict(img_tensor).dataSync();

    output = {};
    output.predictions = predictions;
    console.log(output.predictions);
    var prediction = '';

    switch (cropName) {
      case 'cherry':
        if (output.predictions['0'] === 1) prediction = 'Powdery Mildew';
        if (output.predictions['1'] === 1) prediction = 'Healthy';
        break;
      case 'peach':
        if (output.predictions['0'] === 1) prediction = 'Bacterial Spot';
        if (output.predictions['1'] === 1) prediction = 'Healthy';
        break;
      case 'pepper':
        if (output.predictions['0'] === 1) prediction = 'Bacterial Spot';
        if (output.predictions['1'] === 1) prediction = 'Healthy';
        break;

      default:
        break;
    }
    res.statusCode = 200;

    console.log(prediction);
    res.json({ prediction });

    fs.unlinkSync(imagePath, (error) => {
      if (error) {
        console.error(error);
      }
    });
  } catch (error) {
    console.log(error);
  }
};
