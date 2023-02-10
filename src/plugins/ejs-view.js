const fp = require('fastify-plugin');
const fastifyView = require('@fastify/view');
const path = require('path');
const ejs = require('ejs');

async function ejsPlugin(fastify) {
  fastify.register(fastifyView, {
    engine: {
      ejs,
    },
    root: path.join(__dirname, '..', '..', 'public', 'view'),
  });
}

module.exports = fp(ejsPlugin);
