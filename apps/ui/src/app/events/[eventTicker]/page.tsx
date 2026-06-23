'use client';

import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { toast } from 'sonner';
import { AppShell } from '@/components/AppShell';
import { EventComparisonTable } from '@/components/EventComparisonTable';
import { MarketDetailSheet } from '@/components/MarketDetailSheet';
import { fetchEventDetail, type EventDetailResponse } from '@/lib/api';

export default function EventDetailPage() {
  const params = useParams<{ eventTicker: string }>();
  const eventTicker = decodeURIComponent(params.eventTicker);
  const [event, setEvent] = useState<EventDetailResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedTicker, setSelectedTicker] = useState<string | null>(null);
  const [sheetOpen, setSheetOpen] = useState(false);
  const [hasUnsavedEdits, setHasUnsavedEdits] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const result = await fetchEventDetail(eventTicker);
      setEvent(result);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to load event');
      setEvent(null);
    } finally {
      setLoading(false);
    }
  }, [eventTicker]);

  useEffect(() => {
    void load();
  }, [load]);

  const maxImplied = useMemo(() => {
    if (!event?.markets.length) {
      return 0;
    }
    return Math.max(...event.markets.map((market) => market.impliedProbability ?? 0));
  }, [event]);

  return (
    <AppShell hasUnsavedEdits={hasUnsavedEdits}>
      <Link href="/events" className="text-muted-foreground mb-4 inline-block text-sm">
        ← Events
      </Link>
      {loading ? <p className="text-muted-foreground text-sm">Loading…</p> : null}
      {event ? (
        <div className="space-y-6">
          <div>
            <h1 className="text-xl font-medium">{event.title}</h1>
            <p className="text-muted-foreground text-sm">
              {event.eventTicker}
              {event.category ? ` · ${event.category}` : ''}
            </p>
          </div>
          <EventComparisonTable
            markets={event.markets}
            maxImplied={maxImplied}
            onSelectMarket={(ticker) => {
              setSelectedTicker(ticker);
              setSheetOpen(true);
            }}
          />
        </div>
      ) : null}
      <MarketDetailSheet
        ticker={selectedTicker}
        open={sheetOpen}
        onOpenChange={setSheetOpen}
        onDirtyChange={setHasUnsavedEdits}
      />
    </AppShell>
  );
}
