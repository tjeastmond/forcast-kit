import { z } from 'zod';

const configSchema = z.object({
  FORECAST_KIT_DB_PATH: z.string().default('./data/forecast-kit.db'),
  FORECAST_KIT_API_HOST: z.string().default('127.0.0.1'),
  FORECAST_KIT_API_PORT: z.coerce.number().int().positive().default(3847),
  KALSHI_API_BASE_URL: z.string().url().default('https://external-api.kalshi.com/trade-api/v2'),
  KALSHI_API_KEY_ID: z.string().optional(),
  KALSHI_PRIVATE_KEY_PATH: z.string().optional(),
  SYNC_PAGE_LIMIT: z.coerce.number().int().positive().max(200).default(200),
  SYNC_REQUEST_DELAY_MS: z.coerce.number().int().nonnegative().default(100),
});

export type AppConfig = z.infer<typeof configSchema>;

export function loadConfig(env: Record<string, string | undefined> = process.env): AppConfig {
  return configSchema.parse({
    FORECAST_KIT_DB_PATH: env.FORECAST_KIT_DB_PATH,
    FORECAST_KIT_API_HOST: env.FORECAST_KIT_API_HOST,
    FORECAST_KIT_API_PORT: env.FORECAST_KIT_API_PORT,
    KALSHI_API_BASE_URL: env.KALSHI_API_BASE_URL,
    KALSHI_API_KEY_ID: env.KALSHI_API_KEY_ID,
    KALSHI_PRIVATE_KEY_PATH: env.KALSHI_PRIVATE_KEY_PATH,
    SYNC_PAGE_LIMIT: env.SYNC_PAGE_LIMIT,
    SYNC_REQUEST_DELAY_MS: env.SYNC_REQUEST_DELAY_MS,
  });
}
