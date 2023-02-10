const fp = require('fastify-plugin');
const sf = require('@fastify/static');
const path = require('path');

async function staticPlugin(fastify) {
  fastify.register(sf, {
    root: path.join(__dirname, '..', '..', 'public'),
  });
}

module.exports = fp(staticPlugin);
