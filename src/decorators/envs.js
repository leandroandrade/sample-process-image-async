const fp = require('fastify-plugin');
const path = require('path');

async function envsDecorator(fastify) {
  const imagesPath = path.join(__dirname, '..', '..', 'public', 'images');

  fastify.decorate('envs', {
    imagesPath,
  });
}

module.exports = fp(envsDecorator, {
  name: 'envs',
});
