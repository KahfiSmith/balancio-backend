import { Router } from 'express';

const router = Router();

// TODO: Implement expense routes
// GET /api/expenses
// GET /api/expenses/:id
// POST /api/expenses
// PUT /api/expenses/:id
// DELETE /api/expenses/:id
// GET /api/expenses/recurring
// POST /api/expenses/bulk

router.get('/health', (req, res) => {
  res.json({ message: 'Expense routes working' });
});

export default router;