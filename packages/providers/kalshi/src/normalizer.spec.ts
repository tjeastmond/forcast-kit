import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';
import { kalshiEventsResponseSchema } from './schemas.js';
import { deriveMarketSubtitle, normalizeEventWithMarkets } from './normalizer.js';

const fixturePath = join(dirname(fileURLToPath(import.meta.url)), '../fixtures/events-page.json');

describe('normalizeEventWithMarkets', () => {
  it('maps Kalshi fixture to normalized domain models', () => {
    const raw: unknown = JSON.parse(readFileSync(fixturePath, 'utf8'));
    const response = kalshiEventsResponseSchema.parse(raw);
    const event = response.events[0];
    expect(event).toBeDefined();
    if (!event) {
      return;
    }

    const batch = normalizeEventWithMarkets(event);

    expect(batch.events).toHaveLength(1);
    expect(batch.markets.length).toBeGreaterThanOrEqual(1);
    expect(batch.sides.length).toBeGreaterThanOrEqual(2);

    const normalizedEvent = batch.events[0];
    expect(normalizedEvent).toBeDefined();
    if (!normalizedEvent) {
      return;
    }
    expect(normalizedEvent.provider).toBe('kalshi');
    expect(normalizedEvent.eventTicker).toBeTruthy();
    expect(normalizedEvent.settlementSources.length).toBeGreaterThan(0);

    const market = batch.markets[0];
    expect(market).toBeDefined();
    if (!market) {
      return;
    }
    expect(market.ticker).toBeTruthy();
    expect(market.yesBid).toBeGreaterThan(0);
    expect(market.status).toBe('active');

    const yesSide = batch.sides.find((side) => side.side === 'yes');
    const noSide = batch.sides.find((side) => side.side === 'no');
    expect(yesSide?.investable).toBe(true);
    expect(noSide?.side).toBe('no');
  });

  it('accepts settlement sources with missing names', () => {
    const response = kalshiEventsResponseSchema.parse({
      events: [
        {
          event_ticker: 'KXTEST-1',
          series_ticker: 'KXTEST',
          title: 'Test event',
          settlement_sources: [
            { name: 'Reuters', url: 'https://www.reuters.com' },
            { url: 'https://example.com' },
            { name: '', url: 'https://example.org' },
          ],
        },
      ],
    });

    const event = response.events[0];
    expect(event).toBeDefined();
    if (!event) {
      return;
    }

    const batch = normalizeEventWithMarkets(event);
    expect(batch.events[0]?.settlementSources).toEqual(['Reuters']);
  });

  it('maps yes_sub_title to market subtitle for mention-style markets', () => {
    expect(
      deriveMarketSubtitle({
        ticker: 'KXTRUMPMENTION-26JUN23-IRAN',
        event_ticker: 'KXTRUMPMENTION-26JUN23',
        title: 'What will Donald Trump say during Remarks at Mack Trucks?',
        status: 'active',
        market_type: 'binary',
        close_time: '2026-07-08T14:00:00Z',
        open_time: '2026-06-22T15:33:00Z',
        yes_sub_title: 'Iran (5+ times)',
        no_sub_title: 'Iran (5+ times)',
        custom_strike: { Word: 'Iran (5+ times)' },
      }),
    ).toBe('Iran (5+ times)');
  });
});
