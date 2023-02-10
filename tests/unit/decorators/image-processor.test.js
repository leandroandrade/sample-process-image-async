const path = require('path');
const fs = require('fs');
const fsPromises = require('fs/promises');
const Fastify = require('fastify');
const os = require('os');
const t = require('tap');

const decorator = require('../../../src/decorators/image-processor');

const { test } = t;

test('should process image to webp format', async (t) => {
  const fastify = Fastify();
  t.teardown(fastify.close.bind(fastify));

  await fastify.register(decorator);

  const filename = 'fastify-logo.png';

  const file = fs.createReadStream(path.join(__dirname, '..', '..', 'assets', filename));
  const chunks = [];
  for await (const chunk of file) {
    chunks.push(chunk);
  }
  const imageBase64 = Buffer.concat(chunks).toString('base64');

  const { name } = path.parse(filename);
  const imageName = `${name}-${Date.now()}`;

  const pathToSave = os.tmpdir();

  await fastify.imageProcessor.toWebp({ imageBase64, imageName, pathToSave });

  const existingFiles = fs.readdirSync(pathToSave).filter(f => f.startsWith(imageName));
  t.same(existingFiles.length, 12);

  const filesToDelete = existingFiles.map(file => path.join(pathToSave, file));
  await Promise.all(filesToDelete.map(fsPromises.unlink));

  const filesDeleted = fs.readdirSync(pathToSave).filter(f => f.startsWith(imageName));
  t.same(filesDeleted.length, 0);
});
