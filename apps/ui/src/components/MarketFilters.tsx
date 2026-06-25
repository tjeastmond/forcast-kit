'use client';

import { FOCUS_VALUES } from '@/lib/constants';
import { fetchTaxonomy, type TaxonomyResponse } from '@/lib/api';
import { SearchIcon, XIcon } from 'lucide-react';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { MultiSelectFilter } from '@/components/MultiSelectFilter';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { FILTER_ROW_CLASS, buildFilterItems } from '@/lib/filterControls';
import { type MarketFilterState } from '@/lib/marketFilters';
import { cn } from '@/lib/utils';

const STATUS_OPTIONS = ['open', 'closed', 'settled', 'active', 'unopened'] as const;

let taxonomyCache: Promise<TaxonomyResponse> | null = null;

function fetchTaxonomyCached(): Promise<TaxonomyResponse> {
  taxonomyCache ??= fetchTaxonomy().catch((error: unknown) => {
    taxonomyCache = null;
    throw error;
  });
  return taxonomyCache;
}

export function MarketFilters({
  filters,
  onFiltersChange,
  onClear,
  hasActiveFilters,
  searchInputRef,
  variant = 'markets',
}: {
  filters: MarketFilterState;
  onFiltersChange: (next: MarketFilterState) => void;
  onClear: () => void;
  hasActiveFilters: boolean;
  searchInputRef?: React.RefObject<HTMLInputElement | null>;
  variant?: 'markets' | 'events';
}) {
  const [categoryOptions, setCategoryOptions] = useState<{ value: string; label: string }[]>([]);
  const [tagOptions, setTagOptions] = useState<{ value: string; label: string }[]>([]);

  useEffect(() => {
    void fetchTaxonomyCached()
      .then((taxonomy) => {
        setCategoryOptions(taxonomy.categories.map((entry) => ({ value: entry.name, label: entry.name })));
        const tags = new Set<string>();
        for (const entry of taxonomy.categories) {
          for (const tag of entry.tags) {
            tags.add(tag);
          }
        }
        setTagOptions([...tags].sort().map((tag) => ({ value: tag, label: tag })));
      })
      .catch((error: unknown) => {
        setCategoryOptions([]);
        setTagOptions([]);
        toast.error(error instanceof Error ? error.message : 'Failed to load categories and tags');
      });
  }, []);

  const searchPlaceholder = variant === 'events' ? 'Search Events…' : 'Search Markets…';
  const searchAriaLabel = variant === 'events' ? 'Search Events' : 'Search Markets';

  return (
    <div className="mb-6 space-y-2">
      <div className="relative">
        <SearchIcon className="text-muted-foreground pointer-events-none absolute top-1/2 left-2.5 size-3.5 -translate-y-1/2" />
        <Input
          ref={searchInputRef}
          type="search"
          value={filters.searchQuery}
          onChange={(event) => {
            onFiltersChange({ ...filters, searchQuery: event.target.value });
          }}
          placeholder={searchPlaceholder}
          className="pl-8"
          aria-label={searchAriaLabel}
        />
      </div>
      <div className={FILTER_ROW_CLASS}>
        <MultiSelectFilter
          items={buildFilterItems(FOCUS_VALUES, { sort: true })}
          selected={filters.focus}
          onSelectedChange={(focus) => {
            onFiltersChange({ ...filters, focus });
          }}
          emptyLabel="Filter By Focus"
          pluralNoun="focus tags"
        />
        <MultiSelectFilter
          items={categoryOptions}
          selected={filters.category}
          onSelectedChange={(category) => {
            onFiltersChange({ ...filters, category });
          }}
          emptyLabel="Filter By Category"
          pluralNoun="categories"
        />
        <span className={cn(!hasActiveFilters && 'cursor-not-allowed')}>
          <Button
            variant="outline"
            size="icon"
            disabled={!hasActiveFilters}
            onClick={onClear}
            className={cn(hasActiveFilters && 'border-destructive/30 bg-red-50 text-white dark:bg-red-950/40')}
            aria-label="Clear Filters"
          >
            <XIcon className={cn('size-4', hasActiveFilters ? 'text-red-600' : 'text-muted-foreground')} />
          </Button>
        </span>
      </div>
      <div className={FILTER_ROW_CLASS}>
        <MultiSelectFilter
          items={tagOptions}
          selected={filters.tag}
          onSelectedChange={(tag) => {
            onFiltersChange({ ...filters, tag });
          }}
          emptyLabel="Filter By Tag"
          pluralNoun="tags"
        />
        <MultiSelectFilter
          items={buildFilterItems(STATUS_OPTIONS)}
          selected={filters.status}
          onSelectedChange={(status) => {
            onFiltersChange({ ...filters, status });
          }}
          emptyLabel="Filter By Status"
          pluralNoun="statuses"
        />
        <span aria-hidden="true" className="size-8 shrink-0" />
      </div>
      <hr className="border-border" />
    </div>
  );
}
