import { Router, type Router as ExpressRouter } from 'express';
import { authenticate } from '@/middleware/auth';
import * as Expense from '@/controllers/expenseController';
import { validate } from '@/middleware/validate';
import { createExpenseSchema, expenseQuerySchema, updateExpenseSchema } from '@/validators/expenseSchemas';

const router: ExpressRouter = Router();

router.get('/', authenticate, validate(expenseQuerySchema, 'query'), Expense.list);
router.get('/:id', authenticate, Expense.getById);
router.post('/', authenticate, validate(createExpenseSchema), Expense.create);
router.put('/:id', authenticate, validate(updateExpenseSchema), Expense.update);
router.delete('/:id', authenticate, Expense.remove);

router.get('/health', (_req, res) => {
  res.json({ message: 'Expense routes working' });
});

export default router;
