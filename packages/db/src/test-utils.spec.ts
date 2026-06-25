import type Database from 'better-sqlite3';
import { describe, expect, it } from 'vitest';
import { createTestDatabase } from './test-utils.js';

function readForeignKeysFlag(sqlite: Database.Database): number {
  const row = sqlite.prepare('PRAGMA foreign_keys').get() as { foreign_keys: number };
  return row.foreign_keys;
}

describe('createTestDatabase', () => {
  it('enables foreign key enforcement on the connection', () => {
    const db = createTestDatabase();
    const sqlite = (db as unknown as { session: { client: Database.Database } }).session.client;
    expect(readForeignKeysFlag(sqlite)).toBe(1);
  });
});
