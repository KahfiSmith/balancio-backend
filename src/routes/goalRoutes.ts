import { Router } from 'express';

const router = Router();

// TODO: Implement goal routes
// GET /api/goals
// GET /api/goals/:id
// POST /api/goals
// PUT /api/goals/:id
// DELETE /api/goals/:id
// POST /api/goals/:id/contribute
// GET /api/goals/progress

router.get('/health', (req, res) => {
  res.json({ message: 'Goal routes working' });
});

export default router;