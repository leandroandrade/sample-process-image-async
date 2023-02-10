const fp = require('fastify-plugin');
const { Queue } = require('bullmq');

async function plugin(fastify, options) {
  const imageJobQueue = new Queue('imageJobQueue', {
    connection: options.redisOptions,
  });
  await imageJobQueue.waitUntilReady();

  fastify.addHook('onClose', async () => {
    await imageJobQueue.close();
  });

  const addJob = async (job) => {
    await imageJobQueue.add(job.type, job);
  };

  fastify.decorate('bullmq', {
    queues: [imageJobQueue],
    addJob,
  });
}

const fastifyBullmq = fp(plugin);

async function bullmqPlugin(fastify, opts) {
  fastify.register(fastifyBullmq, opts);
}

module.exports = fp(bullmqPlugin, {
  name: 'bullmq',
});
