const fp = require('fastify-plugin');
const { Worker } = require('bullmq');

async function plugin(fastify, options) {
  const workerHandler = async (job) => {
    const { image } = job.data;
    const { id, name, data } = image;

    fastify.log.info(`>> Job worker processing image ${id}...`);

    await fastify.imageProcessor.toWebp({
      imageBase64: data,
      imageName: name,
      pathToSave: options.pathToSave,
    });
  };

  const imageWorker = new Worker('imageJobQueue', workerHandler, {
    connection: options.redisOptions,
  });

  imageWorker.on('completed', (job, returnvalue) => {
    const { image } = job.data;
    const { id } = image;
    fastify.log.info(`>> Job worker processed image ${id} sucessfully!`);
  });

  imageWorker.on('error', err => {
    fastify.log.error('Unexpected Error:', err);
  });

  imageWorker.on('failed', (job, error) => {
    const { image } = job.data;
    const { id } = image;
    fastify.log.info(`[throw new Error] and [Promise reject] will be received here -  job [${id}]:`, error);
  });

  fastify.addHook('onClose', async () => {
    await imageWorker.close();
  });

  fastify.decorate('bullmq_workers', {
    handlers: [workerHandler],
    workers: [imageWorker],
  });
}

const fastifyBullmqWorkers = fp(plugin);

async function bullmqWorkerPlugin(fastify, opts) {
  fastify.register(fastifyBullmqWorkers, opts);
}

module.exports = fp(bullmqWorkerPlugin);
