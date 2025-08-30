import { Router, type Router as ExpressRouter } from 'express';
import { authenticate } from '@/middleware/auth';
import * as Budget from '@/controllers/budgetController';
import { validate } from '@/middleware/validate';
import { budgetQuerySchema, createBudgetSchema, updateBudgetSchema } from '@/validators/budgetSchemas';

const router: ExpressRouter = Router();

router.get('/', authenticate, validate(budgetQuerySchema, 'query'), Budget.list);
router.get('/performance', authenticate, Budget.performance);
router.get('/:id', authenticate, Budget.getById);
router.post('/', authenticate, validate(createBudgetSchema), Budget.create);
router.put('/:id', authenticate, validate(updateBudgetSchema), Budget.update);
router.delete('/:id', authenticate, Budget.remove);

router.get('/health', (_req, res) => {
  res.json({ message: 'Budget routes working' });
});

export default router;
