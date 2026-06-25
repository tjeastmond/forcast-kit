import { describe, expect, it } from 'vitest';
import {
  calculateKalshiPurchase,
  isTradeableMarketStatus,
  resolveMarketAskPrice,
  resolvePurchaseAskPrice,
  resolveSideAskFromSides,
} from './kalshi-purchase.js';

const sampleSides = [
  { side: 'yes', label: 'Yes', ask: 0.42 },
  { side: 'no', label: 'No', ask: 0.59 },
];

describe('calculateKalshiPurchase', () => {
  it('computes payout for a yes buy at 40%', () => {
    const estimate = calculateKalshiPurchase(10, 0.4);
    expect(estimate).toEqual({
      contracts: 25,
      cost: 10,
      payoutIfWin: 25,
      profitIfWin: 15,
      returnOnCost: 1.5,
    });
  });

  it('computes payout for a no buy at 60%', () => {
    const estimate = calculateKalshiPurchase(6, 0.6);
    expect(estimate).toEqual({
      contracts: 10,
      cost: 6,
      payoutIfWin: 10,
      profitIfWin: 4,
      returnOnCost: 4 / 6,
    });
  });

  it('returns null for invalid spend or price', () => {
    expect(calculateKalshiPurchase(0, 0.5)).toBeNull();
    expect(calculateKalshiPurchase(-5, 0.5)).toBeNull();
    expect(calculateKalshiPurchase(10, 0)).toBeNull();
    expect(calculateKalshiPurchase(10, 1)).toBeNull();
    expect(calculateKalshiPurchase(10, -0.1)).toBeNull();
  });
});

describe('resolvePurchaseAskPrice', () => {
  it('returns the ask for the selected side', () => {
    expect(resolvePurchaseAskPrice('yes', 0.42, 0.58)).toBe(0.42);
    expect(resolvePurchaseAskPrice('no', 0.42, 0.58)).toBe(0.58);
    expect(resolvePurchaseAskPrice('yes', null, 0.58)).toBeNull();
  });
});

describe('resolveSideAskFromSides', () => {
  it('reads ask from synced side rows', () => {
    expect(resolveSideAskFromSides(sampleSides, 'yes')).toBe(0.42);
    expect(resolveSideAskFromSides(sampleSides, 'no')).toBe(0.59);
    expect(resolveSideAskFromSides([], 'yes')).toBeNull();
  });
});

describe('resolveMarketAskPrice', () => {
  it('prefers side rows over top-level ask columns', () => {
    expect(resolveMarketAskPrice(sampleSides, 'yes', 0.5, 0.5)).toBe(0.42);
    expect(resolveMarketAskPrice([], 'no', 0.42, 0.58)).toBe(0.58);
  });
});

describe('isTradeableMarketStatus', () => {
  it('allows open and active markets', () => {
    expect(isTradeableMarketStatus('open')).toBe(true);
    expect(isTradeableMarketStatus('active')).toBe(true);
    expect(isTradeableMarketStatus('closed')).toBe(false);
  });
});
