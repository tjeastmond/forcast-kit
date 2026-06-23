'use client';

import { useEffect, useRef, useState } from 'react';
import { toast } from 'sonner';
import { AppShell } from '@/components/AppShell';
import { EventCard } from '@/components/EventCard';
import { MarketFilters } from '@/components/MarketFilters';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { useEventListParams } from '@/hooks/useEventListParams';
import { fetchEvents, type EventRow } from '@/lib/api';
import { getEventsListCache, setEventsListCache } from '@/lib/eventsListCache';
import {
  buildEventsFetchOptions,
  EVENT_LIST_PAGE_SIZES,
  isEventListPageSize,
  saveEventsListReturn,
} from '@/lib/marketFilterParams';
import { hasActiveMarketFilters, type MarketFilterState } from '@/lib/marketFilters';

export function EventsPageFallback() {
  return (
    <AppShell>
      <div className="space-y-4">
        {[1, 2, 3].map((key) => (
          <Card key={key} className="h-24 animate-pulse" />
        ))}
      </div>
    </AppShell>
  );
}

export function EventsPageClient() {
  const {
    params,
    cacheKey,
    cursorStack,
    canGoPrev,
    setFilters,
    setPageSize,
    goNext,
    goPrev,
    clearAll,
    listQueryString,
  } = useEventListParams();

  const cached = getEventsListCache(cacheKey);
  const [events, setEvents] = useState<readonly EventRow[]>(cached?.events ?? []);
  const [nextCursor, setNextCursor] = useState<string | null>(cached?.nextCursor ?? null);
  const [loading, setLoading] = useState(cached === undefined);
  const [searchDraft, setSearchDraft] = useState(params.filters.searchQuery);
  const searchInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setSearchDraft(params.filters.searchQuery);
  }, [params.filters.searchQuery]);

  useEffect(() => {
    if (searchDraft === params.filters.searchQuery) {
      return;
    }
    const timeout = window.setTimeout(() => {
      setFilters({ ...params.filters, searchQuery: searchDraft });
    }, 250);
    return () => {
      window.clearTimeout(timeout);
    };
  }, [params.filters, searchDraft, setFilters]);

  useEffect(() => {
    saveEventsListReturn(listQueryString);
  }, [listQueryString]);

  useEffect(() => {
    const cachedList = getEventsListCache(cacheKey);
    if (cachedList !== undefined) {
      setEvents((current) => (current === cachedList.events ? current : cachedList.events));
      setNextCursor((current) => (current === cachedList.nextCursor ? current : cachedList.nextCursor));
      setLoading((current) => (current ? false : current));
      return;
    }

    const stackForCache = cursorStack;
    let cancelled = false;

    async function loadEvents(): Promise<void> {
      setLoading(true);
      try {
        const result = await fetchEvents(buildEventsFetchOptions(params));
        if (cancelled) {
          return;
        }
        setEvents(result.events);
        setNextCursor(result.cursor);
        setEventsListCache(cacheKey, {
          events: result.events,
          nextCursor: result.cursor,
          cursorStack: stackForCache,
        });
      } catch (error) {
        if (cancelled) {
          return;
        }
        toast.error(error instanceof Error ? error.message : 'Failed to load events');
        setEvents([]);
        setNextCursor(null);
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    void loadEvents();

    return () => {
      cancelled = true;
    };
  }, [cacheKey, cursorStack, params]);

  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === '/' && document.activeElement?.tagName !== 'INPUT') {
        event.preventDefault();
        searchInputRef.current?.focus();
      }
      if (event.key === 'Escape') {
        clearAll();
      }
    }
    window.addEventListener('keydown', onKeyDown);
    return () => {
      window.removeEventListener('keydown', onKeyDown);
    };
  }, [clearAll]);

  const displayFilters: MarketFilterState = { ...params.filters, searchQuery: searchDraft };
  const isInitialLoad = loading && events.length === 0;
  const isPaginating = loading && events.length > 0;

  return (
    <AppShell onTitleClick={clearAll}>
      <MarketFilters
        variant="events"
        filters={displayFilters}
        onFiltersChange={(next) => {
          if (next.searchQuery !== searchDraft) {
            setSearchDraft(next.searchQuery);
            return;
          }
          setFilters(next);
        }}
        onClear={clearAll}
        hasActiveFilters={hasActiveMarketFilters(displayFilters)}
        searchInputRef={searchInputRef}
      />

      <div className="mb-4 flex items-center justify-between gap-2">
        <p className="text-muted-foreground text-sm">
          {isInitialLoad ? 'Loading…' : `${String(events.length)} Events`}
        </p>
        <div className="flex items-center gap-2">
          <select
            className="border-input h-8 rounded-lg border px-2 text-sm"
            value={params.pageSize}
            onChange={(event) => {
              const parsed = Number.parseInt(event.target.value, 10);
              if (isEventListPageSize(parsed)) {
                setPageSize(parsed);
              }
            }}
          >
            {EVENT_LIST_PAGE_SIZES.map((size) => (
              <option key={size} value={size}>
                {size} / Page
              </option>
            ))}
          </select>
          <Button variant="outline" disabled={!canGoPrev} onClick={goPrev}>
            Prev
          </Button>
          <Button
            variant="outline"
            disabled={!nextCursor}
            onClick={() => {
              if (nextCursor) {
                goNext(nextCursor);
              }
            }}
          >
            Next
          </Button>
        </div>
      </div>

      <div className={isPaginating ? 'pointer-events-none space-y-4 opacity-60' : 'space-y-4'}>
        {isInitialLoad
          ? [1, 2, 3].map((key) => <Card key={key} className="h-24 animate-pulse" />)
          : events.map((event) => (
              <EventCard
                key={event.eventTicker}
                event={event}
                {...(event.markets !== undefined ? { marketCount: event.markets.length } : {})}
              />
            ))}
        {!loading && events.length === 0 ? (
          <Card className="p-8 text-center">
            <p className="text-muted-foreground">No events found.</p>
          </Card>
        ) : null}
      </div>
    </AppShell>
  );
}
