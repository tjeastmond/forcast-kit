import { describe, expect, it } from 'vitest';
import {
  compareMarketsByPayoutLikelihood,
  resolveImpliedProbability,
  resolveNoImpliedProbability,
  sortMarketsByPayoutLikelihood,
  type MarketPayoutSortInput,
} from './sort-markets.js';

describe('resolveImpliedProbability', () => {
  it('prefers explicit impliedProbability from API metrics', () => {
    expect(
      resolveImpliedProbability({
        impliedProbability: 0.72,
        lastPrice: 0.5,
        yesBid: 0.4,
        yesAsk: 0.6,
      }),
    ).toBe(0.72);
  });

  it('derives from lastPrice when impliedProbability is absent', () => {
    expect(
      resolveImpliedProbability({
        lastPrice: 0.55,
        yesBid: 0.4,
        yesAsk: 0.6,
      }),
    ).toBe(0.55);
  });

  it('derives from yes mid when lastPrice is absent', () => {
    expect(
      resolveImpliedProbability({
        yesBid: 0.4,
        yesAsk: 0.6,
      }),
    ).toBe(0.5);
  });

  it('returns null when no pricing fields are available', () => {
    expect(resolveImpliedProbability({})).toBeNull();
  });
});

describe('resolveNoImpliedProbability', () => {
  it('derives from no bid/ask mid when available', () => {
    expect(
      resolveNoImpliedProbability({
        noBid: 0.58,
        noAsk: 0.62,
      }),
    ).toBeCloseTo(0.6);
  });

  it('complements yes implied when no bid/ask are absent', () => {
    expect(
      resolveNoImpliedProbability({
        impliedProbability: 0.41,
      }),
    ).toBeCloseTo(0.59);
  });

  it('returns null when neither no mid nor yes implied is available', () => {
    expect(resolveNoImpliedProbability({})).toBeNull();
  });
});

describe('compareMarketsByPayoutLikelihood', () => {
  it('sorts higher implied probability first', () => {
    const high: MarketPayoutSortInput = { impliedProbability: 0.8, ticker: 'HIGH' };
    const low: MarketPayoutSortInput = { impliedProbability: 0.2, ticker: 'LOW' };

    expect(compareMarketsByPayoutLikelihood(high, low)).toBeLessThan(0);
    expect(compareMarketsByPayoutLikelihood(low, high)).toBeGreaterThan(0);
  });

  it('breaks ties by volume descending', () => {
    const moreVolume: MarketPayoutSortInput = { impliedProbability: 0.5, volume: 1000, ticker: 'A' };
    const lessVolume: MarketPayoutSortInput = { impliedProbability: 0.5, volume: 100, ticker: 'B' };

    expect(compareMarketsByPayoutLikelihood(moreVolume, lessVolume)).toBeLessThan(0);
  });

  it('breaks volume ties by ticker ascending', () => {
    const alpha: MarketPayoutSortInput = { impliedProbability: 0.5, volume: 100, ticker: 'AAA' };
    const beta: MarketPayoutSortInput = { impliedProbability: 0.5, volume: 100, ticker: 'BBB' };

    expect(compareMarketsByPayoutLikelihood(alpha, beta)).toBeLessThan(0);
  });

  it('sorts markets without pricing after priced markets', () => {
    const priced: MarketPayoutSortInput = { lastPrice: 0.1, ticker: 'PRICED' };
    const unpriced: MarketPayoutSortInput = { ticker: 'UNPRICED' };

    expect(compareMarketsByPayoutLikelihood(priced, unpriced)).toBeLessThan(0);
    expect(compareMarketsByPayoutLikelihood(unpriced, priced)).toBeGreaterThan(0);
  });
});

describe('sortMarketsByPayoutLikelihood', () => {
  it('returns a new array sorted by payout likelihood descending', () => {
    const markets: MarketPayoutSortInput[] = [
      { impliedProbability: 0.25, ticker: 'C', volume: 10 },
      { impliedProbability: 0.75, ticker: 'A', volume: 5 },
      { impliedProbability: 0.75, ticker: 'B', volume: 20 },
    ];

    expect(sortMarketsByPayoutLikelihood(markets).map((market) => market.ticker)).toEqual(['B', 'A', 'C']);
    expect(markets.map((market) => market.ticker)).toEqual(['C', 'A', 'B']);
  });
});
