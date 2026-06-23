'use client';

import Link from 'next/link';
import { Card, CardHeader, CardTitle } from '@/components/ui/card';
import type { EventRow } from '@/lib/api';
import { cn } from '@/lib/utils';

export function EventCard({ event, marketCount }: { event: EventRow; marketCount?: number }) {
  return (
    <Link href={`/events/${encodeURIComponent(event.eventTicker)}`}>
      <Card className={cn('transition-colors hover:bg-muted/50 dark:hover:bg-secondary hover:shadow-md')}>
        <CardHeader>
          <CardTitle>{event.title}</CardTitle>
          <p className="text-muted-foreground text-sm">
            {event.eventTicker}
            {event.category ? ` · ${event.category}` : ''}
            {marketCount !== undefined ? ` · ${String(marketCount)} markets` : ''}
          </p>
        </CardHeader>
      </Card>
    </Link>
  );
}
