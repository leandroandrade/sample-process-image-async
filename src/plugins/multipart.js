const fp = require('fastify-plugin');
const multipart = require('@fastify/multipart');

async function multipartPlugin(fastify) {
  fastify.register(multipart);
}

module.exports = fp(multipartPlugin);
