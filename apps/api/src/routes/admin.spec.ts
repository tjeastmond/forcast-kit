import { deriveFocusTags } from '@forecast-kit/core';
import type { NormalizedMarket } from '@forecast-kit/core';
import { createQueryServices } from '@forecast-kit/db/query';
import { createRepositories } from '@forecast-kit/db/repositories';
import { createTestDatabase } from '@forecast-kit/db/test-utils';
import Fastify from 'fastify';
import { describe, expect, it } from 'vitest';
import { adminRoutes } from './admin.js';

const politicsMarket: NormalizedMarket = {
  provider: 'kalshi',
  externalMarketId: 'KXPRES-24-DEM',
  ticker: 'KXPRES-24-DEM',
  eventTicker: 'KXPRES-24',
  seriesTicker: 'KXPRES',
  title: 'Democrat wins 2024 election?',
  subtitle: '',
  category: 'Politics',
  marketType: 'binary',
  status: 'open',
  openTime: new Date('2025-01-01T00:00:00Z'),
  closeTime: new Date('2026-01-01T00:00:00Z'),
  expirationTime: null,
  volume: 100,
  volume24h: 10,
  liquidity: 5,
  openInterest: 50,
  yesBid: 0.4,
  yesAsk: 0.42,
  noBid: 0.58,
  noAsk: 0.6,
  lastPrice: 0.41,
  rulesPrimary: 'Test rules',
  rulesSecondary: null,
  rawJson: {},
};

describe('API admin routes', () => {
  it('patches market fields', async () => {
    const db = createTestDatabase();
    const repos = createRepositories(db);
    const marketId = await repos.markets.upsert(politicsMarket);
    await repos.marketFocusTags.replaceTags(marketId, deriveFocusTags(politicsMarket));

    const app = Fastify({ logger: false });
    app.decorate('repos', repos);
    app.decorate('query', createQueryServices(db));
    await app.register(adminRoutes);

    const response = await app.inject({
      method: 'PATCH',
      url: '/admin/markets/KXPRES-24-DEM',
      payload: { title: 'Patched title', isStale: true },
    });

    expect(response.statusCode).toBe(200);
    const body: { title: string; isStale: boolean } = response.json();
    expect(body.title).toBe('Patched title');
    expect(body.isStale).toBe(true);
  });

  it('replaces focus tags', async () => {
    const db = createTestDatabase();
    const repos = createRepositories(db);
    const marketId = await repos.markets.upsert(politicsMarket);
    await repos.marketFocusTags.replaceTags(marketId, deriveFocusTags(politicsMarket));

    const app = Fastify({ logger: false });
    app.decorate('repos', repos);
    app.decorate('query', createQueryServices(db));
    await app.register(adminRoutes);

    const response = await app.inject({
      method: 'PUT',
      url: '/admin/markets/KXPRES-24-DEM/focus-tags',
      payload: { focusTags: ['economics'] },
    });

    expect(response.statusCode).toBe(200);
    const body: { focusTags: string[] } = response.json();
    expect(body.focusTags).toEqual(['economics']);
  });
});
