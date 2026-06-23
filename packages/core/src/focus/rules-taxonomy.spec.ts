import { describe, expect, it } from 'vitest';
import { deriveFocusTags } from './rules.js';
import type { NormalizedMarket } from '../types/index.js';

const baseMarket: NormalizedMarket = {
  provider: 'kalshi',
  externalMarketId: 'KXHIGHNY-25JUN22-T75',
  ticker: 'KXHIGHNY-25JUN22-T75',
  eventTicker: 'KXHIGHNY-25JUN22',
  seriesTicker: 'KXHIGHNY',
  title: 'High temp in NYC on Jun 22, 2025?',
  subtitle: '',
  category: null,
  marketType: 'binary',
  status: 'open',
  openTime: new Date(),
  closeTime: new Date(),
  expirationTime: null,
  volume: 0,
  volume24h: 0,
  liquidity: 0,
  openInterest: 0,
  yesBid: null,
  yesAsk: null,
  noBid: null,
  noAsk: null,
  lastPrice: null,
  rulesPrimary: null,
  rulesSecondary: null,
  rawJson: {},
};

describe('deriveFocusTags with series metadata', () => {
  it('tags weather from synced series category when market category is missing', () => {
    const tags = deriveFocusTags(baseMarket, {
      seriesMetadata: { category: 'Climate and Weather', tags: ['Temperature'] },
    });
    expect(tags).toContain('weather');
  });

  it('tags politics from synced kalshi tags when rule defines kalshiTags match', () => {
    const market: NormalizedMarket = {
      ...baseMarket,
      seriesTicker: 'KXPRES',
      title: 'Presidential market',
    };
    const tags = deriveFocusTags(market, {
      seriesMetadata: { category: 'Politics', tags: ['US Elections'] },
    });
    expect(tags).toContain('politics');
  });
});
