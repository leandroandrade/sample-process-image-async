const fp = require('fastify-plugin');
const path = require('path');
const sharp = require('sharp');

const sizes = [90, 96, 120, 144, 160, 180, 240, 288, 360, 480, 720, 1440];

async function toWebp({ imageBase64, imageName, pathToSave }) {
  const binary = Buffer.from(imageBase64, 'base64');

  const processImage = (size) => sharp(binary)
    .resize(size, size)
    .webp({ lossless: true })
    .toFile(path.join(pathToSave, `${imageName}-${size}.webp`));

  const toProces = sizes.map(processImage);

  await Promise.all(toProces);
}

async function imageProcessorDecorator(fastify) {
  fastify.decorate('imageProcessor', {
    toWebp,
  });
}

module.exports = fp(imageProcessorDecorator);
