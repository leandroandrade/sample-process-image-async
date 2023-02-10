const fp = require('fastify-plugin');
const {
  FastifyAdapter,
  createBullBoard,
  BullMQAdapter,
} = require('@bull-board/fastify');

async function handler(fastify) {
  const serverAdapter = new FastifyAdapter();

  const { queues } = fastify.bullmq;
  const queuesBullMQAdapter = queues.map(queue => new BullMQAdapter(queue, {
    description: 'Image Processor',
  }));

  const options = {
    uiConfig: {
      boardTitle: 'Main Board',
    },
  };
  createBullBoard({
    queues: queuesBullMQAdapter,
    serverAdapter,
    options,
  });
  serverAdapter.setBasePath('/ui');

  fastify.register(serverAdapter.registerPlugin(), {
    prefix: '/ui',
  });
}

const fastifyBullmq = fp(handler);

async function bullmqPlugin(fastify, opts) {
  fastify.register(fastifyBullmq);
}

module.exports = fp(bullmqPlugin, {
  dependencies: ['bullmq'],
});
