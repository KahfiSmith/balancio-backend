import { Router, type Router as ExpressRouter } from 'express';
import { authenticate } from '@/middleware/auth';
import * as Goal from '@/controllers/goalController';
import { validate } from '@/middleware/validate';
import { contributeSchema, createGoalSchema, goalQuerySchema, updateGoalSchema } from '@/validators/goalSchemas';

const router: ExpressRouter = Router();

router.get('/', authenticate, validate(goalQuerySchema, 'query'), Goal.list);
router.get('/progress', authenticate, Goal.progress);
router.get('/:id', authenticate, Goal.getById);
router.post('/', authenticate, validate(createGoalSchema), Goal.create);
router.put('/:id', authenticate, validate(updateGoalSchema), Goal.update);
router.delete('/:id', authenticate, Goal.remove);
router.post('/:id/contribute', authenticate, validate(contributeSchema), Goal.contribute);

router.get('/health', (_req, res) => {
  res.json({ message: 'Goal routes working' });
});

export default router;
