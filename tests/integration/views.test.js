const t = require('tap');
const fs = require('fs');
const path = require('path');
const ejs = require('ejs');
const os = require('os');

const formAutoContent = require('form-auto-content');
const { buildApp } = require('../shared/helper');

const { test } = t;

test('should return result page with empty results', async t => {
  const fastify = buildApp(t);
  await fastify.ready();

  fastify.envs = {
    imagesPath: `${os.tmpdir()}/${Date.now()}`,
  };

  const res = await fastify.inject({
    method: 'GET',
    url: '/result',
  });

  t.equal(res.statusCode, 200);
  t.equal(res.headers['content-length'], `${res.body.length}`);
  t.equal(res.headers['content-type'], 'text/html; charset=utf-8');

  const form = fs.readFileSync(path.join(__dirname, '..', '..', 'public', 'view', 'result.ejs'), 'utf8');
  const html = ejs.compile(form, {
    cache: false,
    filename: path.join(__dirname, '..', '..', 'public', 'view', 'result.ejs'),
  });

  t.equal(html({ imgFiles: [] }), res.body.toString());
});

test('should return result page with image results', async t => {
  const fastify = buildApp(t);
  await fastify.ready();

  const imagesPath = `${os.tmpdir()}/${Date.now()}`;

  fastify.envs = {
    imagesPath,
  };

  await fs.promises.mkdir(imagesPath);

  const filename = 'fastify-logo.png';
  const from = fs.createReadStream(path.join(__dirname, '..', 'assets', filename));
  const to = fs.createWriteStream(path.join(imagesPath, filename));
  from.pipe(to);

  const res = await fastify.inject({
    method: 'GET',
    url: '/result',
  });

  t.equal(res.statusCode, 200);
  t.equal(res.headers['content-length'], `${res.body.length}`);
  t.equal(res.headers['content-type'], 'text/html; charset=utf-8');

  const form = fs.readFileSync(path.join(__dirname, '..', '..', 'public', 'view', 'result.ejs'), 'utf8');
  const html = ejs.compile(form, {
    cache: false,
    filename: path.join(__dirname, '..', '..', 'public', 'view', 'result.ejs'),
  });

  const data = await fs.promises.readdir(fastify.envs.imagesPath);
  const images = data.map(image => `/images/${image}`);

  const a = html({ imgFiles: images });
  const b = res.body.toString();

  await fs.promises.rm(imagesPath, { force: true, recursive: true });

  t.equal(a, b);
});
