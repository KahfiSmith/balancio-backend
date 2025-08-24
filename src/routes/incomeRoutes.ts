import { Router } from 'express';

const router = Router();

// TODO: Implement income routes
// GET /api/income
// GET /api/income/:id
// POST /api/income
// PUT /api/income/:id
// DELETE /api/income/:id
// GET /api/income/recurring

router.get('/health', (req, res) => {
  res.json({ message: 'Income routes working' });
});

export default router;