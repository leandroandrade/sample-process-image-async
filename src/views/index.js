const { access, constants, readdir } = require('fs/promises');

module.exports = async (fastify, opts) => {
  fastify.get('/', (req, reply) => {
    return reply.view('form');
  });

  async function canAccessDir(path) {
    try {
      await access(path, constants.R_OK);
      return true;
    } catch {
      return false;
    }
  }

  fastify.get('/result', async (req, reply) => {
    const canAccess = await canAccessDir(fastify.envs.imagesPath);
    if (!canAccess) {
      return reply.view('result', { imgFiles: [] });
    }

    const dir = await readdir(fastify.envs.imagesPath);
    const images = dir.map((image) => `/images/${image}`);
    return reply.view('result', { imgFiles: images });
  });
};
