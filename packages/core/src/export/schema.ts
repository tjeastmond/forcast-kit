import { z } from 'zod';

export const MARKET_EXPORT_SCHEMA_VERSION = '1.0' as const;

const pricingSchema = z.object({
  yesBid: z.number().nullable(),
  yesAsk: z.number().nullable(),
  noBid: z.number().nullable(),
  noAsk: z.number().nullable(),
  lastPrice: z.number().nullable(),
  spread: z.number().nullable(),
  midPrice: z.number().nullable(),
  impliedProbability: z.number().nullable(),
});

const liquiditySchema = z.object({
  volume: z.number(),
  openInterest: z.number(),
});

const timingSchema = z.object({
  openTime: z.string(),
  closeTime: z.string(),
  expirationTime: z.string().nullable(),
});

const rulesSchema = z.object({
  primary: z.string().nullable(),
  secondary: z.string().nullable(),
});

const eventSchema = z.object({
  ticker: z.string(),
  title: z.string(),
});

export const marketExportV1Schema = z.object({
  schemaVersion: z.literal(MARKET_EXPORT_SCHEMA_VERSION),
  provider: z.string(),
  ticker: z.string(),
  question: z.string(),
  focusTags: z.array(z.string()),
  isStale: z.boolean(),
  pricing: pricingSchema,
  liquidity: liquiditySchema,
  timing: timingSchema,
  rules: rulesSchema,
  event: eventSchema.nullable(),
});

export type MarketExportV1 = z.infer<typeof marketExportV1Schema>;
