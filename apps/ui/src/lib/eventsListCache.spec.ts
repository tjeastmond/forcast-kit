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

  it('evicts oldest entry when cache exceeds max size', () => {
    clearEventsListCache();

    for (let index = 0; index < 51; index += 1) {
      setEventsListCache(`key-${String(index)}`, {
        events: [],
        nextCursor: null,
        cursorStack: [null],
      });
    }

    expect(eventsListCacheSize()).toBe(50);
    expect(getEventsListCache('key-0')).toBeUndefined();
    expect(getEventsListCache('key-50')?.cursorStack).toEqual([null]);
  });
});
