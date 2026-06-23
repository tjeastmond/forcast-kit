import { describe, expect, it } from 'vitest';
import {
  clearEventsListCache,
  eventsListCacheSize,
  getEventsListCache,
  setEventsListCache,
} from '@/lib/eventsListCache';

describe('eventsListCache', () => {
  it('stores and retrieves cached list state', () => {
    clearEventsListCache();

    setEventsListCache('key-a', {
      events: [{ id: 1, eventTicker: 'EVT-1', title: 'Test', subtitle: '', category: null }],
      nextCursor: 'next',
      cursorStack: [null, 'next'],
    });

    expect(eventsListCacheSize()).toBe(1);
    expect(getEventsListCache('key-a')?.nextCursor).toBe('next');
    expect(getEventsListCache('missing')).toBeUndefined();
  });

  it('clears all entries', () => {
    setEventsListCache('key-b', {
      events: [],
      nextCursor: null,
      cursorStack: [null],
    });

    clearEventsListCache();
    expect(eventsListCacheSize()).toBe(0);
  });
});
