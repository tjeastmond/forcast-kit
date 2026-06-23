import { deriveMarketMetrics } from '@forecast-kit/core/metrics';

export interface MarketPayoutSortInput {
  readonly impliedProbability?: number | null;
  readonly lastPrice?: number | null;
  readonly yesBid?: number | null;
  readonly yesAsk?: number | null;
  readonly noBid?: number | null;
  readonly noAsk?: number | null;
  readonly volume?: number;
  readonly ticker?: string;
}

/** Resolve implied payout likelihood: API metric first, else derive from pricing fields. */
export function resolveImpliedProbability(market: MarketPayoutSortInput): number | null {
  if (market.impliedProbability !== undefined && market.impliedProbability !== null) {
    return market.impliedProbability;
  }

  return deriveMarketMetrics({
    yesBid: market.yesBid ?? null,
    yesAsk: market.yesAsk ?? null,
    noBid: market.noBid ?? null,
    noAsk: market.noAsk ?? null,
    lastPrice: market.lastPrice ?? null,
  }).impliedProbability;
}

/** Resolve No-side implied probability from no bid/ask mid, else complement of Yes. */
export function resolveNoImpliedProbability(market: MarketPayoutSortInput): number | null {
  if (market.noBid !== undefined && market.noBid !== null && market.noAsk !== undefined && market.noAsk !== null) {
    return (market.noBid + market.noAsk) / 2;
  }

  const yes = resolveImpliedProbability(market);
  return yes !== null ? 1 - yes : null;
}

/** Higher implied probability first; tie-break by volume, then ticker. */
export function compareMarketsByPayoutLikelihood(a: MarketPayoutSortInput, b: MarketPayoutSortInput): number {
  const impliedDelta = compareNullableDesc(resolveImpliedProbability(a), resolveImpliedProbability(b));
  if (impliedDelta !== 0) {
    return impliedDelta;
  }

  const volumeDelta = (b.volume ?? 0) - (a.volume ?? 0);
  if (volumeDelta !== 0) {
    return volumeDelta;
  }

  return (a.ticker ?? '').localeCompare(b.ticker ?? '');
}

export function sortMarketsByPayoutLikelihood<T extends MarketPayoutSortInput>(markets: readonly T[]): T[] {
  return [...markets].sort(compareMarketsByPayoutLikelihood);
}

function compareNullableDesc(a: number | null, b: number | null): number {
  if (a === null && b === null) {
    return 0;
  }
  if (a === null) {
    return 1;
  }
  if (b === null) {
    return -1;
  }
  return b - a;
}
