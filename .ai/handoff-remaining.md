# Remaining work handoff

**Context:** MVP Phases 1–5 are complete and shipped through **v0.5.0** (`main`). First Success Criteria passes. This file captures polish gaps, parity work, and post-MVP items identified after the MVP push — not blockers for the original plan.

**Companion docs:** [`AGENTS.md`](../AGENTS.md) (current architecture), [`Project_Plan.md`](../Project_Plan.md) (full spec), [`CHANGELOG.md`](../CHANGELOG.md).

---

## Priority 1 — CLI / API parity

These are the highest-value gaps: the API can do things the CLI cannot, or the two paths diverge.

### 1. CLI `--full` flag for sync

|               |                                                                                                                                 |
| ------------- | ------------------------------------------------------------------------------------------------------------------------------- |
| **Today**     | `POST /sync` accepts `full: true` → full Kalshi fetch + stale-market marking (`is_stale` on markets not seen).                  |
| **Gap**       | `apps/cli/src/commands/sync.ts` does not expose `--full`; incremental sync is always implicit after the first successful run.   |
| **Files**     | `apps/cli/src/commands/sync.ts`, `apps/cli/src/args.ts` (`HELP_TEXT`)                                                           |
| **Done when** | `forcast-kit sync kalshi --no-ui --full` passes `{ full: true }` to `SyncService.syncProvider()`; help text documents the flag. |

### 2. CLI `events` command

|               |                                                                                                                                                             |
| ------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Today**     | `GET /events` and `GET /events/:eventTicker` group markets under parent questions (e.g. all `KXNEXTDNCCHAIR-45-*` under event `KXNEXTDNCCHAIR-45`).         |
| **Gap**       | No CLI equivalent; users must use curl or SQLite.                                                                                                           |
| **Files**     | New `apps/cli/src/commands/events.ts` (or extend `list.ts`), wire in `apps/cli/src/commands/index.ts`, update `HELP_TEXT`.                                  |
| **Done when** | `forcast-kit events --focus politics` lists events; `forcast-kit events KXNEXTDNCCHAIR-45` shows event + filtered markets (mirror API shape in plain text). |

### 3. CLI uses `ProviderRegistry`

|               |                                                                                                                                               |
| ------------- | --------------------------------------------------------------------------------------------------------------------------------------------- |
| **Today**     | API registers Kalshi + Polymarket via `createProviderRegistry()` in `apps/api/src/index.ts`. CLI sync hardcodes `new KalshiProvider(config)`. |
| **Gap**       | Phase 5 wording expected registry in sync path; CLI and API behave differently for provider selection.                                        |
| **Files**     | `apps/cli/src/commands/sync.ts`, optionally shared factory in `packages/core` or `apps/cli/src/providers.ts`                                  |
| **Done when** | CLI sync resolves provider by id (default `kalshi`) through the same registry pattern as the API.                                             |

---

## Priority 2 — Tests

### 4. CLI argument-parsing tests

|               |                                                                                                        |
| ------------- | ------------------------------------------------------------------------------------------------------ |
| **Plan**      | `Project_Plan.md` § Testing Strategy — CLI argument parsing (no Ink render), Vitest unit.              |
| **Gap**       | No `apps/cli/**/*.spec.ts` files.                                                                      |
| **Files**     | `apps/cli/src/args.spec.ts` (parseArgs, flags, subcommands)                                            |
| **Done when** | `bun run test` covers focus/exclude parsing, `--no-ui`, `inspect` ticker positional, unknown commands. |

### 5. API + CLI parity integration test

|               |                                                                                                                                               |
| ------------- | --------------------------------------------------------------------------------------------------------------------------------------------- |
| **Plan**      | Phase 3 exit gate mentions integration tests for API + CLI parity.                                                                            |
| **Gap**       | API market routes and DB query layer are tested; no test asserts CLI `list --focus X` matches `GET /markets?focus=X` for the same DB fixture. |
| **Files**     | e.g. `apps/cli/src/commands/list.spec.ts` or cross-app test under `packages/db`                                                               |
| **Done when** | One fixture DB → same tickers returned from CLI list output and API JSON for identical filters.                                               |

---

## Priority 3 — Data quality & tooling

### 6. Focus keyword false positives

|               |                                                                                                                                                                        |
| ------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Bug**       | Keyword rules use substring match. Keyword `AI` in `rules.json` matches “Ch**ai**r” in titles → spurious `technology` tag on politics markets (e.g. DNC chair series). |
| **Files**     | `packages/core/src/focus/rules.ts`, add/adjust cases in `packages/core/src/focus/rules.spec.ts`                                                                        |
| **Done when** | Keywords match word boundaries or token boundaries; DNC chair fixtures no longer get `technology` unless intended.                                                     |

### 7. Drizzle snapshot for migration `0001`

|               |                                                                                                                                                     |
| ------------- | --------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Today**     | `0001_add_market_stale.sql` and journal entry exist; `packages/db/migrations/meta/0001_snapshot.json` is missing (only `0000_snapshot.json`).       |
| **Risk**      | Future `db:generate` may behave oddly without a full snapshot chain.                                                                                |
| **Done when** | Run `bun run db:generate` after schema matches migration, or hand-add snapshot consistent with Drizzle Kit output; verify `db:migrate` on clean DB. |

### 8. `Project_Plan.md` milestone checkboxes

|               |                                                                                                                      |
| ------------- | -------------------------------------------------------------------------------------------------------------------- |
| **Gap**       | All phase checklist items remain `[ ]` though work is done.                                                          |
| **Done when** | Checkboxes updated to `[x]` for Phases 1–5, or add a note at top that MVP completion is tracked in CHANGELOG v0.5.0. |

---

## Post-MVP (explicitly out of scope for v0.5.0)

| Item                                         | Entry point                                                                                                                               |
| -------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------- |
| **Polymarket live fetch**                    | [`packages/providers/polymarket/DESIGN.md`](../packages/providers/polymarket/DESIGN.md), `packages/providers/polymarket/src/index.ts`     |
| **Event-level implied probability**          | Not stored today; each market is independent. Would need product design + schema if agents want normalized probabilities across outcomes. |
| **Trading, WebSockets, auth, hosted deploy** | `Project_Plan.md` non-goals                                                                                                               |

---

## Suggested pick-up order

1. CLI `--full` + `--help` (small, unblocks stale sync from CLI)
2. Focus keyword fix (data quality)
3. CLI `events` command (high user value)
4. CLI tests → parity test
5. Provider registry in CLI
6. Docs/checkbox cleanup + Drizzle snapshot

---

## Verification after changes

```bash
bun run format
bun run typecheck
bun run lint
bun run test
bun run db:migrate
```

Do not commit or push if any quality check fails.

Update [`CHANGELOG.md`](../CHANGELOG.md) under `[Unreleased]`; release as **patch** (`0.5.x`) unless the user requests a higher bump. No AI attribution in commits.
