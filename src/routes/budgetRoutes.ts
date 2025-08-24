import { Router } from 'express';

const router = Router();

// TODO: Implement budget routes
// GET /api/budgets
// GET /api/budgets/:id
// POST /api/budgets
// PUT /api/budgets/:id
// DELETE /api/budgets/:id
// GET /api/budgets/alerts

router.get('/health', (req, res) => {
  res.json({ message: 'Budget routes working' });
});

export default router;