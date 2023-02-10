const Fastify = require('fastify');
const t = require('tap');
const crypto = require('crypto');

const fs = require('fs');
const path = require('path');
const os = require('os');
const fsPromises = require('fs/promises');
const decorator = require('../../../src/decorators/image-processor');
const plugin = require('../../../src/plugins/bull-workers');

const { test } = t;

test('should process image sucessfully', async (t) => {
  const fastify = Fastify();
  t.teardown(fastify.close.bind(fastify));

  const pathToSave = os.tmpdir();

  await fastify.register(decorator);
  await fastify.register(plugin, {
    redisOptions: {
      host: 'localhost', port: 6379,
    },
    pathToSave,
  });

  const filename = 'fastify-logo.png';

  const file = fs.createReadStream(path.join(__dirname, '..', '..', 'assets', filename));
  const chunks = [];
  for await (const chunk of file) {
    chunks.push(chunk);
  }
  const imageBase64 = Buffer.concat(chunks).toString('base64');

  const { name } = path.parse(filename);
  const imageName = `${name}-${Date.now()}`;

  const job = {
    data: {
      type: 'processUploadedImages',
      image: {
        id: crypto.randomUUID(),
        name: imageName,
        data: imageBase64,
      },
    },
  };
  const [workerHandler] = fastify.bullmq_workers.handlers;
  await workerHandler(job);

  const existingFiles = fs.readdirSync(pathToSave).filter(f => f.startsWith(imageName));
  t.same(existingFiles.length, 12);

  const filesToDelete = existingFiles.map(file => path.join(pathToSave, file));
  await Promise.all(filesToDelete.map(fsPromises.unlink));

  const filesDeleted = fs.readdirSync(pathToSave).filter(f => f.startsWith(imageName));
  t.same(filesDeleted.length, 0);
});

test('should emit error event', async (t) => {
  const fastify = Fastify();
  t.teardown(fastify.close.bind(fastify));

  const pathToSave = os.tmpdir();

  await fastify.register(decorator);
  await fastify.register(plugin, {
    redisOptions: {
      host: 'localhost', port: 6379,
    },
    pathToSave,
  });

  const [worker] = fastify.bullmq_workers.workers;

  worker.on('error', err => {
    t.same(err.message, 'Kaboom');
  });
  worker.emit('error', new Error('Kaboom'));
});

test('should emit failed event', async (t) => {
  const fastify = Fastify();
  t.teardown(fastify.close.bind(fastify));

  const pathToSave = os.tmpdir();

  await fastify.register(decorator);
  await fastify.register(plugin, {
    redisOptions: {
      host: 'localhost', port: 6379,
    },
    pathToSave,
  });

  const job = {
    data: {
      type: 'processUploadedImages',
      image: {
        id: crypto.randomUUID(),
      },
    },
  };

  const [worker] = fastify.bullmq_workers.workers;

  worker.on('failed', (received, err) => {
    t.same(job.data.image.id, received.data.image.id);
    t.same(err.message, 'Kaboom');
  });
  worker.emit('failed', job, new Error('Kaboom'));
});
