import { Router } from 'express';

const router = Router();

// TODO: Implement analytics routes
// GET /api/analytics/spending-trends
// GET /api/analytics/category-breakdown
// GET /api/analytics/monthly-summary
// GET /api/analytics/yearly-summary
// GET /api/analytics/financial-health
// GET /api/analytics/budget-performance

router.get('/health', (req, res) => {
  res.json({ message: 'Analytics routes working' });
});

export default router;