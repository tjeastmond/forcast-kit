import type { MarketExportV1 } from '@forecast-kit/core';
import type { MarketComparisonRow, MarketDetail, MarketSummary, SyncRunRow } from '@forecast-kit/db/query';

export type { MarketComparisonRow, MarketDetail, MarketSummary, SyncRunRow };

export interface MarketListResponse {
  readonly markets: readonly MarketSummary[];
  readonly cursor: string | null;
}

export interface MarketDetailWithMetrics extends MarketDetail {
  readonly metrics?: {
    readonly spread: number | null;
    readonly midPrice: number | null;
    readonly impliedProbability: number | null;
  };
}

export interface EventDetailResponse {
  readonly eventTicker: string;
  readonly title: string;
  readonly subtitle: string;
  readonly category: string | null;
  readonly markets: readonly MarketSummary[] | readonly MarketComparisonRow[];
}

export interface SyncRunListResponse {
  readonly syncRuns: readonly SyncRunRow[];
  readonly cursor: string | null;
}

export type MarketExportResponse = MarketExportV1;
