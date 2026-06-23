import { describe, expect, it } from 'vitest';
import {
  buildEventsListCacheKey,
  cursorStacksEqual,
  DEFAULT_EVENT_LIST_PAGE_SIZE,
  emptyEventListParams,
  isEventListPageSize,
  mergeFiltersIntoSearchParams,
  parseEventListParams,
  resolveCursorStack,
  serializeEventListParams,
} from '@/lib/marketFilterParams';

describe('parseEventListParams', () => {
  it('returns defaults for an empty query string', () => {
    const parsed = parseEventListParams(new URLSearchParams());

    expect(parsed.pageSize).toBe(DEFAULT_EVENT_LIST_PAGE_SIZE);
    expect(parsed.cursor).toBeNull();
    expect(parsed.filters.searchQuery).toBe('');
    expect(parsed.filters.focus.size).toBe(0);
  });

  it('parses filter, pagination, and cursor params', () => {
    const parsed = parseEventListParams(
      new URLSearchParams({
        q: 'election',
        focus: 'politics,weather',
        category: 'Politics',
        tag: 'US',
        status: 'open',
        limit: '20',
        cursor: 'abc123',
      }),
    );

    expect(parsed.filters.searchQuery).toBe('election');
    expect([...parsed.filters.focus]).toEqual(['politics', 'weather']);
    expect([...parsed.filters.category]).toEqual(['Politics']);
    expect([...parsed.filters.tag]).toEqual(['US']);
    expect([...parsed.filters.status]).toEqual(['open']);
    expect(parsed.pageSize).toBe(20);
    expect(parsed.cursor).toBe('abc123');
  });

  it('falls back to the default page size for invalid limits', () => {
    const parsed = parseEventListParams(new URLSearchParams({ limit: '999' }));
    expect(parsed.pageSize).toBe(DEFAULT_EVENT_LIST_PAGE_SIZE);
  });

  it('uses stored page size when limit is absent from the URL', () => {
    const parsed = parseEventListParams(new URLSearchParams(), { storedPageSize: 20 });
    expect(parsed.pageSize).toBe(20);
  });
});

describe('serializeEventListParams', () => {
  it('round-trips list params', () => {
    const initial = parseEventListParams(
      new URLSearchParams({
        q: 'rain',
        focus: 'weather',
        limit: '50',
        cursor: 'page-2',
      }),
    );

    const roundTripped = parseEventListParams(serializeEventListParams(initial));
    expect(roundTripped.filters.searchQuery).toBe(initial.filters.searchQuery);
    expect([...roundTripped.filters.focus]).toEqual([...initial.filters.focus]);
    expect(roundTripped.pageSize).toBe(initial.pageSize);
    expect(roundTripped.cursor).toBe(initial.cursor);
  });

  it('omits default page size and empty filters', () => {
    const serialized = serializeEventListParams(emptyEventListParams());
    expect(serialized.toString()).toBe('');
  });
});

describe('mergeFiltersIntoSearchParams', () => {
  it('replaces filter params while preserving pagination', () => {
    const merged = mergeFiltersIntoSearchParams(new URLSearchParams('limit=20&cursor=page-2'), {
      searchQuery: 'election',
      focus: new Set(['politics']),
      category: new Set(),
      tag: new Set(),
      status: new Set(),
    });

    expect(merged.get('limit')).toBe('20');
    expect(merged.get('cursor')).toBe('page-2');
    expect(merged.get('q')).toBe('election');
    expect(merged.get('focus')).toBe('politics');
  });
});

describe('buildEventsListCacheKey', () => {
  it('is stable regardless of param order in the URL', () => {
    const left = buildEventsListCacheKey(
      parseEventListParams(new URLSearchParams('focus=politics&q=election&limit=20')),
    );
    const right = buildEventsListCacheKey(
      parseEventListParams(new URLSearchParams('limit=20&q=election&focus=politics')),
    );

    expect(left).toBe(right);
  });
});

describe('cursorStacksEqual', () => {
  it('returns true for stacks with the same cursors', () => {
    expect(cursorStacksEqual([null, 'page-2'], [null, 'page-2'])).toBe(true);
  });

  it('returns false when lengths or cursors differ', () => {
    expect(cursorStacksEqual([null], [null, 'page-2'])).toBe(false);
    expect(cursorStacksEqual([null, 'page-2'], [null, 'page-3'])).toBe(false);
  });
});

describe('resolveCursorStack', () => {
  it('reuses a stored stack when the cursor matches', () => {
    expect(resolveCursorStack('page-2', [null, 'page-2'])).toEqual([null, 'page-2']);
  });

  it('builds a minimal stack for a shared cursor link', () => {
    expect(resolveCursorStack('page-2', undefined)).toEqual([null, 'page-2']);
  });

  it('returns the first page stack when cursor is null', () => {
    expect(resolveCursorStack(null, [null, 'page-2'])).toEqual([null]);
  });
});

describe('isEventListPageSize', () => {
  it('accepts supported page sizes only', () => {
    expect(isEventListPageSize(10)).toBe(true);
    expect(isEventListPageSize(15)).toBe(false);
  });
});
