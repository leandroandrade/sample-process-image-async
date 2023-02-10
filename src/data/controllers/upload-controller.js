const path = require('path');
const { randomUUID: uuidv4 } = require('crypto');

class UploadController {
  constructor(fastify) {
    this.fastify = fastify;
  }

  async handle(req, reply) {
    const data = await req.file();

    // TODO add file validation
    // if (!data) return res.sendStatus(400)

    const { filename, file } = data;
    const { name } = path.parse(filename);

    const chunks = [];
    for await (const chunk of file) {
      chunks.push(chunk);
    }

    const imageBinaryToStringBase64 = Buffer.concat(chunks).toString('base64');
    // TODO esse id pode ser gerado no bullmq [add(job.type, job, {jobId: 'some_id'})]
    const id = uuidv4();

    await this.fastify.bullmq.addJob({
      type: 'processUploadedImages',
      image: {
        id,
        name,
        data: imageBinaryToStringBase64,
      },
    });

    return reply.redirect('/result');
  }
}

module.exports = {
  UploadController,
};
