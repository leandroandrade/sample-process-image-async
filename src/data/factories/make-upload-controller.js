const { UploadController } = require('../controllers/upload-controller');

exports.makeUploadController = fastify => new UploadController(fastify);
