import { createRepositories } from '@forecast-kit/db/repositories';
import { createTaxonomySyncService } from '@forecast-kit/db/taxonomy';
import { createTestDatabase } from '@forecast-kit/db/test-utils';
import Fastify from 'fastify';
import { describe, expect, it } from 'vitest';
import { taxonomyRoutes } from './taxonomy.js';

describe('taxonomy routes', () => {
  it('returns synced categories from the database', async () => {
    const db = createTestDatabase();
    const repos = createRepositories(db);

    await repos.taxonomy.replaceCategoriesAndTags('kalshi', [
      { category: 'Politics', tags: ['US Elections'] },
      { category: 'Sports', tags: ['NFL'] },
    ]);

    await repos.syncState.set('kalshi:taxonomy_synced_at', '2025-01-15T12:00:00.000Z');

    const app = Fastify({ logger: false });
    app.decorate('repos', repos);
    app.decorate(
      'taxonomy',
      createTaxonomySyncService(repos, {
        fetchTagsByCategories: () => Promise.resolve({ tags_by_categories: {} }),
        fetchAllSeries: () => Promise.resolve([]),
      }),
    );
    await app.register(taxonomyRoutes);

    const response = await app.inject({ method: 'GET', url: '/taxonomy' });
    expect(response.statusCode).toBe(200);

    const body: {
      syncedAt: string;
      categories: { name: string; tags: string[] }[];
    } = response.json();

    expect(body.syncedAt).toBe('2025-01-15T12:00:00.000Z');
    expect(body.categories).toEqual(
      expect.arrayContaining([
        { name: 'Politics', tags: ['US Elections'] },
        { name: 'Sports', tags: ['NFL'] },
      ]),
    );
  });

  it('lazy-syncs taxonomy when the database is empty', async () => {
    const db = createTestDatabase();
    const repos = createRepositories(db);

    const app = Fastify({ logger: false });
    app.decorate('repos', repos);
    app.decorate(
      'taxonomy',
      createTaxonomySyncService(repos, {
        fetchTagsByCategories: () =>
          Promise.resolve({
            tags_by_categories: {
              Politics: ['US Elections'],
              Sports: ['NFL'],
            },
          }),
        fetchAllSeries: () => Promise.resolve([]),
      }),
    );
    await app.register(taxonomyRoutes);

    const response = await app.inject({ method: 'GET', url: '/taxonomy' });
    expect(response.statusCode).toBe(200);

    const body: {
      syncedAt: string | null;
      categories: { name: string; tags: string[] }[];
    } = response.json();

    expect(body.syncedAt).not.toBeNull();
    expect(body.categories).toEqual(
      expect.arrayContaining([
        { name: 'Politics', tags: ['US Elections'] },
        { name: 'Sports', tags: ['NFL'] },
      ]),
    );
  });
});
