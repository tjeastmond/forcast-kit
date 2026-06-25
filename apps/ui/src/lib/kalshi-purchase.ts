export type PurchaseSide = 'yes' | 'no';

export interface KalshiPurchaseEstimate {
  readonly contracts: number;
  readonly cost: number;
  readonly payoutIfWin: number;
  readonly profitIfWin: number;
  readonly returnOnCost: number;
}

/** Kalshi binary contract: pay `limitPrice` per contract; each pays $1 if the side wins. */
export function calculateKalshiPurchase(spendDollars: number, limitPrice: number): KalshiPurchaseEstimate | null {
  if (!Number.isFinite(spendDollars) || spendDollars <= 0) {
    return null;
  }
  if (!Number.isFinite(limitPrice) || limitPrice <= 0 || limitPrice >= 1) {
    return null;
  }

  const contracts = spendDollars / limitPrice;
  const cost = spendDollars;
  const payoutIfWin = contracts;
  const profitIfWin = payoutIfWin - cost;
  const returnOnCost = profitIfWin / cost;

  return {
    contracts,
    cost,
    payoutIfWin,
    profitIfWin,
    returnOnCost,
  };
}

export interface MarketSideQuote {
  readonly side: string;
  readonly label: string;
  readonly ask: number | null;
}

/** Ask for a side from synced market_sides rows (same source as the Sides table). */
export function resolveSideAskFromSides(sides: readonly MarketSideQuote[], side: PurchaseSide): number | null {
  const row = sides.find((entry) => entry.side === side);
  return row?.ask ?? null;
}

export function resolvePurchaseAskPrice(
  side: PurchaseSide,
  yesAsk: number | null,
  noAsk: number | null,
): number | null {
  return side === 'yes' ? yesAsk : noAsk;
}

/** Prefer side rows from the market detail payload; fall back to top-level yes/no ask columns. */
export function resolveMarketAskPrice(
  sides: readonly MarketSideQuote[],
  side: PurchaseSide,
  yesAsk: number | null,
  noAsk: number | null,
): number | null {
  const fromSides = resolveSideAskFromSides(sides, side);
  if (fromSides !== null) {
    return fromSides;
  }
  return resolvePurchaseAskPrice(side, yesAsk, noAsk);
}

export function isTradeableMarketStatus(status: string): boolean {
  return status === 'open' || status === 'active';
}
