import { Router, type Router as ExpressRouter } from 'express';
import { authenticate } from '@/middleware/auth';
import * as Income from '@/controllers/incomeController';
import { validate } from '@/middleware/validate';
import { createIncomeSchema, incomeQuerySchema, updateIncomeSchema } from '@/validators/incomeSchemas';

const router: ExpressRouter = Router();

router.get('/', authenticate, validate(incomeQuerySchema, 'query'), Income.list);
router.get('/:id', authenticate, Income.getById);
router.post('/', authenticate, validate(createIncomeSchema), Income.create);
router.put('/:id', authenticate, validate(updateIncomeSchema), Income.update);
router.delete('/:id', authenticate, Income.remove);

router.get('/health', (_req, res) => {
  res.json({ message: 'Income routes working' });
});

export default router;
