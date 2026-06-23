import { createProviderRegistry, loadConfig } from '@forcast-kit/core';
import { KalshiProvider } from '@forcast-kit/provider-kalshi';
import { PolymarketProvider } from '@forcast-kit/provider-polymarket';

export function createCliProviderRegistry() {
  const config = loadConfig();
  return createProviderRegistry([new KalshiProvider(config), new PolymarketProvider()]);
}
