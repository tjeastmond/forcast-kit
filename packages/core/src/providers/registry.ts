import type { PredictionMarketProvider, ProviderId } from '../types/index.js';

export class ProviderRegistry {
  private readonly providers = new Map<ProviderId, PredictionMarketProvider>();

  register(provider: PredictionMarketProvider): void {
    this.providers.set(provider.id, provider);
  }

  get(id: ProviderId): PredictionMarketProvider | undefined {
    return this.providers.get(id);
  }

  require(id: ProviderId): PredictionMarketProvider {
    const provider = this.get(id);
    if (!provider) {
      throw new Error(`Unknown provider: ${id}`);
    }
    return provider;
  }

  ids(): readonly ProviderId[] {
    return [...this.providers.keys()];
  }
}

export function createProviderRegistry(providers: readonly PredictionMarketProvider[]): ProviderRegistry {
  const registry = new ProviderRegistry();
  for (const provider of providers) {
    registry.register(provider);
  }
  return registry;
}
