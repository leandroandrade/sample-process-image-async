const { makeUploadController } = require('../../data/factories/make-upload-controller');

module.exports = async (fastify, opts) => {
  fastify.post('/', async (req, reply) => {
    return makeUploadController(fastify).handle(req, reply);
  });
};
