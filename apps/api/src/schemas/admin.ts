import { FOCUS_VALUES } from '@forcast-kit/core';
import { z } from 'zod';

export const marketPartialUpdateSchema = z.object({
  title: z.string().min(1).optional(),
  subtitle: z.string().optional(),
  status: z.string().min(1).optional(),
  yesBid: z.number().nullable().optional(),
  yesAsk: z.number().nullable().optional(),
  noBid: z.number().nullable().optional(),
  noAsk: z.number().nullable().optional(),
  lastPrice: z.number().nullable().optional(),
  isStale: z.boolean().optional(),
});

export const focusTagsUpdateSchema = z.object({
  focusTags: z.array(z.enum(FOCUS_VALUES)),
});

export type MarketPartialUpdate = z.infer<typeof marketPartialUpdateSchema>;
export type FocusTagsUpdate = z.infer<typeof focusTagsUpdateSchema>;
