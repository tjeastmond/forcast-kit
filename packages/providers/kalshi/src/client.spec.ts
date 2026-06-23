import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, expect, it, vi, afterEach } from 'vitest';
import { KalshiClient } from './client.js';

const fixtureDir = join(dirname(fileURLToPath(import.meta.url)), '../fixtures');

describe('KalshiClient taxonomy endpoints', () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('fetches tags by categories', async () => {
    const payload = JSON.parse(readFileSync(join(fixtureDir, 'tags-by-categories.json'), 'utf8')) as {
      tags_by_categories: Record<string, string[] | null>;
    };
    vi.stubGlobal(
      'fetch',
      vi.fn(() =>
        Promise.resolve({
          ok: true,
          status: 200,
          headers: { get: () => null },
          json: () => Promise.resolve(payload),
        }),
      ),
    );

    const client = new KalshiClient({
      baseUrl: 'https://example.test/trade-api/v2',
      pageLimit: 200,
      requestDelayMs: 0,
    });

    const response = await client.fetchTagsByCategories();
    expect(response.tags_by_categories['Politics']).toEqual(['US Elections', 'Congress', 'Presidential']);
    expect(response.tags_by_categories['Science and Technology']).toBeNull();
  });

  it('fetches series list with filters', async () => {
    const payload = JSON.parse(readFileSync(join(fixtureDir, 'series-list.json'), 'utf8')) as {
      series: { ticker: string }[];
    };
    const fetchMock = vi.fn((_url: URL) =>
      Promise.resolve({
        ok: true,
        status: 200,
        headers: { get: () => null },
        json: () => Promise.resolve(payload),
      }),
    );
    vi.stubGlobal('fetch', fetchMock);

    const client = new KalshiClient({
      baseUrl: 'https://example.test/trade-api/v2',
      pageLimit: 200,
      requestDelayMs: 0,
    });

    const response = await client.fetchSeriesList({
      category: 'Politics',
      includeVolume: true,
      includeProductMetadata: true,
    });

    expect(response.series).toHaveLength(2);
    expect(response.series[0]?.ticker).toBe('KXPRES');
    expect(String(fetchMock.mock.calls[0]?.[0])).toContain('/series?');
  });
});
