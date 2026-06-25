export const MARKET_EXPORT_SCHEMA_VERSION = '1.0' as const;

export interface MarketExportV1 {
  readonly schemaVersion: typeof MARKET_EXPORT_SCHEMA_VERSION;
  readonly provider: string;
  readonly ticker: string;
  readonly question: string;
  readonly focusTags: readonly string[];
  readonly isStale: boolean;
  readonly pricing: {
    readonly yesBid: number | null;
    readonly yesAsk: number | null;
    readonly noBid: number | null;
    readonly noAsk: number | null;
    readonly lastPrice: number | null;
    readonly spread: number | null;
    readonly midPrice: number | null;
    readonly impliedProbability: number | null;
  };
  readonly liquidity: {
    readonly volume: number;
    readonly openInterest: number;
  };
  readonly timing: {
    readonly openTime: string;
    readonly closeTime: string;
    readonly expirationTime: string | null;
  };
  readonly rules: {
    readonly primary: string | null;
    readonly secondary: string | null;
  };
  readonly event: {
    readonly ticker: string;
    readonly title: string;
  } | null;
}
