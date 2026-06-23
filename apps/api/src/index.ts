import { loadConfig, logger, createProviderRegistry } from '@forecast-kit/core';
import type { DatabaseClient } from '@forecast-kit/db';
import {
  checkDatabaseConnection,
  createDatabase,
  createQueryServices,
  createRepositories,
  createSyncService,
  createTaxonomySyncService,
} from '@forecast-kit/db';
import { KalshiProvider } from '@forecast-kit/provider-kalshi';
import { PolymarketProvider } from '@forecast-kit/provider-polymarket';
import Fastify from 'fastify';
import { adminRoutes } from './routes/admin.js';
import { eventRoutes, marketRoutes, syncRoutes } from './routes/markets.js';
import { healthRoutes } from './routes/health.js';
import { taxonomyRoutes } from './routes/taxonomy.js';
import { corsPlugin } from './plugins/cors.js';

export async function buildApp(options?: { db?: DatabaseClient }) {
  const config = loadConfig();
  const db = options?.db ?? createDatabase(config.FORECAST_KIT_DB_PATH);
  const repos = createRepositories(db);
  const query = createQueryServices(db);
  const kalshiProvider = new KalshiProvider(config);
  const taxonomy = createTaxonomySyncService(repos, kalshiProvider);
  const sync = createSyncService(repos, taxonomy);
  const providers = createProviderRegistry([kalshiProvider, new PolymarketProvider()]);

  const app = Fastify({ logger: false });

  app.decorate('config', config);
  app.decorate('db', db);
  app.decorate('repos', repos);
  app.decorate('query', query);
  app.decorate('sync', sync);
  app.decorate('taxonomy', taxonomy);
  app.decorate('providers', providers);
  app.decorate('kalshiProvider', kalshiProvider);

  await app.register(corsPlugin);
  await app.register(healthRoutes);
  await app.register(marketRoutes);
  await app.register(eventRoutes);
  await app.register(syncRoutes);
  await app.register(taxonomyRoutes);
  await app.register(adminRoutes);

  return app;
}

export async function startServer() {
  const config = loadConfig();
  const app = await buildApp();

  const dbConnected = checkDatabaseConnection(app.db);
  if (!dbConnected) {
    logger.warn({ component: 'api', msg: 'database connection check failed at startup' });
  }

  await app.listen({
    host: config.FORECAST_KIT_API_HOST,
    port: config.FORECAST_KIT_API_PORT,
  });

  logger.info({
    component: 'api',
    msg: 'server listening',
    host: config.FORECAST_KIT_API_HOST,
    port: config.FORECAST_KIT_API_PORT,
  });
}

declare module 'fastify' {
  interface FastifyInstance {
    config: ReturnType<typeof loadConfig>;
    db: ReturnType<typeof createDatabase>;
    repos: ReturnType<typeof createRepositories>;
    query: ReturnType<typeof createQueryServices>;
    sync: ReturnType<typeof createSyncService>;
    taxonomy: ReturnType<typeof createTaxonomySyncService>;
    providers: ReturnType<typeof createProviderRegistry>;
    kalshiProvider: KalshiProvider;
  }
}

if (import.meta.main) {
  startServer().catch((error: unknown) => {
    logger.error({
      component: 'api',
      msg: 'failed to start server',
      error: error instanceof Error ? error.message : String(error),
    });
    process.exit(1);
  });
}
