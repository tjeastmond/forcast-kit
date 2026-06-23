import type { FastifyPluginCallback } from 'fastify';

const ALLOWED_ORIGINS = new Set(['http://127.0.0.1:3848', 'http://localhost:3848']);

export const corsPlugin: FastifyPluginCallback = (app, _opts, done) => {
  app.addHook('onRequest', async (request, reply) => {
    const origin = request.headers.origin;
    if (origin && ALLOWED_ORIGINS.has(origin)) {
      reply.header('Access-Control-Allow-Origin', origin);
      reply.header('Access-Control-Allow-Methods', 'GET, POST, PATCH, PUT, OPTIONS');
      reply.header('Access-Control-Allow-Headers', 'Content-Type');
    }

    if (request.method === 'OPTIONS') {
      await reply.code(204).send();
    }
  });

  done();
};
