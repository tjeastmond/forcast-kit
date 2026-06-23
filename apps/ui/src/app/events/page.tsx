import { Suspense } from 'react';
import { EventsPageClient, EventsPageFallback } from '@/components/EventsPageClient';

export default function EventsPage() {
  return (
    <Suspense fallback={<EventsPageFallback />}>
      <EventsPageClient />
    </Suspense>
  );
}
