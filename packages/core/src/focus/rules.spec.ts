import { describe, expect, it } from 'vitest';
import type { NormalizedMarket } from '../types/index.js';
import { deriveFocusTags, matchesFocusFilter } from './rules.js';

const politicsMarket: NormalizedMarket = {
  provider: 'kalshi',
  externalMarketId: 'KXPRES-24',
  ticker: 'KXPRES-24-DEM',
  eventTicker: 'KXPRES-24',
  seriesTicker: 'KXPRES',
  title: 'Will a Democrat win the 2024 presidential election?',
  subtitle: '',
  category: 'Politics',
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

describe('deriveFocusTags', () => {
  it('tags politics markets by category and series prefix', () => {
    const tags = deriveFocusTags(politicsMarket);
    expect(tags).toContain('politics');
  });

  it('tags weather markets by series prefix', () => {
    const market: NormalizedMarket = {
      ...politicsMarket,
      category: 'Climate and Weather',
      seriesTicker: 'KXHIGHNY',
      ticker: 'KXHIGHNY-25JUN22-T75',
      title: 'High temp in NYC on Jun 22, 2025?',
    };
    const tags = deriveFocusTags(market);
    expect(tags).toContain('weather');
  });

  it('does not tag DNC chair markets as technology from AI substring in Chair', () => {
    const market: NormalizedMarket = {
      ...politicsMarket,
      ticker: 'KXNEXTDNCCHAIR-45-PBUT',
      eventTicker: 'KXNEXTDNCCHAIR-45',
      seriesTicker: 'KXNEXTDNCCHAIR',
      title: 'Will Pete Buttigieg be the next DNC Chair?',
      category: 'Politics',
    };
    const tags = deriveFocusTags(market);
    expect(tags).toContain('politics');
    expect(tags).not.toContain('technology');
  });

  it('still tags technology markets when AI appears as a word', () => {
    const market: NormalizedMarket = {
      ...politicsMarket,
      category: 'Science and Technology',
      title: 'Will AI surpass human intelligence by 2030?',
    };
    const tags = deriveFocusTags(market);
    expect(tags).toContain('technology');
  });

  it('tags politician-focused markets by series prefix and role keywords', () => {
    const chairMarket: NormalizedMarket = {
      ...politicsMarket,
      ticker: 'KXNEXTDNCCHAIR-45-PBUT',
      eventTicker: 'KXNEXTDNCCHAIR-45',
      seriesTicker: 'KXNEXTDNCCHAIR',
      title: 'Will Pete Buttigieg be the next DNC Chair?',
    };
    expect(deriveFocusTags(chairMarket)).toContain('politicians');

    const nomineeMarket: NormalizedMarket = {
      ...politicsMarket,
      seriesTicker: 'KXELECT',
      title: 'Will the Republican nominee win Pennsylvania?',
    };
    expect(deriveFocusTags(nomineeMarket)).toContain('politicians');
  });

  it('tags mention markets by keyword and series prefix', () => {
    const keywordMarket: NormalizedMarket = {
      ...politicsMarket,
      seriesTicker: 'KXDEBATE',
      title: 'Will the moderator mention climate change during the debate?',
    };
    expect(deriveFocusTags(keywordMarket)).toContain('mentions');

    const seriesMarket: NormalizedMarket = {
      ...politicsMarket,
      seriesTicker: 'KXMENTIONDEBATE',
      ticker: 'KXMENTIONDEBATE-25-TARIFF',
      title: 'Tariffs mentioned in the debate?',
    };
    expect(deriveFocusTags(seriesMarket)).toContain('mentions');

    const trumpMentionMarket: NormalizedMarket = {
      ...politicsMarket,
      category: 'Mentions',
      seriesTicker: 'KXTRUMPMENTION',
      ticker: 'KXTRUMPMENTION-26JUN23-NQE',
      eventTicker: 'KXTRUMPMENTION-26JUN23',
      title: 'What will Donald Trump say during Remarks at Mack Trucks?',
    };
    expect(deriveFocusTags(trumpMentionMarket)).toContain('mentions');
  });
});

describe('matchesFocusFilter', () => {
  it('includes markets matching any focus tag', () => {
    expect(matchesFocusFilter(['politics', 'economics'], { focus: ['politics'] })).toBe(true);
    expect(matchesFocusFilter(['economics'], { focus: ['politics'] })).toBe(false);
  });

  it('excludes markets matching exclude tags', () => {
    expect(matchesFocusFilter(['politics'], { exclude: ['sports'] })).toBe(true);
    expect(matchesFocusFilter(['politics', 'sports'], { exclude: ['sports'] })).toBe(false);
  });

  it('applies include then exclude when both provided', () => {
    expect(
      matchesFocusFilter(['politics', 'weather'], {
        focus: ['politics', 'weather'],
        exclude: ['sports'],
      }),
    ).toBe(true);
    expect(
      matchesFocusFilter(['politics', 'sports'], {
        focus: ['politics'],
        exclude: ['sports'],
      }),
    ).toBe(false);
  });
});
