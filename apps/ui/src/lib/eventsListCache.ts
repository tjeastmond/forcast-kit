import type { EventRow } from '@/lib/api';

export interface CachedEventsList {
  readonly events: readonly EventRow[];
  readonly nextCursor: string | null;
  readonly cursorStack: readonly (string | null)[];
}

const cache = new Map<string, CachedEventsList>();

export function getEventsListCache(key: string): CachedEventsList | undefined {
  return cache.get(key);
}

export function setEventsListCache(key: string, value: CachedEventsList): void {
  cache.set(key, value);
}

export function clearEventsListCache(): void {
  cache.clear();
}

/** Test-only helper. */
export function eventsListCacheSize(): number {
  return cache.size;
}
