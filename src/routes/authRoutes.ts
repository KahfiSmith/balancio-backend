import { Router } from 'express';

const router = Router();

// TODO: Implement auth routes
// POST /api/auth/register
// POST /api/auth/login
// POST /api/auth/refresh
// POST /api/auth/logout
// POST /api/auth/forgot-password
// POST /api/auth/reset-password
// POST /api/auth/verify-email

router.get('/health', (req, res) => {
  res.json({ message: 'Auth routes working' });
});

export default router;