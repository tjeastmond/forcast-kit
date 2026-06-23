export const FILTER_CONTROL_HEIGHT_CLASS = 'h-8';

export const FILTER_TRIGGER_BUTTON_CLASS =
  'h-8 w-full min-w-0 justify-between gap-2 px-2.5 font-normal active:translate-y-0';

export const FILTER_ROW_CLASS = 'grid w-full grid-cols-[minmax(0,1fr)_minmax(0,1fr)_auto] items-center gap-2';

export const FILTER_DROPDOWN_PANEL_CLASS =
  'bg-popover absolute top-full z-50 mt-1 max-h-64 w-full overflow-y-auto overscroll-contain rounded-lg border p-2 shadow-lg';

export function formatFilterOptionLabel(value: string): string {
  if (value.length === 0) {
    return value;
  }

  return value.charAt(0).toUpperCase() + value.slice(1);
}

export function buildFilterItems<T extends string>(
  values: readonly T[],
  options?: { sort?: boolean },
): { value: T; label: string }[] {
  const items = options?.sort ? [...values].sort((a, b) => a.localeCompare(b)) : [...values];
  return items.map((value) => ({ value, label: formatFilterOptionLabel(value) }));
}

export function toggleSetSelection<T extends string>(selected: Set<T>, value: T, checked: boolean): Set<T> {
  const next = new Set(selected);
  if (checked) {
    next.add(value);
  } else {
    next.delete(value);
  }
  return next;
}
