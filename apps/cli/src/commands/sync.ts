import { loadConfig, parseFocusList, type ProviderId } from '@forcast-kit/core';
import { createDatabase, createRepositories, createSyncService } from '@forcast-kit/db';
import { getFlagString, hasFlag, type ParsedArgs } from '../args.js';
import { createCliProviderRegistry } from '../providers.js';
import type { CommandResult } from './index.js';

export async function runSyncCommand(args: ParsedArgs): Promise<CommandResult> {
  const providerId = (args.subcommand ?? 'kalshi') as ProviderId;
  const registry = createCliProviderRegistry();
  const provider = registry.get(providerId);

  if (!provider) {
    return {
      exitCode: 1,
      message: `Unknown provider: ${providerId}. Available: ${registry.ids().join(', ')}`,
    };
  }

  const config = loadConfig();
  const db = createDatabase(config.FORCAST_KIT_DB_PATH);
  const repos = createRepositories(db);
  const syncService = createSyncService(repos);

  const focus = parseFocusList(getFlagString(args.flags, 'focus'));
  const exclude = parseFocusList(getFlagString(args.flags, 'exclude'));

  const maxPagesFlag = getFlagString(args.flags, 'max-pages');
  const maxPages = maxPagesFlag ? Number.parseInt(maxPagesFlag, 10) : undefined;
  const full = hasFlag(args.flags, 'full');

  const result = await syncService.syncProvider(provider, {
    focus,
    exclude,
    ...(maxPages !== undefined && Number.isFinite(maxPages) ? { maxPages } : {}),
    ...(full ? { full: true } : {}),
  });

  return {
    exitCode: result.status === 'failed' ? 1 : 0,
    message: `Sync complete (run #${String(result.syncRunId)}): ${String(result.eventsUpserted)} events, ${String(result.marketsUpserted)} markets, ${String(result.errorsCount)} errors, status=${result.status}`,
  };
}
