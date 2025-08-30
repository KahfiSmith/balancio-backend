import { Router, type Router as ExpressRouter } from 'express';
import * as Auth from '@/controllers/authController';
import { validate } from '@/middleware/validate';
import { loginSchema, refreshSchema, registerSchema } from '@/validators/authSchemas';

const router: ExpressRouter = Router();

router.post('/register', validate(registerSchema), Auth.register);
router.post('/login', validate(loginSchema), Auth.login);
router.post('/refresh', validate(refreshSchema), Auth.refresh);
router.post('/logout', Auth.logout);

// Stubs for upcoming features
router.get('/health', (_req, res) => {
  res.json({ message: 'Auth routes working' });
});

export default router;
