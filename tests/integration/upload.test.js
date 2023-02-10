const t = require('tap');
const formAutoContent = require('form-auto-content');
const fs = require('fs');
const path = require('path');
const ejs = require('ejs');

const { buildApp } = require('../shared/helper');

const { test } = t;

test('should upload a single file', async t => {
  const fastify = buildApp(t);
  await fastify.ready();

  const filename = 'fastify-logo.png';
  const form = formAutoContent({
    file: fs.createReadStream(path.join(__dirname, '..', 'assets', filename)),
  });

  const res = await fastify.inject({
    method: 'POST',
    url: '/api/upload',
    ...form,
  });

  t.same(res.statusCode, 302);
  t.same(res.headers.location, '/result');
});

test('should validate `addJob` in upload a single file', async t => {
  const fastify = buildApp(t);
  await fastify.ready();

  const addJob = job => {
    t.ok(job.image.id);
    t.ok(job.image.name);
    t.ok(job.image.data);
    t.equal(job.type, 'processUploadedImages');
  };
  fastify.bullmq = {
    addJob,
  };

  const filename = 'fastify-logo.png';
  const form = formAutoContent({
    file: fs.createReadStream(path.join(__dirname, '..', 'assets', filename)),
  });

  const res = await fastify.inject({
    method: 'POST',
    url: '/api/upload',
    ...form,
  });

  t.same(res.statusCode, 302);
  t.same(res.headers.location, '/result');
});

test('should return upload page', async t => {
  const fastify = buildApp(t);

  const res = await fastify.inject({
    method: 'GET',
    url: '/',
  });

  t.equal(res.statusCode, 200);
  t.equal(res.headers['content-length'], `${res.body.length}`);
  t.equal(res.headers['content-type'], 'text/html; charset=utf-8');

  const form = fs.readFileSync(path.join(__dirname, '..', '..', 'public', 'view', 'form.ejs'), 'utf8');
  const html = ejs.compile(form, {
    cache: false,
    filename: path.join(__dirname, '..', '..', 'public', 'view', 'form.ejs'),
  });
  t.equal(html(), res.body.toString());
});
