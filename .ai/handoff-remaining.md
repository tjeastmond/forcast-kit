# Remaining work handoff

**Context:** MVP Phases 1–5 are complete and shipped through **v0.5.0** (`main`). First Success Criteria passes. Post-MVP polish from this file is **complete** as of the latest `[Unreleased]` work in `CHANGELOG.md`.

**Companion docs:** [`AGENTS.md`](../AGENTS.md) (current architecture), [`Project_Plan.md`](../Project_Plan.md) (full spec), [`CHANGELOG.md`](../CHANGELOG.md).

---

## Completed (pre/post-MVP polish)

| #   | Item                                   | Status |
| --- | -------------------------------------- | ------ |
| 1   | CLI `--full` flag for sync             | Done   |
| 2   | CLI `events` command                   | Done   |
| 3   | CLI uses `ProviderRegistry`            | Done   |
| 4   | CLI argument-parsing tests             | Done   |
| 5   | API + CLI parity integration test      | Done   |
| 6   | Focus keyword false positives          | Done   |
| 7   | Drizzle snapshot for migration `0001`  | Done   |
| 8   | `Project_Plan.md` milestone checkboxes | Done   |

---

## Post-MVP (explicitly out of scope for v0.5.0)

| Item                                         | Entry point                                                                                                                               |
| -------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------- |
| **Polymarket live fetch**                    | [`packages/providers/polymarket/DESIGN.md`](../packages/providers/polymarket/DESIGN.md), `packages/providers/polymarket/src/index.ts`     |
| **Event-level implied probability**          | Not stored today; each market is independent. Would need product design + schema if agents want normalized probabilities across outcomes. |
| **Trading, WebSockets, auth, hosted deploy** | `Project_Plan.md` non-goals                                                                                                               |

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
