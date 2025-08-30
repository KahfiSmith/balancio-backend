import { Router, type Router as ExpressRouter } from 'express';
import { authenticate } from '@/middleware/auth';
import * as Category from '@/controllers/categoryController';
import { validate } from '@/middleware/validate';
import { createCategorySchema, updateCategorySchema } from '@/validators/categorySchemas';

const router: ExpressRouter = Router();

router.get('/', authenticate, Category.listAll);
router.get('/default', authenticate, Category.listDefault);
router.get('/:id', authenticate, Category.getById);
router.post('/', authenticate, validate(createCategorySchema), Category.create);
router.put('/:id', authenticate, validate(updateCategorySchema), Category.update);
router.delete('/:id', authenticate, Category.remove);

router.get('/health', (_req, res) => {
  res.json({ message: 'Category routes working' });
});

export default router;
