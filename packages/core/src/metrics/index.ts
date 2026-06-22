export interface PricingInput {
  readonly yesBid: number | null;
  readonly yesAsk: number | null;
  readonly noBid: number | null;
  readonly noAsk: number | null;
  readonly lastPrice: number | null;
}

export interface DerivedMetrics {
  readonly spread: number | null;
  readonly midPrice: number | null;
  readonly impliedProbability: number | null;
}

export function deriveMarketMetrics(pricing: PricingInput): DerivedMetrics {
  const yesBid = pricing.yesBid;
  const yesAsk = pricing.yesAsk;

  const spread = yesBid !== null && yesAsk !== null ? yesAsk - yesBid : null;
  const midPrice = yesBid !== null && yesAsk !== null ? (yesBid + yesAsk) / 2 : null;
  const impliedProbability = pricing.lastPrice ?? midPrice;

  return { spread, midPrice, impliedProbability };
}
