const t = require('tap');
const { buildApp } = require('../shared/helper');

const { test } = t;

test('should return sample response', async (t) => {
  const fastify = buildApp(t);

  const res = await fastify.inject({
    method: 'GET',
    url: '/ui',
  });

  t.equal(res.statusCode, 200);
  t.equal(res.headers['content-length'], `${res.body.length}`);
  t.equal(res.headers['content-type'], 'text/html; charset=utf-8');
  t.ok(res.payload);
});
