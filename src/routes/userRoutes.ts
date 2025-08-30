import { Router, type Router as ExpressRouter } from 'express';
import { authenticate } from '@/middleware/auth';
import * as UserController from '@/controllers/userController';
import { validate } from '@/middleware/validate';
import { updatePasswordSchema, updatePreferencesSchema, updateProfileSchema } from '@/validators/userSchemas';

const router: ExpressRouter = Router();

router.get('/profile', authenticate, UserController.getProfile);
router.put('/profile', authenticate, validate(updateProfileSchema), UserController.updateProfile);
router.put('/password', authenticate, validate(updatePasswordSchema), UserController.updatePassword);
router.put('/preferences', authenticate, validate(updatePreferencesSchema), UserController.updatePreferences);
router.delete('/account', authenticate, UserController.deleteAccount);

// Health check
router.get('/health', (_req, res) => {
  res.json({ message: 'User routes working' });
});

export default router;
