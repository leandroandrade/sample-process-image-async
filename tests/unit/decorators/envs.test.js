const Fastify = require('fastify');
const t = require('tap');

const { test } = t;
const envsDecorator = require('../../../src/decorators/envs');

test('should return path image when environment is `development`', async (t) => {
  const fastify = Fastify();
  t.teardown(fastify.close.bind(fastify));

  await fastify.register(envsDecorator, {
    environment: 'development',
  });

  t.ok(fastify.envs.imagesPath.length > 0);
});

// test('should return path image when environment is `production`', async (t) => {
//   const fastify = Fastify();
//   t.teardown(fastify.close.bind(fastify));
//
//   await fastify.register(envsDecorator, {
//     options: { environment: 'production' },
//   });
//
//   t.ok(fastify.envs.imagesPath.length > 0);
// });
//
// test('should return path image when environment does not exists', async (t) => {
//   const fastify = Fastify();
//   t.teardown(fastify.close.bind(fastify));
//
//   await fastify.register(envsDecorator);
//
//   t.ok(fastify.envs.imagesPath.length > 0);
// });
