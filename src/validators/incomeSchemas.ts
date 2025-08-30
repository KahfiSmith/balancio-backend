import { z } from 'zod';

export const incomeQuerySchema = z.object({
  page: z.coerce.number().min(1).optional(),
  limit: z.coerce.number().min(1).max(100).optional(),
  sort: z.enum(['date','amount','createdAt']).optional(),
  order: z.enum(['asc','desc']).optional(),
  categoryId: z.string().optional(),
  startDate: z.coerce.date().optional(),
  endDate: z.coerce.date().optional(),
  minAmount: z.coerce.number().optional(),
  maxAmount: z.coerce.number().optional(),
  search: z.string().optional(),
});

export const createIncomeSchema = z.object({
  categoryId: z.string().min(1),
  title: z.string().min(1).max(100),
  description: z.string().max(500).optional(),
  amount: z.number().positive(),
  date: z.coerce.date().optional(),
  source: z.enum(['salary','freelance','investment','business','gift','other']).optional(),
  tags: z.array(z.string()).optional(),
  isRecurring: z.boolean().optional(),
  recurrence: z.object({
    type: z.enum(['daily','weekly','monthly','yearly']),
    interval: z.number().int().min(1),
    endDate: z.coerce.date().optional(),
    nextDate: z.coerce.date().optional(),
  }).optional(),
});

export const updateIncomeSchema = createIncomeSchema.partial();

