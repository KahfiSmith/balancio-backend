import { z } from 'zod';

const goalCategoryEnum = z.enum(['emergency_fund','vacation','house','car','education','retirement','other']);
const goalStatusEnum = z.enum(['active','completed','paused','cancelled']);

export const goalQuerySchema = z.object({
  page: z.coerce.number().min(1).optional(),
  limit: z.coerce.number().min(1).max(100).optional(),
  sort: z.enum(['targetDate','createdAt','targetAmount','currentAmount']).optional(),
  order: z.enum(['asc','desc']).optional(),
  status: goalStatusEnum.optional(),
  category: goalCategoryEnum.optional(),
  search: z.string().optional(),
});

export const createGoalSchema = z.object({
  name: z.string().min(1).max(100),
  description: z.string().max(500).optional(),
  targetAmount: z.number().positive(),
  currentAmount: z.number().min(0).optional(),
  targetDate: z.coerce.date(),
  status: goalStatusEnum.optional(),
  category: goalCategoryEnum.optional(),
  milestones: z.array(z.object({
    amount: z.number().positive(),
    note: z.string().max(200).optional(),
    achievedAt: z.coerce.date().optional(),
  })).optional(),
  contributions: z.array(z.object({
    amount: z.number().positive(),
    date: z.coerce.date().optional(),
    note: z.string().max(200).optional(),
  })).optional(),
});

export const updateGoalSchema = createGoalSchema.partial();

export const contributeSchema = z.object({
  amount: z.number().positive(),
  date: z.coerce.date().optional(),
  note: z.string().max(200).optional(),
});

