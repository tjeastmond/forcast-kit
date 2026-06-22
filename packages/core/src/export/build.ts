import type { Focus } from '../types/index.js';
import { deriveMarketMetrics } from '../metrics/index.js';
import { MARKET_EXPORT_SCHEMA_VERSION, marketExportV1Schema, type MarketExportV1 } from './schema.js';

export interface MarketExportInput {
  readonly provider: string;
  readonly ticker: string;
  readonly title: string;
  readonly focusTags: readonly Focus[];
  readonly isStale: boolean;
  readonly yesBid: number | null;
  readonly yesAsk: number | null;
  readonly noBid: number | null;
  readonly noAsk: number | null;
  readonly lastPrice: number | null;
  readonly volume: number;
  readonly openInterest: number;
  readonly openTime: string;
  readonly closeTime: string;
  readonly expirationTime: string | null;
  readonly rulesPrimary: string | null;
  readonly rulesSecondary: string | null;
  readonly event: { readonly ticker: string; readonly title: string } | null;
}

export function buildMarketExport(input: MarketExportInput): MarketExportV1 {
  const metrics = deriveMarketMetrics({
    yesBid: input.yesBid,
    yesAsk: input.yesAsk,
    noBid: input.noBid,
    noAsk: input.noAsk,
    lastPrice: input.lastPrice,
  });

  const doc = {
    schemaVersion: MARKET_EXPORT_SCHEMA_VERSION,
    provider: input.provider,
    ticker: input.ticker,
    question: input.title,
    focusTags: [...input.focusTags],
    isStale: input.isStale,
    pricing: {
      yesBid: input.yesBid,
      yesAsk: input.yesAsk,
      noBid: input.noBid,
      noAsk: input.noAsk,
      lastPrice: input.lastPrice,
      spread: metrics.spread,
      midPrice: metrics.midPrice,
      impliedProbability: metrics.impliedProbability,
    },
    liquidity: {
      volume: input.volume,
      openInterest: input.openInterest,
    },
    timing: {
      openTime: input.openTime,
      closeTime: input.closeTime,
      expirationTime: input.expirationTime,
    },
    rules: {
      primary: input.rulesPrimary,
      secondary: input.rulesSecondary,
    },
    event: input.event,
  } satisfies MarketExportV1;

  return marketExportV1Schema.parse(doc);
}
