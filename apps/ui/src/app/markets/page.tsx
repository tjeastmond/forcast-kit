'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { toast } from 'sonner';
import { AppShell } from '@/components/AppShell';
import { MarketCard } from '@/components/MarketCard';
import {
  MarketFilters,
  emptyMarketFilters,
  filtersToQueryParams,
  hasActiveMarketFilters,
  type MarketFilterState,
} from '@/components/MarketFilters';
import { MarketDetailSheet } from '@/components/MarketDetailSheet';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { fetchMarkets, type MarketSummary } from '@/lib/api';

const PAGE_SIZES = [5, 10, 20, 50] as const;

export default function MarketsPage() {
  const [filters, setFilters] = useState<MarketFilterState>(emptyMarketFilters);
  const [markets, setMarkets] = useState<readonly MarketSummary[]>([]);
  const [nextCursor, setNextCursor] = useState<string | null>(null);
  const [pageSize, setPageSize] = useState<number>(10);
  const [loading, setLoading] = useState(true);
  const [selectedTicker, setSelectedTicker] = useState<string | null>(null);
  const [sheetOpen, setSheetOpen] = useState(false);
  const [hasUnsavedEdits, setHasUnsavedEdits] = useState(false);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const cursorStack = useRef<(string | null)[]>([null]);

  const loadMarkets = useCallback(
    async (options?: { cursor?: string | null; resetStack?: boolean }) => {
      setLoading(true);
      try {
        const result = await fetchMarkets({
          ...filtersToQueryParams(filters),
          limit: pageSize,
          ...(options?.cursor ? { cursor: options.cursor } : {}),
        });
        setMarkets(result.markets);
        setNextCursor(result.cursor);
        if (options?.resetStack) {
          cursorStack.current = [null];
        }
      } catch (error) {
        toast.error(error instanceof Error ? error.message : 'Failed to load markets');
        setMarkets([]);
      } finally {
        setLoading(false);
      }
    },
    [filters, pageSize],
  );

  useEffect(() => {
    void loadMarkets({ resetStack: true });
  }, [loadMarkets]);

  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === '/' && !sheetOpen && document.activeElement?.tagName !== 'INPUT') {
        event.preventDefault();
        searchInputRef.current?.focus();
      }
      if (event.key === 'Escape') {
        setFilters(emptyMarketFilters());
      }
    }
    window.addEventListener('keydown', onKeyDown);
    return () => {
      window.removeEventListener('keydown', onKeyDown);
    };
  }, [sheetOpen]);

  function openMarket(ticker: string) {
    setSelectedTicker(ticker);
    setSheetOpen(true);
  }

  return (
    <AppShell
      hasUnsavedEdits={hasUnsavedEdits}
      onTitleClick={() => {
        setFilters(emptyMarketFilters());
        void loadMarkets({ resetStack: true });
      }}
    >
      <MarketFilters
        filters={filters}
        onFiltersChange={setFilters}
        onClear={() => {
          setFilters(emptyMarketFilters());
        }}
        hasActiveFilters={hasActiveMarketFilters(filters)}
        searchInputRef={searchInputRef}
      />

      <div className="mb-4 flex items-center justify-between gap-2">
        <p className="text-muted-foreground text-sm">{loading ? 'Loading…' : `${String(markets.length)} markets`}</p>
        <div className="flex items-center gap-2">
          <select
            className="border-input h-8 rounded-lg border px-2 text-sm"
            value={pageSize}
            onChange={(event) => {
              setPageSize(Number.parseInt(event.target.value, 10));
            }}
          >
            {PAGE_SIZES.map((size) => (
              <option key={size} value={size}>
                {size} / page
              </option>
            ))}
          </select>
          <Button
            variant="outline"
            disabled={cursorStack.current.length <= 1}
            onClick={() => {
              cursorStack.current.pop();
              const previous = cursorStack.current[cursorStack.current.length - 1] ?? null;
              void loadMarkets({ ...(previous !== null ? { cursor: previous } : {}) });
            }}
          >
            Prev
          </Button>
          <Button
            variant="outline"
            disabled={!nextCursor}
            onClick={() => {
              if (nextCursor) {
                cursorStack.current.push(nextCursor);
                void loadMarkets({ cursor: nextCursor });
              }
            }}
          >
            Next
          </Button>
        </div>
      </div>

      <div className="space-y-4">
        {loading
          ? [1, 2, 3].map((key) => <Card key={key} className="h-24 animate-pulse" />)
          : markets.map((market) => <MarketCard key={market.ticker} market={market} onOpen={openMarket} />)}
        {!loading && markets.length === 0 ? (
          <Card className="p-8 text-center">
            <p className="text-muted-foreground mb-4">No markets found. Run a sync to populate data.</p>
          </Card>
        ) : null}
      </div>

      <MarketDetailSheet
        ticker={selectedTicker}
        open={sheetOpen}
        onOpenChange={setSheetOpen}
        onDirtyChange={setHasUnsavedEdits}
      />
    </AppShell>
  );
}
