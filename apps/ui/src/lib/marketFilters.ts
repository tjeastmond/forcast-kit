export interface MarketFilterState {
  searchQuery: string;
  focus: Set<string>;
  category: Set<string>;
  tag: Set<string>;
  status: Set<string>;
}

function firstSelected(values: Set<string>): string | undefined {
  for (const value of values) {
    return value;
  }
  return undefined;
}

export function filtersToQueryParams(filters: MarketFilterState): {
  focus?: string;
  category?: string;
  tag?: string;
  status?: string;
  q?: string;
} {
  const category = firstSelected(filters.category);
  const tag = firstSelected(filters.tag);

  return {
    ...(filters.focus.size > 0 ? { focus: [...filters.focus].join(',') } : {}),
    ...(category !== undefined ? { category } : {}),
    ...(tag !== undefined ? { tag } : {}),
    ...(filters.status.size === 1 ? { status: [...filters.status][0] } : {}),
    ...(filters.searchQuery.trim() ? { q: filters.searchQuery.trim() } : {}),
  };
}

export function hasActiveMarketFilters(filters: MarketFilterState): boolean {
  return (
    filters.searchQuery.trim().length > 0 ||
    filters.focus.size > 0 ||
    filters.category.size > 0 ||
    filters.tag.size > 0 ||
    filters.status.size > 0
  );
}

export const emptyMarketFilters = (): MarketFilterState => ({
  searchQuery: '',
  focus: new Set(),
  category: new Set(),
  tag: new Set(),
  status: new Set(),
});
