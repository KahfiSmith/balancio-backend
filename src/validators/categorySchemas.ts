import { z } from 'zod';

export const createCategorySchema = z.object({
  name: z.string().min(1).max(50),
  description: z.string().max(200).optional(),
  icon: z.string().min(1),
  color: z.string().regex(/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/),
  type: z.enum(['expense', 'income']),
});

export const updateCategorySchema = createCategorySchema.partial();

