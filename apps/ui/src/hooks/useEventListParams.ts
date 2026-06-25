'use client';

import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { useCallback, useEffect, useMemo, useRef, useState, useSyncExternalStore } from 'react';
import { getEventsListCache } from '@/lib/eventsListCache';
import type { MarketFilterState } from '@/lib/marketFilters';
import {
  buildEventsListCacheKey,
  cursorStacksEqual,
  emptyEventListParams,
  parseEventListParams,
  readStoredPageSize,
  resolveCursorStack,
  serializeEventListParams,
  writeStoredPageSize,
  type EventListPageSize,
  type EventListParams,
} from '@/lib/marketFilterParams';

function subscribeNoop(): () => void {
  return () => {};
}

function buildHref(pathname: string, params: URLSearchParams): string {
  return params.size > 0 ? `${pathname}?${params.toString()}` : pathname;
}

export function useEventListParams(): {
  params: EventListParams;
  cacheKey: string;
  cursorStack: (string | null)[];
  canGoPrev: boolean;
  listQueryString: string;
  setFilters: (filters: MarketFilterState) => void;
  setPageSize: (pageSize: EventListPageSize) => void;
  goNext: (nextCursor: string) => void;
  goPrev: () => void;
  clearAll: () => void;
} {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const storedPageSize = useSyncExternalStore(subscribeNoop, readStoredPageSize, () => undefined);

  const params = useMemo(() => {
    return parseEventListParams(searchParams, storedPageSize === undefined ? undefined : { storedPageSize });
  }, [searchParams, storedPageSize]);
  const cacheKey = useMemo(() => buildEventsListCacheKey(params), [params]);
  const listQueryString = useMemo(() => {
    const serialized = searchParams.toString();
    return serialized.length > 0 ? `?${serialized}` : '';
  }, [searchParams]);

  const [cursorStack, setCursorStack] = useState<(string | null)[]>(() => {
    const cached = getEventsListCache(cacheKey);
    return resolveCursorStack(params.cursor, cached?.cursorStack);
  });

  const skipStackSyncRef = useRef(false);

  const navigate = useCallback(
    (next: EventListParams, mode: 'push' | 'replace') => {
      const href = buildHref(pathname, serializeEventListParams(next));
      if (mode === 'push') {
        router.push(href);
      } else {
        router.replace(href);
      }
    },
    [pathname, router],
  );

  const setFilters = useCallback(
    (filters: MarketFilterState) => {
      skipStackSyncRef.current = true;
      setCursorStack([null]);
      navigate({ filters, pageSize: params.pageSize, cursor: null }, 'replace');
    },
    [navigate, params.pageSize],
  );

  const setPageSize = useCallback(
    (pageSize: EventListPageSize) => {
      writeStoredPageSize(pageSize);
      skipStackSyncRef.current = true;
      setCursorStack([null]);
      navigate({ ...params, pageSize, cursor: null }, 'replace');
    },
    [navigate, params],
  );

  const goNext = useCallback(
    (nextCursor: string) => {
      skipStackSyncRef.current = true;
      setCursorStack((current) => [...current, nextCursor]);
      navigate({ ...params, cursor: nextCursor }, 'push');
    },
    [navigate, params],
  );

  const goPrev = useCallback(() => {
    if (cursorStack.length <= 1) {
      return;
    }
    skipStackSyncRef.current = true;
    const nextStack = cursorStack.slice(0, -1);
    const previousCursor = nextStack[nextStack.length - 1] ?? null;
    setCursorStack(nextStack);
    navigate({ ...params, cursor: previousCursor }, 'push');
  }, [cursorStack, navigate, params]);

  const clearAll = useCallback(() => {
    skipStackSyncRef.current = true;
    setCursorStack([null]);
    navigate(emptyEventListParams(), 'replace');
  }, [navigate]);

  useEffect(() => {
    if (skipStackSyncRef.current) {
      skipStackSyncRef.current = false;
      return;
    }
    const cached = getEventsListCache(cacheKey);
    const nextStack = resolveCursorStack(params.cursor, cached?.cursorStack);
    setCursorStack((current) => (cursorStacksEqual(current, nextStack) ? current : nextStack));
  }, [cacheKey, params.cursor]);

  return {
    params,
    cacheKey,
    cursorStack,
    canGoPrev: cursorStack.length > 1,
    listQueryString,
    setFilters,
    setPageSize,
    goNext,
    goPrev,
    clearAll,
  };
}
