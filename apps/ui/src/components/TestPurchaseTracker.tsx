'use client';

import { useEffect, useMemo, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input, Label } from '@/components/ui/input';
import type { MarketDetail } from '@/lib/api';
import { formatContracts, formatDollars, formatPrice, formatReturnPercent } from '@/lib/format';
import {
  calculateKalshiPurchase,
  isTradeableMarketStatus,
  resolveMarketAskPrice,
  type PurchaseSide,
} from '@/lib/kalshi-purchase';
import { cn } from '@/lib/utils';

function formatLimitPriceInput(price: number | null): string {
  return price === null ? '' : (price * 100).toFixed(1);
}

function parseLimitPricePercent(value: string): number | null {
  const parsed = Number.parseFloat(value);
  if (!Number.isFinite(parsed) || parsed <= 0 || parsed >= 100) {
    return null;
  }
  return parsed / 100;
}

export function TestPurchaseTracker({ detail, expectedTicker }: { detail: MarketDetail; expectedTicker: string }) {
  const [side, setSide] = useState<PurchaseSide>('yes');
  const [bidAmount, setBidAmount] = useState('');
  const [limitPriceInput, setLimitPriceInput] = useState('');
  const [limitPriceEdited, setLimitPriceEdited] = useState(false);

  const yesAsk = resolveMarketAskPrice(detail.sides, 'yes', detail.yesAsk, detail.noAsk);
  const noAsk = resolveMarketAskPrice(detail.sides, 'no', detail.yesAsk, detail.noAsk);
  const askPrice = side === 'yes' ? yesAsk : noAsk;

  useEffect(() => {
    setSide('yes');
    setBidAmount('');
    setLimitPriceInput('');
    setLimitPriceEdited(false);
  }, [detail.ticker]);

  useEffect(() => {
    if (!limitPriceEdited) {
      setLimitPriceInput(formatLimitPriceInput(askPrice));
    }
  }, [askPrice, limitPriceEdited, side]);

  useEffect(() => {
    setLimitPriceEdited(false);
  }, [side, detail.ticker]);

  const spendDollars = Number.parseFloat(bidAmount);
  const limitPrice = parseLimitPricePercent(limitPriceInput);
  const estimate = useMemo(() => {
    if (!Number.isFinite(spendDollars) || limitPrice === null) {
      return null;
    }
    return calculateKalshiPurchase(spendDollars, limitPrice);
  }, [spendDollars, limitPrice]);

  if (detail.ticker !== expectedTicker) {
    return null;
  }

  if (!isTradeableMarketStatus(detail.status)) {
    return null;
  }

  return (
    <section className="border-border -mx-4 border-b px-4 pb-6">
      <h3 className="mb-1 font-medium">Test Purchase Tracker</h3>
      <p className="text-muted-foreground mb-2 text-sm">
        Estimates for <span className="font-mono text-foreground">{detail.ticker}</span> using the same live asks shown
        in the Sides table.
      </p>
      <p className="text-muted-foreground mb-4 text-xs tabular-nums">
        Yes ask {formatPrice(yesAsk)} · No ask {formatPrice(noAsk)}
      </p>

      <div className="mb-4 flex gap-2">
        {(['yes', 'no'] as const).map((option) => {
          const isSelected = side === option;
          return (
            <Button
              key={option}
              type="button"
              variant="outline"
              className={cn('bg-transparent hover:bg-muted/40', isSelected && 'border-foreground/40 bg-transparent')}
              onClick={() => {
                setSide(option);
              }}
            >
              {option === 'yes' ? 'Yes' : 'No'}
              <span className="text-muted-foreground ml-1 tabular-nums">
                ({formatPrice(option === 'yes' ? yesAsk : noAsk)})
              </span>
            </Button>
          );
        })}
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor={`test-purchase-bid-amount-${detail.ticker}`}>Bid Amount</Label>
          <Input
            id={`test-purchase-bid-amount-${detail.ticker}`}
            type="number"
            min="0"
            step="0.01"
            inputMode="decimal"
            placeholder="10.00"
            value={bidAmount}
            onChange={(event) => {
              setBidAmount(event.target.value);
            }}
          />
          <p className="text-muted-foreground text-xs">Dollars you want to spend on this side.</p>
        </div>

        <div className="space-y-2">
          <Label htmlFor={`test-purchase-limit-price-${detail.ticker}`}>Limit Price</Label>
          <Input
            id={`test-purchase-limit-price-${detail.ticker}`}
            type="number"
            min="0"
            max="100"
            step="0.1"
            inputMode="decimal"
            placeholder={askPrice === null ? '—' : formatLimitPriceInput(askPrice)}
            value={limitPriceInput}
            onChange={(event) => {
              setLimitPriceEdited(true);
              setLimitPriceInput(event.target.value);
            }}
          />
          <p className="text-muted-foreground text-xs">
            {askPrice === null
              ? 'No ask on this side — enter a limit price.'
              : `Defaults to this market's ${side} ask (${formatPrice(askPrice)}). Edit to model a lower bid.`}
          </p>
        </div>
      </div>

      {estimate ? (
        <dl className="mt-4 grid grid-cols-[minmax(6.5rem,auto)_1fr] gap-x-6 gap-y-2.5 text-sm">
          <dt className="text-muted-foreground">Contracts</dt>
          <dd className="tabular-nums">{formatContracts(estimate.contracts)}</dd>
          <dt className="text-muted-foreground">Cost</dt>
          <dd className="tabular-nums">{formatDollars(estimate.cost)}</dd>
          <dt className="text-muted-foreground">Payout If Win</dt>
          <dd className="tabular-nums font-medium">{formatDollars(estimate.payoutIfWin)}</dd>
          <dt className="text-muted-foreground">Profit If Win</dt>
          <dd className="tabular-nums">{formatDollars(estimate.profitIfWin)}</dd>
          <dt className="text-muted-foreground">Return</dt>
          <dd className="tabular-nums">{formatReturnPercent(estimate.returnOnCost)}</dd>
        </dl>
      ) : bidAmount.trim().length > 0 ? (
        <p className="text-muted-foreground mt-4 text-sm">
          Enter a valid bid amount and limit price between 0% and 100%.
        </p>
      ) : null}
    </section>
  );
}
