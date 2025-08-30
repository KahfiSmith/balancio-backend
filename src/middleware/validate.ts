import { Request, Response, NextFunction } from 'express';
import { ZodSchema, ZodError } from 'zod';
import { ApiResponse } from '@/types';

type Part = 'body' | 'query' | 'params';

export const validate = (schema: ZodSchema, part: Part = 'body') => (
  req: Request,
  res: Response<ApiResponse>,
  next: NextFunction
) => {
  try {
    const data = (req as any)[part];
    const parsed = schema.parse(data);
    (req as any)[part] = parsed;
    next();
  } catch (err) {
    if (err instanceof ZodError) {
      const message = err.issues.map(i => `${i.path.join('.')}: ${i.message}`).join('; ');
      res.status(400).json({ success: false, message });
      return;
    }
    next(err);
  }
};

