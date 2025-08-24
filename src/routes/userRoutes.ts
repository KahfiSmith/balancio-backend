import { Router } from 'express';

const router = Router();

// TODO: Implement user routes
// GET /api/users/profile
// PUT /api/users/profile
// PUT /api/users/password
// PUT /api/users/preferences
// DELETE /api/users/account

router.get('/health', (req, res) => {
  res.json({ message: 'User routes working' });
});

export default router;