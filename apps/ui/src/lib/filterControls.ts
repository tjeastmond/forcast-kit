export const FILTER_CONTROL_HEIGHT_CLASS = 'h-8';

export const FILTER_TRIGGER_BUTTON_CLASS =
  'h-8 w-full min-w-0 justify-between gap-2 px-2.5 font-normal active:translate-y-0';

export const FILTER_ROW_CLASS = 'grid w-full grid-cols-[minmax(0,1fr)_minmax(0,1fr)_auto] items-center gap-2';

export function toggleSetSelection<T extends string>(selected: Set<T>, value: T, checked: boolean): Set<T> {
  const next = new Set(selected);
  if (checked) {
    next.add(value);
  } else {
    next.delete(value);
  }
  return next;
}
