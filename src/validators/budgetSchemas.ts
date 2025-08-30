import { z } from 'zod';

export const budgetQuerySchema = z.object({
  page: z.coerce.number().min(1).optional(),
  limit: z.coerce.number().min(1).max(100).optional(),
  sort: z.enum(['startDate','endDate','amount','createdAt']).optional(),
  order: z.enum(['asc','desc']).optional(),
  period: z.enum(['monthly','quarterly','yearly']).optional(),
  active: z.coerce.boolean().optional(),
});

export const createBudgetSchema = z.object({
  categoryId: z.string().optional(),
  name: z.string().min(1).max(100),
  description: z.string().max(500).optional(),
  amount: z.number().positive(),
  spent: z.number().min(0).optional(),
  period: z.enum(['monthly','quarterly','yearly']),
  startDate: z.coerce.date(),
  endDate: z.coerce.date(),
  alertThreshold: z.number().min(0).max(100).optional(),
  notifications: z.object({
    enabled: z.boolean().optional(),
    thresholds: z.array(z.number().min(0).max(100)).optional(),
  }).optional(),
});

export const updateBudgetSchema = createBudgetSchema.partial();

