import { describe, expect, it } from 'vitest';
import { buildMarketExport, marketExportV1Schema } from './index.js';

describe('buildMarketExport', () => {
  it('produces export JSON that validates against schema v1.0', () => {
    const doc = buildMarketExport({
      provider: 'kalshi',
      ticker: 'KXPRES-24-DEM',
      title: 'Will a Democrat win the 2024 presidential election?',
      focusTags: ['politics'],
      isStale: false,
      yesBid: 0.4,
      yesAsk: 0.42,
      noBid: 0.58,
      noAsk: 0.6,
      lastPrice: 0.41,
      volume: 12500,
      openInterest: 8200,
      openTime: '2025-01-01T00:00:00.000Z',
      closeTime: '2026-01-01T00:00:00.000Z',
      expirationTime: null,
      rulesPrimary: 'Resolves YES if a Democrat wins.',
      rulesSecondary: null,
      event: { ticker: 'KXPRES-24', title: '2024 Presidential Election' },
    });

    expect(marketExportV1Schema.parse(doc)).toEqual(doc);
    expect(doc.schemaVersion).toBe('1.0');
    expect(doc.pricing.spread).toBeCloseTo(0.02);
    expect(doc.pricing.midPrice).toBeCloseTo(0.41);
    expect(doc.pricing.impliedProbability).toBeCloseTo(0.41);
  });
});
