const Fastify = require('fastify');
const autoLoad = require('@fastify/autoload');
const { randomUUID: uuid } = require('crypto');
const { join } = require('path');
const path = require('path');

function buildApp() {
  const app = Fastify({
    logger: false,
    genReqId(req) {
      return uuid();
    },
    ajv: {
      customOptions: {
        removeAdditional: true,
        coerceTypes: 'array',
        useDefaults: true,
      },
    },
  });

  app.register(autoLoad, {
    dir: join(__dirname, 'plugins'),
    options: {
      redisOptions: {
        host: 'localhost', port: 6379,
      },
      pathToSave: path.join(__dirname, '..', 'public', 'images'),
    },
  });

  app.register(autoLoad, {
    dir: join(__dirname, 'decorators'),
  });

  app.register(autoLoad, {
    dir: join(__dirname, 'routes'),
    options: { prefix: 'api' },
  });

  app.register(autoLoad, {
    dir: join(__dirname, 'views'),
  });

  return app;
}

module.exports = buildApp;
