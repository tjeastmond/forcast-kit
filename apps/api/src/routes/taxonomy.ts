import { logger, pickDefined, type ProviderId } from '@forecast-kit/core';
import type { FastifyPluginCallback } from 'fastify';
import { parseLimit } from '../utils.js';

export const taxonomyRoutes: FastifyPluginCallback = (app, _opts, done) => {
  app.get('/taxonomy', async (request) => {
    const query = request.query as Record<string, unknown>;
    const provider = (typeof query['provider'] === 'string' ? query['provider'] : 'kalshi') as ProviderId;

    let categories = await app.repos.taxonomy.listCategories(provider);
    let syncedAt = await app.taxonomy.getTaxonomySyncedAt(provider);

    if (categories.length === 0) {
      try {
        const result = await app.taxonomy.syncKalshiTaxonomy();
        syncedAt = result.syncedAt;
        categories = await app.repos.taxonomy.listCategories(provider);
      } catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        logger.warn({
          component: 'api',
          msg: 'taxonomy lazy sync failed; falling back to stored events',
          provider,
          error: message,
        });
      }
    }

    if (categories.length === 0) {
      categories = await app.repos.taxonomy.listFallbackCategoriesFromEvents(provider);
    }

    return {
      provider,
      syncedAt,
      categories: categories.map((entry) => ({
        name: entry.category,
        tags: entry.tags,
      })),
    };
  });

  app.get('/taxonomy/tags', async (request) => {
    const query = request.query as Record<string, unknown>;
    const provider = (typeof query['provider'] === 'string' ? query['provider'] : 'kalshi') as ProviderId;

    let tags = await app.repos.taxonomy.listAllTags(provider);

    if (tags.length === 0) {
      const categories = await app.repos.taxonomy.listCategories(provider);
      const tagSet = new Set<string>();
      for (const entry of categories) {
        for (const tag of entry.tags) {
          tagSet.add(tag);
        }
      }
      tags = [...tagSet].sort((left, right) => left.localeCompare(right));
    }

    return { provider, tags };
  });

  app.get('/taxonomy/series', async (request) => {
    const query = request.query as Record<string, unknown>;
    const provider = (typeof query['provider'] === 'string' ? query['provider'] : 'kalshi') as ProviderId;
    const category = typeof query['category'] === 'string' ? query['category'] : undefined;
    const limit = parseLimit(typeof query['limit'] === 'string' ? query['limit'] : undefined);

    const series = await app.repos.taxonomy.listSeries(provider, pickDefined({ category, limit }));

    return { provider, series };
  });

  done();
};
