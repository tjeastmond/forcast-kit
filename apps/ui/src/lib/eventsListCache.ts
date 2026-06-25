import type { EventRow } from '@/lib/api';

export interface CachedEventsList {
  readonly events: readonly EventRow[];
  readonly nextCursor: string | null;
  readonly cursorStack: readonly (string | null)[];
}

const MAX_CACHE_ENTRIES = 50;

const cache = new Map<string, CachedEventsList>();

export function getEventsListCache(key: string): CachedEventsList | undefined {
  const value = cache.get(key);
  if (value === undefined) {
    return undefined;
  }

  cache.delete(key);
  cache.set(key, value);
  return value;
}

export function setEventsListCache(key: string, value: CachedEventsList): void {
  if (cache.has(key)) {
    cache.delete(key);
  } else if (cache.size >= MAX_CACHE_ENTRIES) {
    const oldestKey = cache.keys().next().value;
    if (oldestKey !== undefined) {
      cache.delete(oldestKey);
    }
  }

  cache.set(key, value);
}

export function clearEventsListCache(): void {
  cache.clear();
}

/** Test-only helper. */
export function eventsListCacheSize(): number {
  return cache.size;
}
