import type { FastifyPluginCallback } from 'fastify';
import { focusTagsUpdateSchema, marketPartialUpdateSchema } from '../schemas/admin.js';

export const adminRoutes: FastifyPluginCallback = (app, _opts, done) => {
  app.patch('/admin/markets/:ticker', async (request, reply) => {
    const { ticker } = request.params as { ticker: string };
    const parsed = marketPartialUpdateSchema.safeParse(request.body ?? {});
    if (!parsed.success) {
      reply.code(400);
      return { error: 'Invalid request body', details: parsed.error.flatten() };
    }

    const body = parsed.data;
    const marketId = await app.repos.markets.updatePartial(ticker, {
      ...(body.title !== undefined ? { title: body.title } : {}),
      ...(body.subtitle !== undefined ? { subtitle: body.subtitle } : {}),
      ...(body.status !== undefined ? { status: body.status } : {}),
      ...(body.yesBid !== undefined ? { yesBid: body.yesBid } : {}),
      ...(body.yesAsk !== undefined ? { yesAsk: body.yesAsk } : {}),
      ...(body.noBid !== undefined ? { noBid: body.noBid } : {}),
      ...(body.noAsk !== undefined ? { noAsk: body.noAsk } : {}),
      ...(body.lastPrice !== undefined ? { lastPrice: body.lastPrice } : {}),
      ...(body.isStale !== undefined ? { isStale: body.isStale } : {}),
    });
    if (marketId === null) {
      reply.code(404);
      return { error: 'Market not found' };
    }

    const market = await app.query.markets.getMarketByTicker(ticker);
    if (!market) {
      reply.code(404);
      return { error: 'Market not found' };
    }

    return market;
  });

  app.put('/admin/markets/:ticker/focus-tags', async (request, reply) => {
    const { ticker } = request.params as { ticker: string };
    const parsed = focusTagsUpdateSchema.safeParse(request.body ?? {});
    if (!parsed.success) {
      reply.code(400);
      return { error: 'Invalid request body', details: parsed.error.flatten() };
    }

    const market = await app.query.markets.getMarketByTicker(ticker);
    if (!market) {
      reply.code(404);
      return { error: 'Market not found' };
    }

    await app.repos.marketFocusTags.replaceTags(market.id, parsed.data.focusTags);

    const updated = await app.query.markets.getMarketByTicker(ticker);
    if (!updated) {
      reply.code(404);
      return { error: 'Market not found' };
    }

    return updated;
  });

  done();
};
