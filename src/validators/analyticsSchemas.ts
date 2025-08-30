import { z } from 'zod';

export const rangeSchema = z.object({
  startDate: z.coerce.date().optional(),
  endDate: z.coerce.date().optional(),
});

export const trendsSchema = rangeSchema.extend({
  months: z.coerce.number().min(1).max(36).optional(),
});

export const monthlySummarySchema = z.object({
  months: z.coerce.number().min(1).max(36).optional(),
});

export const yearlySummarySchema = z.object({
  years: z.coerce.number().min(1).max(10).optional(),
});

