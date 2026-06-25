export function marketDisplayTitle(market: { readonly title: string; readonly subtitle: string }): string {
  const subtitle = market.subtitle.trim();
  return subtitle.length > 0 ? subtitle : market.title;
}

export function formatPrice(value: number | null | undefined): string {
  if (value === null || value === undefined) {
    return '—';
  }
  return `${(value * 100).toFixed(1)}%`;
}

export function formatNumber(value: number | null | undefined): string {
  if (value === null || value === undefined) {
    return '—';
  }
  return value.toLocaleString();
}

export function formatDate(value: string | null | undefined): string {
  if (!value) {
    return '—';
  }
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return value;
  }
  return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });
}

export function formatDollars(value: number | null | undefined): string {
  if (value === null || value === undefined) {
    return '—';
  }
  return value.toLocaleString(undefined, {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

export function formatContracts(value: number | null | undefined): string {
  if (value === null || value === undefined) {
    return '—';
  }
  return value.toLocaleString(undefined, { maximumFractionDigits: 4 });
}

export function formatReturnPercent(value: number | null | undefined): string {
  if (value === null || value === undefined) {
    return '—';
  }
  return `${(value * 100).toFixed(1)}%`;
}

export function formatSpread(value: number | null | undefined): string {
  if (value === null || value === undefined) {
    return '—';
  }
  return `${(value * 100).toFixed(2)}¢`;
}

export function formatRawJsonForDisplay(rawJson: string): string {
  try {
    return JSON.stringify(JSON.parse(rawJson) as unknown, null, 2);
  } catch {
    return rawJson;
  }
}
