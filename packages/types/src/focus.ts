export type Focus =
  | 'politics'
  | 'politicians'
  | 'mentions'
  | 'weather'
  | 'economics'
  | 'technology'
  | 'crypto'
  | 'entertainment'
  | 'sports';

export const FOCUS_VALUES = [
  'politics',
  'politicians',
  'mentions',
  'weather',
  'economics',
  'technology',
  'crypto',
  'entertainment',
  'sports',
] as const satisfies readonly Focus[];
