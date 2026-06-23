'use client';

import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { toast } from 'sonner';
import { AppShell } from '@/components/AppShell';
import { EventSyncButton } from '@/components/EventSyncButton';
import { MarketCard } from '@/components/MarketCard';
import { MarketDetailSheet } from '@/components/MarketDetailSheet';
import { Card } from '@/components/ui/card';
import { fetchEventDetail, type EventDetailResponse } from '@/lib/api';
import { reconcileEventDetail, sortEventMarkets } from '@/lib/event-detail';
import { readEventsListReturn } from '@/lib/marketFilterParams';

export default function EventDetailPage() {
  const params = useParams<{ eventTicker: string }>();
  const eventTicker = decodeURIComponent(params.eventTicker);
  const [event, setEvent] = useState<EventDetailResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedTicker, setSelectedTicker] = useState<string | null>(null);
  const [sheetOpen, setSheetOpen] = useState(false);
  const [eventsHref, setEventsHref] = useState('/events');

  useEffect(() => {
    setEventsHref(`/events${readEventsListReturn()}`);
  }, []);
  const hasLoadedRef = useRef(false);

  const applyEventDetail = useCallback((result: EventDetailResponse) => {
    setEvent((previous) => reconcileEventDetail(previous, result));
  }, []);

  const load = useCallback(
    async (options?: { showLoading?: boolean }) => {
      const showLoading = options?.showLoading ?? !hasLoadedRef.current;
      if (showLoading) {
        setLoading(true);
      }
      try {
        const result = await fetchEventDetail(eventTicker);
        applyEventDetail(result);
      } catch (error) {
        toast.error(error instanceof Error ? error.message : 'Failed to load event');
        setEvent(null);
      } finally {
        if (showLoading) {
          setLoading(false);
        }
        hasLoadedRef.current = true;
      }
    },
    [applyEventDetail, eventTicker],
  );

  const refreshAfterSync = useCallback(async () => {
    try {
      const result = await fetchEventDetail(eventTicker);
      applyEventDetail(result);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to refresh event');
    }
  }, [applyEventDetail, eventTicker]);

  useEffect(() => {
    hasLoadedRef.current = false;
    void load();
  }, [load]);

  const markets = useMemo(() => (event ? sortEventMarkets(event.markets) : []), [event]);
  const isInitialLoad = loading && event === null;

  const openMarket = useCallback((ticker: string) => {
    setSelectedTicker(ticker);
    setSheetOpen(true);
  }, []);

  const handleSynced = useCallback(() => {
    void refreshAfterSync();
  }, [refreshAfterSync]);

  return (
    <AppShell>
      <Link href={eventsHref} className="text-muted-foreground mb-4 inline-block text-sm">
        ← Events
      </Link>
      {isInitialLoad ? <p className="text-muted-foreground text-sm">Loading…</p> : null}
      {event ? (
        <div className="space-y-6">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <h1 className="text-xl font-medium">{event.title}</h1>
              <p className="text-muted-foreground text-sm">
                {event.eventTicker}
                {event.category ? ` · ${event.category}` : ''}
                {markets.length > 0 ? ` · ${String(markets.length)} markets` : ''}
              </p>
            </div>
            <EventSyncButton eventTicker={event.eventTicker} onSynced={handleSynced} />
          </div>

          <div className="space-y-4">
            {markets.map((market) => (
              <MarketCard key={market.ticker} market={market} onOpen={openMarket} />
            ))}
            {!isInitialLoad && markets.length === 0 ? (
              <Card className="p-8 text-center">
                <p className="text-muted-foreground mb-4">No markets found for this event.</p>
                <EventSyncButton eventTicker={event.eventTicker} onSynced={handleSynced} />
              </Card>
            ) : null}
          </div>
        </div>
      ) : null}
      <MarketDetailSheet ticker={selectedTicker} open={sheetOpen} onOpenChange={setSheetOpen} />
    </AppShell>
  );
}
