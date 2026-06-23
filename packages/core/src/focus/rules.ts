import type { Focus, NormalizedMarket, SeriesMetadata } from '../types/index.js';
import rulesJson from './rules.json' with { type: 'json' };

export interface FocusRule {
  readonly kalshiCategories: readonly string[];
  readonly kalshiTags: readonly string[];
  readonly seriesPrefixes: readonly string[];
  readonly keywords: readonly string[];
}

export type FocusRules = Record<Focus, FocusRule>;

export interface FocusDerivationContext {
  readonly seriesMetadata?: SeriesMetadata;
}

const RULES = rulesJson as FocusRules;

function textIncludesKeyword(text: string, keyword: string): boolean {
  return text.toLowerCase().includes(keyword.toLowerCase());
}

function escapeRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function textMatchesKeyword(text: string, keyword: string): boolean {
  const pattern = new RegExp(`\\b${escapeRegExp(keyword)}\\b`, 'i');
  return pattern.test(text);
}

function matchesCategory(category: string | null, ruleCategories: readonly string[]): boolean {
  if (!category || ruleCategories.length === 0) {
    return false;
  }
  return ruleCategories.some((ruleCategory) => textIncludesKeyword(category, ruleCategory));
}

function matchesKalshiTags(tags: readonly string[], ruleTags: readonly string[]): boolean {
  if (ruleTags.length === 0 || tags.length === 0) {
    return false;
  }
  return ruleTags.some((ruleTag) => tags.some((tag) => textIncludesKeyword(tag, ruleTag)));
}

function matchesSeriesPrefix(seriesTicker: string, prefixes: readonly string[]): boolean {
  return prefixes.some((prefix) => seriesTicker.startsWith(prefix));
}

function matchesKeywords(market: NormalizedMarket, keywords: readonly string[]): boolean {
  const searchText = [market.title, market.subtitle, market.ticker, market.eventTicker].join(' ');
  return keywords.some((keyword) => textMatchesKeyword(searchText, keyword));
}

function resolveCategory(market: NormalizedMarket, context?: FocusDerivationContext): string | null {
  return market.category ?? context?.seriesMetadata?.category ?? null;
}

function resolveTags(context?: FocusDerivationContext): readonly string[] {
  return context?.seriesMetadata?.tags ?? [];
}

export function deriveFocusTags(market: NormalizedMarket, context?: FocusDerivationContext): Focus[] {
  const tags: Focus[] = [];
  const category = resolveCategory(market, context);
  const kalshiTags = resolveTags(context);

  for (const focus of Object.keys(RULES) as Focus[]) {
    const rule = RULES[focus];
    const categoryMatch = matchesCategory(category, rule.kalshiCategories);
    const kalshiTagMatch = matchesKalshiTags(kalshiTags, rule.kalshiTags);
    const seriesMatch = matchesSeriesPrefix(market.seriesTicker, rule.seriesPrefixes);
    const keywordMatch = matchesKeywords(market, rule.keywords);

    if (focus === 'sports' && category?.toLowerCase().includes('sport')) {
      tags.push('sports');
      continue;
    }

    if (categoryMatch || kalshiTagMatch || seriesMatch || keywordMatch) {
      tags.push(focus);
    }
  }

  return tags;
}

export interface FocusFilterOptions {
  readonly focus?: readonly Focus[];
  readonly exclude?: readonly Focus[];
}

export function matchesFocusFilter(tags: readonly Focus[], options: FocusFilterOptions): boolean {
  const focus = options.focus ?? [];
  const exclude = options.exclude ?? [];

  if (focus.length > 0 && !focus.some((value) => tags.includes(value))) {
    return false;
  }

  if (exclude.length > 0 && exclude.some((value) => tags.includes(value))) {
    return false;
  }

  return true;
}

export function shouldPersistMarket(
  market: NormalizedMarket,
  tags: readonly Focus[],
  options: FocusFilterOptions,
): boolean {
  const hasFilter = (options.focus?.length ?? 0) > 0 || (options.exclude?.length ?? 0) > 0;
  if (!hasFilter) {
    return true;
  }
  return matchesFocusFilter(tags, options);
}
