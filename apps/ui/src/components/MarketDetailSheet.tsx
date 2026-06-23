'use client';

import { type MarketExportV1 } from '@/lib/constants';
import { useCallback, useEffect, useState } from 'react';
import { toast } from 'sonner';
import { Sheet, SheetBody, SheetContent, SheetHeader } from '@/components/ui/sheet';
import { fetchMarketDetail, fetchMarketExport, getMarketExportUrl, type MarketDetail } from '@/lib/api';
import { formatDate, formatNumber, formatPrice, formatSpread } from '@/lib/format';

function ExportPreview({ exportData }: { exportData: MarketExportV1 }) {
  return (
    <div className="space-y-2 text-sm">
      <p>
        <span className="text-muted-foreground">Implied:</span> {formatPrice(exportData.pricing.impliedProbability)}
      </p>
      <p>
        <span className="text-muted-foreground">Spread:</span> {formatSpread(exportData.pricing.spread)} · Mid{' '}
        {formatPrice(exportData.pricing.midPrice)}
      </p>
      <p>
        <span className="text-muted-foreground">Volume:</span> {formatNumber(exportData.liquidity.volume)} · OI{' '}
        {formatNumber(exportData.liquidity.openInterest)}
      </p>
      <p>
        <span className="text-muted-foreground">Close:</span> {formatDate(exportData.timing.closeTime)}
      </p>
      {exportData.rules.primary ? (
        <p className="text-muted-foreground whitespace-pre-wrap">{exportData.rules.primary}</p>
      ) : null}
    </div>
  );
}

export function MarketDetailSheet({
  ticker,
  open,
  onOpenChange,
}: {
  ticker: string | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const [detail, setDetail] = useState<MarketDetail | null>(null);
  const [exportData, setExportData] = useState<MarketExportV1 | null>(null);
  const [loading, setLoading] = useState(false);
  const [showRawJson, setShowRawJson] = useState(false);

  const load = useCallback(async (marketTicker: string) => {
    setLoading(true);
    try {
      const [market, exportJson] = await Promise.all([
        fetchMarketDetail(marketTicker),
        fetchMarketExport(marketTicker),
      ]);
      setDetail(market);
      setExportData(exportJson);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to load market');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (open && ticker) {
      void load(ticker);
    }
  }, [open, ticker, load]);

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        onClose={() => {
          onOpenChange(false);
        }}
      >
        <SheetHeader>
          <h2 className="text-base font-medium">{detail?.title ?? ticker ?? 'Market'}</h2>
          <p className="text-muted-foreground font-mono text-xs">{ticker}</p>
        </SheetHeader>
        <SheetBody>
          {loading ? <p className="text-muted-foreground text-sm">Loading…</p> : null}
          {!loading && detail ? (
            <div className="space-y-6">
              <section>
                <h3 className="mb-2 font-medium">Agent Export Preview</h3>
                {exportData ? <ExportPreview exportData={exportData} /> : null}
                {ticker ? (
                  <a
                    href={getMarketExportUrl(ticker)}
                    className="text-blue-600 mt-2 inline-block text-sm dark:text-blue-400"
                    target="_blank"
                    rel="noreferrer"
                  >
                    Open Export JSON
                  </a>
                ) : null}
              </section>

              <section>
                <h3 className="mb-2 font-medium">Sides</h3>
                <table className="comparison-table">
                  <thead>
                    <tr>
                      <th>Side</th>
                      <th>Bid</th>
                      <th>Ask</th>
                      <th>Price</th>
                    </tr>
                  </thead>
                  <tbody>
                    {detail.sides.map((side) => (
                      <tr key={side.id}>
                        <td>{side.label}</td>
                        <td>{formatPrice(side.bid)}</td>
                        <td>{formatPrice(side.ask)}</td>
                        <td>{formatPrice(side.price)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </section>

              <section>
                <h3 className="mb-2 font-medium">Timing & Liquidity</h3>
                <div className="text-sm space-y-1">
                  <p>
                    Open {formatDate(detail.openTime)} · Close {formatDate(detail.closeTime)}
                  </p>
                  <p>
                    Volume {formatNumber(detail.volume)} · 24h {formatNumber(detail.volume24h)}
                  </p>
                  <p>
                    Liquidity {formatNumber(detail.liquidity)} · OI {formatNumber(detail.openInterest)}
                  </p>
                  <p className="text-muted-foreground text-xs">
                    Updated {formatDate(detail.updatedAt)} · Last seen {formatDate(detail.lastSeenAt)}
                  </p>
                </div>
              </section>

              <section>
                <button
                  type="button"
                  className="text-sm font-medium"
                  onClick={() => {
                    setShowRawJson((current) => !current);
                  }}
                >
                  {showRawJson ? 'Hide Raw JSON' : 'Show Raw JSON'}
                </button>
                {showRawJson ? (
                  <pre className="bg-muted mt-2 overflow-x-auto rounded-lg p-3 text-xs">{detail.rawJson}</pre>
                ) : null}
              </section>
            </div>
          ) : null}
        </SheetBody>
      </SheetContent>
    </Sheet>
  );
}
